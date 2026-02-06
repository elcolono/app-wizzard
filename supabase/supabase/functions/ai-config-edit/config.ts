// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import componentCatalogRaw from "./component_catalog.json" assert { type: "json" };

export const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
export const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
export const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY"
)!;
export const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Schema caching constants
export const SCHEMA_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_PROMPT_TABLES = 30;
export const MAX_PROMPT_COLUMNS = 20;
export const MAX_PROMPT_COMPONENTS = 25;

export const COMPONENT_CATALOG: any[] = Array.isArray(componentCatalogRaw)
  ? (componentCatalogRaw as any[])
  : [];
