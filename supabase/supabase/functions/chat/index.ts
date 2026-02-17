import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { parse } from "https://esm.sh/best-effort-json-parser";
import { corsHeaders } from "../_shard/cors.ts";

// --- Configuration & Constants ---
const ENV = {
  ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY"),
  OPENAI_KEY: Deno.env.get("OPENAI_API_KEY"),
  OPENAI_MODEL: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o",
  SUPABASE_URL: Deno.env.get("SUPABASE_URL"),
  SUPABASE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
};

const STREAM_HEADERS = {
  ...corsHeaders,
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

// --- Types ---
type OpenAIMessage = { role: "system" | "user" | "assistant"; content: string };

interface ToolCallState {
  id: string;
  name?: string;
  argsText: string;
}

// --- Helper Functions ---

const isValidBuildOp = (op: any): boolean => {
  if (!op || typeof op !== "object" || typeof op.op !== "string") return false;
  switch (op.op) {
    case "reset":
      return true;
    case "updateRoot":
      return op.props && typeof op.props === "object";
    case "add":
      return (
        typeof op.type === "string" &&
        op.type.length > 0 &&
        typeof op.id === "string" &&
        op.id.length > 0 &&
        typeof op.index === "number" &&
        typeof op.zone === "string" &&
        op.zone.length > 0
      );
    case "update":
      return (
        typeof op.id === "string" &&
        op.id.length > 0 &&
        op.props &&
        typeof op.props === "object"
      );
    case "move":
      return (
        typeof op.id === "string" &&
        op.id.length > 0 &&
        typeof op.index === "number" &&
        typeof op.zone === "string" &&
        op.zone.length > 0
      );
    case "delete":
      return typeof op.id === "string" && op.id.length > 0;
    default:
      return false;
  }
};

/**
 * Normalizes zone for a single "add" op: UI expects "parentId:slot" (e.g. "root:default-zone").
 * Bare "content" or missing zone → root-level "root:default-zone".
 */
function normalizeTransientZone(op: any): string {
  const z = op?.zone;
  if (z != null && typeof z === "string" && z.includes(":")) return z;
  return "root:default-zone";
}

/**
 * Manages the SSE stream and Puck-specific message formatting
 */
class PuckStreamManager {
  private encoder = new TextEncoder();
  private resetSent = new Set<string>();
  /** Zuletzt in tool-input-available gesendete description (nur einmal senden wenn stabil). */
  private lastSentDescription = new Map<string, string>();
  /** Description aus dem vorherigen Chunk (zum Erkennen, ob description stabil ist). */
  private previousDescription = new Map<string, string>();
  /** Ob für diesen Tool-Call schon "Creating page..." (data-tool-status) beim ersten build gesendet wurde. */
  private buildStatusSent = new Set<string>();
  /** Pro Tool-Call + Op-Key zuletzt gesendetes Payload (um exakte Duplikate zu vermeiden). */
  private lastSentPayloadByOp = new Map<string, string>();
  /** Track add ops sent per toolCallId+component id (add should only be sent once). */
  private addSentByToolCall = new Map<string, Set<string>>();
  /** Track last build array length per toolCallId. */
  private lastBuildLengthByToolCall = new Map<string, number>();

  constructor(private controller: ReadableStreamDefaultController) {}

  send(data: unknown) {
    this.controller.enqueue(
      this.encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
    );
  }

  sendToolStatus(toolCallId: string, label: string, loading: boolean) {
    this.send({
      type: "data-tool-status",
      id: toolCallId,
      data: { toolCallId, status: { loading, label } },
    });
  }

  sendToolInputDelta(toolCallId: string, delta: string) {
    this.send({
      type: "tool-input-delta",
      toolCallId,
      inputTextDelta: delta,
    });
  }

  hasResetSent(toolCallId: string): boolean {
    return this.resetSent.has(toolCallId);
  }

  markResetSent(toolCallId: string) {
    this.resetSent.add(toolCallId);
  }

  getLastSentDescription(toolCallId: string): string | undefined {
    return this.lastSentDescription.get(toolCallId);
  }

  setLastSentDescription(toolCallId: string, description: string) {
    this.lastSentDescription.set(toolCallId, description);
  }

  getPreviousDescription(toolCallId: string): string | undefined {
    return this.previousDescription.get(toolCallId);
  }

  setPreviousDescription(toolCallId: string, description: string) {
    this.previousDescription.set(toolCallId, description);
  }

  hasBuildStatusSent(toolCallId: string): boolean {
    return this.buildStatusSent.has(toolCallId);
  }

  markBuildStatusSent(toolCallId: string) {
    this.buildStatusSent.add(toolCallId);
  }

  private hasAddSent(toolCallId: string, id: string): boolean {
    return this.addSentByToolCall.get(toolCallId)?.has(id) ?? false;
  }

  private markAddSent(toolCallId: string, id: string) {
    const set = this.addSentByToolCall.get(toolCallId) ?? new Set<string>();
    set.add(id);
    this.addSentByToolCall.set(toolCallId, set);
  }

  private splitAddPropsToUpdate(payload: any, toolCallId: string): boolean {
    if (
      payload.op !== "add" ||
      !payload.props ||
      typeof payload.props !== "object"
    ) {
      return false;
    }

    const { content, ...rest } = payload.props as Record<string, unknown>;
    const hasOtherProps = Object.keys(rest).length > 0;
    if (!hasOtherProps) return false;

    const addPayload = {
      ...payload,
      props: content !== undefined ? { content } : {},
    };
    const addKey = `${toolCallId}:add:${addPayload.id ?? "root"}`;
    const addSignature = JSON.stringify(addPayload);
    if (this.lastSentPayloadByOp.get(addKey) !== addSignature) {
      if (!this.hasAddSent(toolCallId, addPayload.id)) {
        this.markAddSent(toolCallId, addPayload.id);
        this.lastSentPayloadByOp.set(addKey, addSignature);
        this.send({
          type: "data-build-op",
          transient: true,
          data: addPayload,
        });
      }
    }

    const updatePayload = {
      op: "update",
      id: payload.id,
      props: rest,
    };
    const updateKey = `${toolCallId}:update:${updatePayload.id ?? "root"}`;
    const updateSignature = JSON.stringify(updatePayload);
    if (this.lastSentPayloadByOp.get(updateKey) !== updateSignature) {
      this.lastSentPayloadByOp.set(updateKey, updateSignature);
      this.send({
        type: "data-build-op",
        transient: true,
        data: updatePayload,
      });
    }

    return true;
  }

  /**
   * Verarbeitet bei jedem partial.build-Update nur das aktuellste Element (letztes im Array)
   * und ruft processBuildOp dafür auf – solange bis ein neues Element dazukommt.
   */
  processBuildStream(partial: { build?: any[] }, toolCallId: string) {
    const build = partial?.build;
    if (!Array.isArray(build) || build.length === 0) return;
    const lastOp = build[build.length - 1];
    const previousLength = this.lastBuildLengthByToolCall.get(toolCallId) ?? 0;
    if (build.length > previousLength) {
      if (build.length >= 2) {
        const previousOp = build[build.length - 2];
        this.processBuildOp(previousOp, toolCallId);
      }
      this.lastBuildLengthByToolCall.set(toolCallId, build.length);
    }
    if (lastOp?.op !== "add") {
      this.processBuildOp(lastOp, toolCallId);
    }
  }

  processBuildOp(op: any, toolCallId: string) {
    try {
      if (!op || typeof op !== "object" || typeof op.op !== "string") return;
      const normalized =
        op.op === "add" ? { ...op, zone: normalizeTransientZone(op) } : op;
      if (!isValidBuildOp(normalized)) return;

      if (normalized.op === "reset") {
        if (this.resetSent.has(toolCallId)) return;
        this.resetSent.add(toolCallId);
        this.lastSentPayloadByOp = new Map(
          [...this.lastSentPayloadByOp.entries()].filter(
            ([k]) => !k.startsWith(`${toolCallId}:`)
          )
        );
        this.addSentByToolCall.delete(toolCallId);
        this.lastBuildLengthByToolCall.delete(toolCallId);
      }

      const payload: any = {
        ...normalized,
        props: normalized.props ?? normalized.value ?? {},
      };

      const opKey = `${toolCallId}:${payload.op}:${payload.id ?? "root"}`;
      const signature = JSON.stringify(payload);

      if (this.splitAddPropsToUpdate(payload, toolCallId)) return;

      if (payload.op === "add" && typeof payload.id === "string") {
        if (this.hasAddSent(toolCallId, payload.id)) return;
        this.markAddSent(toolCallId, payload.id);
      }
      if (this.lastSentPayloadByOp.get(opKey) === signature) return;
      this.lastSentPayloadByOp.set(opKey, signature);

      this.send({
        type: "data-build-op",
        transient: true,
        data: payload,
      });
    } catch (error) {
      console.error("Error handling live parsing:", error);
    }
  }
}

/**
 * Conversions: Puck -> OpenAI
 */
const Transformers = {
  messages(messages: any[] = [], context?: string): OpenAIMessage[] {
    const aiMsgs: OpenAIMessage[] = context
      ? [{ role: "system", content: context }]
      : [];

    messages.forEach((m) => {
      const content =
        m.parts
          ?.filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("") || "";
      if (content)
        aiMsgs.push({
          role: m.role === "assistant" ? "assistant" : "user",
          content,
        });
    });

    return aiMsgs;
  },

  tools(tools: Record<string, any> = {}) {
    return Object.values(tools)
      .filter((t) => t?.name && t?.inputSchema)
      .map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.inputSchema,
        },
      }));
  },
};

