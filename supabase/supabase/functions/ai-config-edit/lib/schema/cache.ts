// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import { SCHEMA_CACHE_TTL_MS } from "../../config.ts";
import { ensureSchemaSnapshotRpc, fetchSchemaSnapshot } from "./snapshot.ts";

export async function getCachedSchema(
  supabaseAdmin: any,
  appId: string
): Promise<{ schema: any[]; refreshedAt: number } | null> {
  const { data, error } = await supabaseAdmin
    .from("app_schema_cache")
    .select("schema, refreshed_at")
    .eq("app_id", appId)
    .single();
  if (error || !data) return null;
  const refreshedAt = new Date(data.refreshed_at).getTime();
  return { schema: data.schema as any[], refreshedAt };
}

export async function upsertSchemaCache(
  supabaseAdmin: any,
  appId: string,
  schema: any[]
) {
  const { error } = await supabaseAdmin
    .from("app_schema_cache")
    .upsert({
      app_id: appId,
      schema,
      refreshed_at: new Date().toISOString(),
    })
    .select("app_id")
    .single();
  if (error) console.error("Failed to upsert schema cache:", error);
}

export async function getOrRefreshSchema(
  supabaseAdmin: any,
  target: any,
  appId: string
): Promise<any[] | null> {
  try {
    const cached = await getCachedSchema(supabaseAdmin, appId);
    const now = Date.now();
    if (cached && now - cached.refreshedAt < SCHEMA_CACHE_TTL_MS) {
      return cached.schema;
    }

    // Ensure RPC exists and fetch fresh snapshot
    const ok = await ensureSchemaSnapshotRpc(target);
    if (!ok) return cached?.schema ?? null;
    const fresh = await fetchSchemaSnapshot(target);
    if (fresh) {
      console.log(
        "Fetched fresh schema snapshot",
        Array.isArray(fresh) ? fresh.length : 0,
        "tables"
      );
      await upsertSchemaCache(supabaseAdmin, appId, fresh);
    }
    return fresh ?? cached?.schema ?? null;
  } catch (e) {
    console.error("getOrRefreshSchema error:", e);
    return null;
  }
}

