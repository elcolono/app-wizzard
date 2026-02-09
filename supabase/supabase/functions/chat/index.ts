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

  handleLiveParsing(fullArgs: string, toolCallId: string) {
    try {
      const partial = parse(fullArgs);
      if (!partial) return;

      if (partial.description) {
        this.sendToolStatus(toolCallId, partial.description, true);
      }

      if (Array.isArray(partial.build)) {
        partial.build.forEach((op: any, i: number) => {
          if (op.op) {
            // Nur senden, wenn die Operation valide aussieht
            this.send({
              type: "data-build-op",
              transient: true,
              data: {
                op: op.op,
                path: op.path || "content",
                value: op.props || op.value || {}, // Puck erwartet oft 'value'
                id: `${toolCallId}_${i}`,
              },
            });
          }
        });
      }
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

  console.log("messages", messages);
  console.log("tools", tools);

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
  const toolCalls = new Map<string, ToolCallState>();
  let providerId: string | undefined;
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:") || trimmed === "data: [DONE]") continue;

      const json = JSON.parse(trimmed.slice(5));
      if (!providerId && json.id) {
        providerId = json.id;
        callbacks.onStart(providerId);
      }

      const delta = json.choices?.[0]?.delta;
      if (delta?.content) callbacks.onDelta(delta.content);

      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const id = tc.id || `call_${tc.index}`;
          if (!toolCalls.has(id))
            toolCalls.set(id, { id, name: tc.function?.name, argsText: "" });

          const state = toolCalls.get(id)!;
          if (tc.function?.name) state.name = tc.function.name;
          if (tc.function?.arguments) {
            state.argsText += tc.function.arguments;
            callbacks.onToolDelta(
              id,
              tc.function.arguments,
              state.argsText,
              state.name
            );
          }
        }
      }
    }
  }

  // Finalize Tool Calls
  for (const state of toolCalls.values()) {
    let parsedArgs;
    try {
      parsedArgs = JSON.parse(state.argsText);
    } catch {
      parsedArgs = state.argsText;
    }
    callbacks.onToolComplete(
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
            onToolDelta: (id, delta, full, name) => {
              if (!toolStarted.has(id)) {
                toolStarted.add(id);
                manager.send({
                  type: "tool-input-start",
                  toolCallId: id,
                  toolName: name || "tool", // Darf nicht undefined sein
                });
              }
              manager.send({
                type: "tool-input-delta",
                toolCallId: id,
                inputTextDelta: delta,
              });
              manager.handleLiveParsing(full, id);
            },
            onToolComplete: async (id, name, input) => {
              const db = createAdminClient();
              if (db)
                await db
                  .from("ai_tool_calls")
                  .upsert({ id, tool_name: name, tool_args: input });

              manager.send({
                type: "tool-input-available",
                toolCallId: id,
                toolName: name,
                input,
              });
              manager.sendToolStatus(id, "Erfolgreich erstellt!", false);
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