// --- Core Logic ---

async function streamOpenAI(
  messages: OpenAIMessage[],
  tools: any[],
  callbacks: {
    onDelta: (t: string) => void;
    onEnd: () => void;
    onToolDelta: (
      id: string,
      delta: string,
      full: string,
      name?: string
    ) => void;
    onToolComplete: (
      id: string,
      name: string,
      input: any,
      providerId?: string
    ) => void;
    onStart: (providerId: string) => void;
  }
) {
  if (!ENV.OPENAI_KEY) throw new Error("Missing OpenAI API Key");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ENV.OPENAI_MODEL,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
      stream: true,
      max_tokens: 16384, // gpt-4o-mini max; higher values cause 400
    }),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const toolCallsByIndex = new Map<number, ToolCallState>();
  const toolCallsById = new Map<string, ToolCallState>();
  let providerId: string | undefined;
  let buffer = "";
  let textOpen = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode();
    } else {
      buffer += decoder.decode(value, { stream: true });
    }
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:") || trimmed === "data: [DONE]") continue;

      try {
        const json = JSON.parse(trimmed.slice(5));
        if (!providerId && json.id) {
          providerId = json.id;
          callbacks.onStart(providerId);
          textOpen = true;
        }

        const delta = json.choices?.[0]?.delta;
        if (delta?.content) {
          callbacks.onDelta(delta.content);
        }
        if (delta?.tool_calls) {
          if (textOpen) {
            callbacks.onEnd();
            textOpen = false;
          }
          for (const tc of delta.tool_calls) {
            const index = tc.index ?? 0;
            const existing = toolCallsByIndex.get(index);
            const initialId = tc.id || existing?.id || `call_${index}`;

            let state = existing;
            if (!state) {
              state = {
                id: initialId,
                name: tc.function?.name || "",
                argsText: "",
              };
              toolCallsByIndex.set(index, state);
              toolCallsById.set(state.id, state);
            }

            if (tc.id && state.id !== tc.id) {
              toolCallsById.delete(state.id);
              state.id = tc.id;
              toolCallsById.set(state.id, state);
            }

            if (tc.function?.name) {
              state.name = tc.function.name;
            }

            if (tc.function?.arguments) {
              state.argsText += tc.function.arguments;
            }

            callbacks.onToolDelta(
              state.id,
              tc.function?.arguments || "",
              state.argsText,
              state.name
            );
          }
        }
      } catch (e) {
        console.error("Error parsing SSE line:", trimmed, e);
      }
    }

    if (done) {
      if (textOpen) callbacks.onEnd();
      break;
    }
  }

  // Finalize Tool Calls
  for (const state of toolCallsByIndex.values()) {
    let parsedArgs;
    try {
      parsedArgs = JSON.parse(state.argsText);
    } catch {
      parsedArgs = state.argsText;
    }
    await callbacks.onToolComplete(
      state.id,
      state.name || "tool",
      parsedArgs,
      providerId
    );
  }
}

