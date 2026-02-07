import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shard/cors.ts";

const EXPECTED_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";

type PuckMessagePart = { type: string; text?: string };
type PuckMessage = { role: string; parts?: PuckMessagePart[] };

type OpenAIMessage = { role: "system" | "user" | "assistant"; content: string };

const STREAM_HEADERS = {
  ...corsHeaders,
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

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

const streamOpenAI = async (
  openAIMessages: OpenAIMessage[],
  onDelta: (text: string) => void
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
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          onDelta(delta);
        }
      } catch {
        // ignore malformed chunks
      }
    }
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

      sendChunk(controller, {
        type: "data-new-chat-created",
        data: { chatId },
        transient: true,
      });
      sendChunk(controller, { type: "start", messageId });
      sendChunk(controller, { type: "start-step" });
      sendChunk(controller, { type: "text-start", id: textId });

      try {
        const openAIMessages = toOpenAIMessages(payload);
        await streamOpenAI(openAIMessages, (delta) => {
          sendChunk(controller, { type: "text-delta", id: textId, delta });
        });
        sendChunk(controller, { type: "text-end", id: textId });
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
