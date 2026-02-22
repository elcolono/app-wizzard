import { ENV } from "../config.ts";
import type { OpenAIMessage, ToolCallState } from "../types.ts";

export async function streamOpenAI(
  messages: OpenAIMessage[],
  tools: any[],
  callbacks: {
    onDelta: (t: string) => void;
    onEnd: () => void;
    onToolDelta: (id: string, delta: string, full: string, name?: string) => void;
    onToolComplete: (
      id: string,
      name: string,
      input: any,
      providerId?: string,
    ) => void | Promise<void>;
    onStart: (providerId: string) => void;
  },
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
      max_tokens: 16384,
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
              state.name,
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
      providerId,
    );
  }
}