// --- Server Handler ---

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (req.headers.get("x-api-key") !== ENV.ANON_KEY)
    return new Response("Unauthorized", { status: 401 });

  const payload = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const manager = new PuckStreamManager(controller);
      const chatId =
        payload.chatId && String(payload.chatId).trim()
          ? payload.chatId
          : `chat_${crypto.randomUUID()}`;
      const ids = {
        chat: chatId,
        msg: payload.messageId ?? `msg_${crypto.randomUUID()}`,
        text: `msg_${crypto.randomUUID().replace(/-/g, "")}`,
      };

      manager.send({
        type: "data-new-chat-created",
        data: { chatId: ids.chat },
        transient: true,
      });
      manager.send({ type: "start", messageId: ids.msg });
      manager.send({ type: "start-step" });

      // Early feedback so the UI shows something immediately (before OpenAI responds)
      manager.sendToolStatus("thinking", "Thinking…", true);

      try {
        const toolStarted = new Set<string>();
        let lastProviderId: string | undefined;

        await streamOpenAI(
          Transformers.messages(payload.messages, payload.context),
          Transformers.tools(payload.tools),
          {
            onStart: (id) => {
              lastProviderId = id;
              manager.send({
                type: "text-start",
                id: ids.text,
                providerMetadata: { openai: { itemId: id } },
              });
            },
            onDelta: (delta) =>
              manager.send({
                type: "text-delta",
                id: ids.text,
                delta,
              }),
            onEnd: () =>
              manager.send({
                type: "text-end",
                id: ids.text,
                providerMetadata: { openai: { itemId: lastProviderId } },
              }),
            // Im serve-Handler innerhalb von streamOpenAI Callbacks:
            onToolDelta: (id, delta, full, name) => {
              console.log("onToolDelta", id, delta, full, name);
              // console.log("onToolDelta", id, delta, full, name);
              // 1. Zuerst: tool-input-start (einmal pro Tool-Call)
              if (!toolStarted.has(id) && name) {
                toolStarted.add(id);
                manager.send({
                  type: "tool-input-start",
                  toolCallId: id,
                  toolName: name,
                });
              }

              // 2. Pro Chunk: tool-input-delta mit dem rohen Delta
              if (toolStarted.has(id)) {
                if (name === "createPage") {
                  const partial = parse(full);

                  if (!manager.hasResetSent(id)) {
                    manager.send({
                      type: "data-build-op",
                      transient: true,
                      data: { op: "reset" },
                    });
                    manager.markResetSent(id);
                  }

                  // Einmal senden, wenn description stabil ist (gleich wie im vorherigen Chunk)
                  if (partial?.description) {
                    const prev = manager.getPreviousDescription(id);
                    const alreadySent = manager.getLastSentDescription(id);
                    if (
                      prev === partial.description &&
                      alreadySent === undefined
                    ) {
                      manager.send({
                        type: "tool-input-available",
                        toolCallId: id,
                        toolName: name,
                        input: {
                          description: partial.description,
                        },
                        providerMetadata: {
                          openai: {
                            itemId: lastProviderId,
                          },
                        },
                      });
                      manager.setLastSentDescription(id, partial.description);
                    }
                    manager.setPreviousDescription(id, partial.description);
                  }

                  // Nur das letzte Element in partial.build pro Chunk verarbeiten
                  if (
                    partial &&
                    Array.isArray(partial.build) &&
                    partial.build.length > 0
                  ) {
                    if (!manager.hasBuildStatusSent(id)) {
                      manager.sendToolStatus(id, "Creating page...", true);
                      manager.markBuildStatusSent(id);
                    }
                    manager.processBuildStream(partial, id);
                  }
                }
              }
            },
            // 2. Im serve-Handler bei onToolComplete:
            onToolComplete: async (id, name, input) => {
              console.log("onToolComplete", id, name, input);
              if (name !== "createPage") return;

              if (
                input?.build &&
                Array.isArray(input.build) &&
                input.build.length
              ) {
                const lastOp = input.build[input.build.length - 1];
                manager.processBuildOp(lastOp, id);
              }

              if (input?.description) {
                manager.sendToolStatus(id, input.description, false);
              } else {
                manager.sendToolStatus(id, "Created page", false);
              }

              manager.send({
                type: "tool-output-available",
                toolCallId: id,
                output: {
                  status: { loading: false, label: "Created page" },
                },
              });
            },
          }
        );

        manager.send({ type: "finish-step" });
        manager.send({ type: "finish" });
      } catch (err) {
        manager.send({ type: "error", errorText: err.message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
});
