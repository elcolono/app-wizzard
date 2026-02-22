import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shard/cors.ts";
import { collectIdsFromContent } from "./lib/build-memory.ts";
import { ENV, STREAM_HEADERS } from "./lib/config.ts";
import { runChatSession } from "./lib/chat-runner.ts";
import { PuckStreamManager } from "./lib/stream/manager.ts";
import type { ChatPayload } from "./lib/types.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.headers.get("x-api-key") !== ENV.ANON_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as ChatPayload;

  const stream = new ReadableStream({
    async start(controller) {
      const initialComponentIds = Array.from(
        collectIdsFromContent(payload?.pageData?.content),
      );
      const manager = new PuckStreamManager(controller, initialComponentIds);
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
      manager.sendToolStatus("thinking", "Thinking…", true);

      try {
        await runChatSession({ payload, manager, ids: { text: ids.text } });

        manager.send({ type: "finish-step" });
        manager.send({ type: "finish" });
      } catch (err) {
        manager.send({
          type: "error",
          errorText: err instanceof Error ? err.message : String(err),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
});
