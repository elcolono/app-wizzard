import { parse } from "https://esm.sh/best-effort-json-parser";
import {
  getToolLoadingLabel,
  isComponentDefinitionTool,
  isPageBuildTool,
  MAX_TOOL_ROUNDS,
} from "./config.ts";
import { Transformers } from "./transformers.ts";
import { streamOpenAI } from "./openai/stream.ts";
import { PuckStreamManager } from "./stream/manager.ts";
import type { ChatPayload, OpenAIMessage, ToolResult } from "./types.ts";
import { handleComponentDefinitionsTool } from "./tools/component-definitions.ts";
import { handleUpdatePageTool } from "./tools/update-page.ts";

export async function runChatSession(params: {
  payload: ChatPayload;
  manager: PuckStreamManager;
  ids: { text: string };
}) {
  const { payload, manager, ids } = params;
  const tools = Transformers.tools(payload.tools);
  const llmMessages: OpenAIMessage[] = Transformers.messages(
    payload.messages,
    payload.context,
  );

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const toolStarted = new Set<string>();
    const toolResults: ToolResult[] = [];
    let sawUpdatePage = false;
    let lastProviderId: string | undefined;
    let assistantText = "";

    await streamOpenAI(llmMessages, tools, {
      onStart: (id) => {
        lastProviderId = id;
        manager.send({
          type: "text-start",
          id: ids.text,
          providerMetadata: { openai: { itemId: id } },
        });
      },
      onDelta: (delta) => {
        assistantText += delta;
        manager.send({
          type: "text-delta",
          id: ids.text,
          delta,
        });
      },
      onEnd: () =>
        manager.send({
          type: "text-end",
          id: ids.text,
          providerMetadata: { openai: { itemId: lastProviderId } },
        }),
      onToolDelta: (id, delta, full, name) => {
        console.log("onToolDelta", id, delta, full, name);
        if (!toolStarted.has(id) && name) {
          toolStarted.add(id);
          manager.send({
            type: "tool-input-start",
            toolCallId: id,
            toolName: name,
          });
          if (!isPageBuildTool(name)) {
            manager.sendToolStatus(id, getToolLoadingLabel(name), true);
          }
        }

        if (toolStarted.has(id) && isPageBuildTool(name)) {
          const partial = parse(full);

          if (partial?.description) {
            const prev = manager.getPreviousDescription(id);
            const alreadySent = manager.getLastSentDescription(id);
            if (prev === partial.description && alreadySent === undefined) {
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

          if (partial && Array.isArray(partial.build) && partial.build.length > 0) {
            if (!manager.hasBuildStatusSent(id)) {
              manager.sendToolStatus(id, getToolLoadingLabel(name), true);
              manager.markBuildStatusSent(id);
            }
            manager.processBuildStream(partial, id);
          }
        }
      },
      onToolComplete: async (id, name, input) => {
        console.log("onToolComplete", id, name, input);
        if (isComponentDefinitionTool(name)) {
          handleComponentDefinitionsTool({
            id,
            input,
            payload,
            manager,
            toolResults,
          });
          return;
        }
        if (!isPageBuildTool(name)) return;
        sawUpdatePage = true;
        handleUpdatePageTool({ id, input, manager, toolResults });
      },
    });

    if (assistantText.trim().length > 0) {
      llmMessages.push({ role: "assistant", content: assistantText });
    }

    if (sawUpdatePage || toolResults.length === 0) {
      break;
    }

    llmMessages.push({
      role: "system",
      content:
        "Tool results from previous step (JSON):\n" +
        JSON.stringify(
          toolResults.map((result) => ({
            toolCallId: result.id,
            toolName: result.name,
            output: result.output,
          })),
        ),
    });
    llmMessages.push({
      role: "system",
      content:
        "Use the tool results above to continue the same user request. If definitions are sufficient, call updatePage exactly once now.",
    });
  }
}
