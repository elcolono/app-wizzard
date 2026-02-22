import { corsHeaders } from "../../_shard/cors.ts";

export const ENV = {
  ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY"),
  OPENAI_KEY: Deno.env.get("OPENAI_API_KEY"),
  OPENAI_MODEL: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o",
  SUPABASE_URL: Deno.env.get("SUPABASE_URL"),
  SUPABASE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
};

export const STREAM_HEADERS = {
  ...corsHeaders,
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

export const MAX_TOOL_ROUNDS = 3;

export const isPageBuildTool = (name?: string): boolean => name === "updatePage";

export const isComponentDefinitionTool = (name?: string): boolean =>
  name === "getComponentDefinitions";

export const getToolLoadingLabel = (name?: string): string =>
  name === "updatePage"
    ? "Updating page..."
    : name === "getComponentDefinitions"
      ? "Loading component definitions..."
      : "Running tool...";

export const getToolDoneLabel = (name?: string): string =>
  name === "updatePage"
    ? "Updated page"
    : name === "getComponentDefinitions"
      ? "Loaded component definitions"
      : "Tool finished";
