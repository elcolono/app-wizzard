import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parse } from "https://esm.sh/best-effort-json-parser";
import { corsHeaders } from "../_shard/cors.ts";

// --- Configuration & Constants ---
const ENV = {
  ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY"),
  OPENAI_KEY: Deno.env.get("OPENAI_API_KEY"),
  OPENAI_MODEL: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini",
  SUPABASE_URL: Deno.env.get("SUPABASE_URL"),
  SUPABASE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
};

const STREAM_HEADERS = {
  ...corsHeaders,
  "Content-Type": "text-event-stream; charset=utf-8",
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

const createAdminClient = () =>
  ENV.SUPABASE_URL && ENV.SUPABASE_ROLE_KEY
    ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ROLE_KEY)
    : null;

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

const normalizeBuildOps = (build: any[]) => {
  const containerTypes = new Set(["Container", "Box", "VStack", "HStack"]);
  const zoneIndex = new Map<string, number>();
  let currentParentId: string | null = null;

  return build.map((op) => {
    if (!op || typeof op !== "object") return op;

    if (op.op === "reset") {
      currentParentId = null;
      zoneIndex.clear();
      return op;
    }

    if (op.op !== "add") {
      return { ...op, props: op.props || op.value || {} };
    }

    const normalized = { ...op, props: op.props || op.value || {} };
    if (
      typeof normalized.type !== "string" ||
      typeof normalized.id !== "string"
    )
      return normalized;

    let zone = normalized.zone;
    if (!zone || zone === "content") {
      zone = currentParentId
        ? `${currentParentId}:content`
        : "root:default-zone";
    }
    normalized.zone = zone;

    const nextIndex = zoneIndex.get(zone) ?? 0;
    const usedIndex =
      typeof normalized.index === "number" ? normalized.index : nextIndex;
    normalized.index = usedIndex;
    zoneIndex.set(zone, Math.max(nextIndex, usedIndex + 1));

    if (containerTypes.has(normalized.type)) {
      currentParentId = normalized.id;
    }

    return normalized;
  });
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
  /** Number of build ops already sent for each tool call (to avoid duplicate transient events). */
  private lastSentBuildLength = new Map<string, number>();
  /** Last tool status label sent per tool call (to avoid spamming data-tool-status). */
  private lastToolStatusLabel = new Map<string, string>();

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
      data: { status: { loading, label } },
    });
  }

  markResetSent(toolCallId: string) {
    this.resetSent.add(toolCallId);
  }

  handleLiveParsing(fullArgs: string, toolCallId: string) {
    try {
      const partial = parse(fullArgs);
      if (!partial || !Array.isArray(partial.build)) return;

      // Tool status only when description actually changed (avoid one status per delta)
      if (partial.description) {
        const prev = this.lastToolStatusLabel.get(toolCallId);
        if (prev !== partial.description) {
          this.lastToolStatusLabel.set(toolCallId, partial.description);
          this.sendToolStatus(toolCallId, partial.description, true);
        }
      }

      const build = partial.build;
      const sentCount = this.lastSentBuildLength.get(toolCallId) ?? 0;
      // Only emit ops we haven't sent yet (avoids duplicate data-build-op for same op)
      if (build.length <= sentCount) return;

      for (let i = sentCount; i < build.length; i++) {
        const op = build[i];
        if (!op || typeof op !== "object" || typeof op.op !== "string")
          continue;
        if (!isValidBuildOp(op)) continue;

        if (op.op === "reset") {
          if (this.resetSent.has(toolCallId)) continue;
          this.resetSent.add(toolCallId);
        }

        const payload: any = {
          ...op,
          props: op.props ?? op.value ?? {},
        };
        // UI expects "parentId:slot" (e.g. "root:default-zone"); bare "content" → root-level
        if (op.op === "add") {
          payload.zone = normalizeTransientZone(op);
        }

        this.send({
          type: "data-build-op",
          transient: true,
          data: payload,
        });
      }
      this.lastSentBuildLength.set(toolCallId, build.length);
    } catch (_) {}
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
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const toolCallsByIndex = new Map<number, ToolCallState>();
  const toolCallsById = new Map<string, ToolCallState>();
  let providerId: string | undefined;
  let buffer = "";

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
        }

        const delta = json.choices?.[0]?.delta;
        if (delta?.content) callbacks.onDelta(delta.content);

        if (delta?.tool_calls) {
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

    if (done) break;
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

      try {
        const toolStarted = new Set<string>();

        await streamOpenAI(
          Transformers.messages(payload.messages, payload.context),
          Transformers.tools(payload.tools),
          {
            onStart: (id) =>
              manager.send({
                type: "text-start",
                id: ids.text, // Muss ein String sein
                providerMetadata: { openai: { itemId: id } },
              }),
            onDelta: (delta) =>
              manager.send({
                type: "text-delta",
                id: ids.text,
                delta: delta, // Muss ein String sein
              }),
            // Im serve-Handler innerhalb von streamOpenAI Callbacks:
            onToolDelta: (id, delta, full, name) => {
              console.log("onToolDelta", id, delta, full, name);
              // WICHTIG: Wir nutzen den Namen, sobald er vom streamOpenAI State geliefert wird
              if (!toolStarted.has(id) && name) {
                toolStarted.add(id);
                manager.send({
                  type: "tool-input-start",
                  toolCallId: id,
                  toolName: name, // Jetzt "createPage" statt "tool"
                });

                // Optional: Sofort ein Reset schicken, wenn das Tool createPage heißt
                if (name === "createPage") {
                  manager.send({
                    type: "data-build-op",
                    transient: true,
                    data: { op: "reset" },
                  });
                  manager.markResetSent(id);
                }
              }

              // Nur senden, wenn das Tool offiziell gestartet wurde
              if (toolStarted.has(id)) {
                manager.send({
                  type: "tool-input-delta",
                  toolCallId: id,
                  inputTextDelta: delta,
                });
                manager.handleLiveParsing(full, id);
              }
            },
            // 2. Im serve-Handler bei onToolComplete:
            onToolComplete: async (id, name, input) => {
              const db = createAdminClient();
              if (db)
                await db
                  .from("ai_tool_calls")
                  .upsert({ id, tool_name: name, tool_args: input });

              const normalizedBuild = Array.isArray(input?.build)
                ? normalizeBuildOps(input.build)
                : null;
              const outputInput = normalizedBuild
                ? { ...input, build: normalizedBuild }
                : input;

              if (input?.description) {
                manager.sendToolStatus(id, input.description, false);
              }

              if (normalizedBuild) {
                normalizedBuild.forEach((op: any) => {
                  if (!isValidBuildOp(op)) return;
                  manager.send({
                    type: "data-build-op",
                    transient: true,
                    data: {
                      ...op,
                      props: op.props || op.value || {},
                    },
                  });
                });
              }

              // Erstens: Bestätige den Input
              manager.send({
                type: "tool-input-available",
                toolCallId: id,
                toolName: name,
                input: outputInput,
              });

              // ZWEITENS (WICHTIG): Sende ein explizites Output-Event,
              // damit das Frontend weiß, dass das Tool fertig ist.
              manager.send({
                type: "tool-output-available",
                toolCallId: id,
                output: {
                  status: { loading: false, label: "Seite aktualisiert" },
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
