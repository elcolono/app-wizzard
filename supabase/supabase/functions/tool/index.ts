import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shard/cors.ts";

const EXPECTED_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const TOOL_CALL_TABLE = "ai_tool_calls";

type OpenAIMessage = { role: "system" | "user" | "assistant"; content: string };
type OpenAIToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};
type OpenAIToolMessage = {
  role: "tool";
  tool_call_id: string;
  name: string;
  content: string;
};

const createAdminClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing OPENAI_API_KEY" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("tool error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON payload" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const toolCallId = payload?.id;
  const responses = Array.isArray(payload?.responses) ? payload.responses : [];
  if (!toolCallId || responses.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing tool call data" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const { data: context, error: contextError } = await supabaseAdmin
    .from(TOOL_CALL_TABLE)
    .select("id, messages, tools, tool_name, tool_args")
    .eq("id", toolCallId)
    .single();

  if (contextError || !context) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Tool call context not found",
        details: contextError?.message,
      }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const toolCall: OpenAIToolCall = {
    id: toolCallId,
    type: "function",
    function: {
      name: context.tool_name ?? "tool",
      arguments: JSON.stringify(context.tool_args ?? {}),
    },
  };

  const toolMessages: OpenAIToolMessage[] = responses.map((response: any) => ({
    role: "tool",
    tool_call_id: toolCallId,
    name: response?.name ?? context.tool_name ?? "tool",
    content: JSON.stringify(response?.output ?? response ?? {}),
  }));

  const followUpMessages: (OpenAIMessage | OpenAIToolMessage)[] = [
    ...(context.messages ?? []),
    {
      role: "assistant",
      content: "",
      tool_calls: [toolCall],
    } as unknown as OpenAIMessage,
    ...toolMessages,
  ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: followUpMessages,
        tools:
          Array.isArray(context.tools) && context.tools.length > 0
            ? context.tools
            : undefined,
        tool_choice:
          Array.isArray(context.tools) && context.tools.length > 0
            ? "auto"
            : undefined,
        temperature: 0.7,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `OpenAI error ${res.status}`,
          details: json,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabaseAdmin.from(TOOL_CALL_TABLE).delete().eq("id", toolCallId);

    return new Response(JSON.stringify({ success: true, response: json }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("tool follow-up error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
