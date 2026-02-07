import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shard/cors.ts";

const EXPECTED_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Types for Puck messages
type PuckMessagePart = { type: string; text?: string };
type PuckMessage = { role: string; parts?: PuckMessagePart[] };

type OpenAIMessage = { role: "system" | "user" | "assistant"; content: string };

type ToolCallState = { id: string; name?: string; argsText: string };
type OpenAITool = {
  type: "function";
  function: { name: string; description?: string; parameters: unknown };
};

// Stream headers
const STREAM_HEADERS = {
  ...corsHeaders,
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

const TOOL_CALL_TABLE = "ai_tool_calls";

const createAdminClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

// Sends a chunk to the client
const sendChunk = (
  controller: ReadableStreamDefaultController,
  data: unknown
) => {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
};

const collectTextParts = (message: PuckMessage): string => {
  const parts = Array.isArray(message.parts) ? message.parts : [];
  return parts
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
};

// Converts Puck messages to OpenAI messages
const toOpenAIMessages = (payload: {
  context?: string;
  messages?: PuckMessage[];
}): OpenAIMessage[] => {
  const output: OpenAIMessage[] = [];
  if (payload.context && typeof payload.context === "string") {
    output.push({ role: "system", content: payload.context });
  }
  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  for (const message of messages) {
    const content = collectTextParts(message);
    if (!content) continue;
    if (message.role === "assistant") {
      output.push({ role: "assistant", content });
    } else {
      output.push({ role: "user", content });
    }
  }
  return output;
};

// Builds OpenAI tools from Puck tools
const buildOpenAITools = (
  tools: Record<string, any> | undefined
): OpenAITool[] => {
  if (!tools || typeof tools !== "object") return [];
  return Object.values(tools)
    .map((tool: any) => {
      if (!tool?.name || !tool?.inputSchema) return null;
      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      } as OpenAITool;
    })
    .filter(Boolean) as OpenAITool[];
};

// Streams OpenAI messages
const streamOpenAI = async (
  openAIMessages: OpenAIMessage[],
  tools: OpenAITool[],
  onDelta: (text: string) => void,
  onToolDelta: (toolCallId: string, delta: string, name?: string) => void,
  onToolComplete: (
    toolCallId: string,
    name: string,
    input: unknown,
    providerId?: string
  ) => void,
  onProviderId: (providerId: string) => void
) => {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: openAIMessages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!res.ok || !res.body) {
    const errorText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errorText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let providerId: string | undefined;
  const toolCalls = new Map<string, ToolCallState>();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        if (!providerId && typeof json?.id === "string") {
          providerId = json.id;
          onProviderId(providerId);
        }
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          onDelta(delta);
        }
        const toolDeltas = json?.choices?.[0]?.delta?.tool_calls;
        if (Array.isArray(toolDeltas)) {
          for (const toolDelta of toolDeltas) {
            const toolId = toolDelta?.id;
            const callId = toolId || `call_${toolDelta?.index ?? "unknown"}`;
            const name = toolDelta?.function?.name;
            const argsDelta = toolDelta?.function?.arguments ?? "";

            if (!toolCalls.has(callId)) {
              toolCalls.set(callId, { id: callId, name, argsText: "" });
            }
            const state = toolCalls.get(callId)!;
            if (name) state.name = name;
            if (typeof argsDelta === "string" && argsDelta.length > 0) {
              state.argsText += argsDelta;
              onToolDelta(callId, argsDelta, state.name);
            }
          }
        }
      } catch {
        // ignore malformed chunks
      }
    }
  }

  for (const state of toolCalls.values()) {
    let input: unknown = state.argsText;
    try {
      input = JSON.parse(state.argsText);
    } catch {
      // keep raw string
    }
    onToolComplete(state.id, state.name ?? "tool", input, providerId);
  }
};

console.log("chat handler up and running!");

serve(async (req: Request) => {
  console.log("chat request:", req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Puck cloud-client sendet den Anon Key im Header "x-api-key" (vgl. cloud-api.ts)
  const apiKey = req.headers.get("x-api-key");
  if (!EXPECTED_ANON_KEY || apiKey !== EXPECTED_ANON_KEY) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: x-api-key missing or invalid" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON payload" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const chatId = payload?.chatId ?? `chat_${crypto.randomUUID()}`;
      const messageId = payload?.messageId ?? `msg_${crypto.randomUUID()}`;
      const textId = `msg_${crypto.randomUUID().replaceAll("-", "")}`;
      let providerId: string | undefined;

      sendChunk(controller, {
        type: "data-new-chat-created",
        data: { chatId },
        transient: true,
      });
      sendChunk(controller, { type: "start", messageId });
      sendChunk(controller, { type: "start-step" });

      try {
        const openAIMessages = toOpenAIMessages(payload);
        const openAITools = buildOpenAITools(payload?.tools);
        let textStarted = false;
        const toolStarted = new Set<string>();

        await streamOpenAI(
          openAIMessages,
          openAITools,
          (delta) => {
            if (!textStarted) {
              textStarted = true;
              sendChunk(controller, {
                type: "text-start",
                id: textId,
                providerMetadata: providerId
                  ? { openai: { itemId: providerId } }
                  : undefined,
              });
            }
            sendChunk(controller, { type: "text-delta", id: textId, delta });
          },
          (toolCallId, argsDelta, toolName) => {
            if (!toolStarted.has(toolCallId)) {
              toolStarted.add(toolCallId);
              sendChunk(controller, {
                type: "tool-input-start",
                toolCallId,
                toolName: toolName ?? "tool",
              });
              sendChunk(controller, {
                type: "data-tool-status",
                id: toolCallId,
                data: {
                  toolCallId,
                  status: {
                    loading: true,
                    label: `Running ${toolName ?? "tool"}...`,
                  },
                },
              });
            }
            sendChunk(controller, {
              type: "tool-input-delta",
              toolCallId,
              inputTextDelta: argsDelta,
            });
          },
          async (toolCallId, toolName, input, openaiId) => {
            const supabaseAdmin = createAdminClient();
            if (!supabaseAdmin) {
              console.warn(
                "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing; cannot persist tool context."
              );
            } else {
              await supabaseAdmin.from(TOOL_CALL_TABLE).upsert({
                id: toolCallId,
                created_at: new Date().toISOString(),
                messages: openAIMessages,
                tools: openAITools,
                tool_name: toolName ?? "tool",
                tool_args: input ?? {},
              });
            }
            sendChunk(controller, {
              type: "tool-input-available",
              toolCallId,
              toolName,
              input,
              providerMetadata: openaiId
                ? { openai: { itemId: openaiId } }
                : undefined,
            });
            sendChunk(controller, {
              type: "tool-output-available",
              toolCallId,
              output: {
                status: {
                  loading: false,
                  label: `Tool call ${toolName} received`,
                },
              },
            });
          },
          (openaiId) => {
            providerId = openaiId;
            if (!textStarted) {
              sendChunk(controller, {
                type: "text-start",
                id: textId,
                providerMetadata: { openai: { itemId: openaiId } },
              });
              textStarted = true;
            }
          }
        );

        if (textStarted) {
          sendChunk(controller, {
            type: "text-end",
            id: textId,
            providerMetadata: providerId
              ? { openai: { itemId: providerId } }
              : undefined,
          });
        }
        sendChunk(controller, { type: "finish-step" });
        sendChunk(controller, { type: "finish" });
      } catch (error) {
        console.error("openai error:", error);
        sendChunk(controller, {
          type: "error",
          errorText: error instanceof Error ? error.message : "Unknown error",
        });
        sendChunk(controller, { type: "finish" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
});
