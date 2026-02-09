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

/**
 * Manages the SSE stream and Puck-specific message formatting
 */
class PuckStreamManager {
  private encoder = new TextEncoder();
  constructor(private controller: ReadableStreamDefaultController) {}

  send(data: unknown) {
    this.controller.enqueue(
      this.encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
    );
  }

  // Hilfsmethode für saubere Tool-Status-Updates
  sendToolStatus(toolCallId: string, label: string, loading: boolean) {
    this.send({
      type: "data-tool-status",
      id: toolCallId, // Hier ist 'id' korrekt für data- Events
      data: { status: { loading, label } },
    });
  }

  // 1. In der PuckStreamManager Klasse:
  handleLiveParsing(fullArgs: string, toolCallId: string) {
    try {
      const partial = parse(fullArgs);
      if (!partial || !Array.isArray(partial.build)) return;

      if (partial.description) {
        this.sendToolStatus(toolCallId, partial.description, true);
      }

      partial.build.forEach((op: any, i: number) => {
        if (op.op) {
          // Wir senden das Objekt flacher, passend zum funktionierenden Beispiel
          this.send({
            type: "data-build-op",
            transient: true,
            data: {
              ...op,
              id: op.id || `temp_${toolCallId}_${i}`,
              // Falls 'props' vorhanden sind, stelle sicher, dass sie gesendet werden
              props: op.props || op.value || {},
            },
          });
        }
      });
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
      const ids = {
        chat: payload.chatId ?? `chat_${crypto.randomUUID()}`,
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

              // Erstens: Bestätige den Input
              manager.send({
                type: "tool-input-available",
                toolCallId: id,
                toolName: name,
                input,
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
