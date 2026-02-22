import { extractRecentBuildMemories, formatBuildMemoryContext } from "./build-memory.ts";
import type { OpenAIMessage } from "./types.ts";

export const Transformers = {
  messages(messages: any[] = [], context?: string): OpenAIMessage[] {
    const aiMsgs: OpenAIMessage[] = [];
    if (context) aiMsgs.push({ role: "system", content: context });

    const memoryContext = formatBuildMemoryContext(
      extractRecentBuildMemories(messages),
    );
    if (memoryContext) {
      aiMsgs.push({ role: "system", content: memoryContext });
    }
    aiMsgs.push({
      role: "system",
      content:
        "When the latest user request is a local edit, execute only that local edit and do not repeat older build goals.",
    });

    messages.forEach((m) => {
      const content =
        m.parts
          ?.filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("") || "";
      if (content) {
        aiMsgs.push({
          role: m.role === "assistant" ? "assistant" : "user",
          content,
        });
      }
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
