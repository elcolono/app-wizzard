// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { executeDdlOperation } from "./ddl.ts";
import { executeSeedOperation } from "./dml.ts";
import { ensureSchemaSnapshotRpc, fetchSchemaSnapshot } from "../schema/snapshot.ts";
import { upsertSchemaCache } from "../schema/cache.ts";

export type MigrationResult = {
  migrationsExecuted: number;
  migrationsFailed: string[];
  seedsExecuted: number;
  seedsFailed: string[];
};

export async function executeMigrations(
  ddlOps: any[],
  seedOps: any[],
  appCredentials: any,
  supabaseAdmin: any,
  appId: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    migrationsExecuted: 0,
    migrationsFailed: [],
    seedsExecuted: 0,
    seedsFailed: [],
  };

  // Create a client for the target project using service key
  const target = createClient(
    appCredentials.supabase_url,
    appCredentials.supabase_service_key
  );

  // Helper to run SQL via RPC (assumes a secured function execute_sql exists in target project)
  const runSql = async (sql: string) => {
    console.log("Executing SQL:", sql);
    const { error } = await target.rpc("execute_sql", { sql });
    if (error) {
      console.error("SQL execution error:", error);
      throw error;
    }
    console.log("SQL executed successfully");
  };

  // Translate DDL ops to SQL and execute
  for (const m of ddlOps) {
    try {
      await executeDdlOperation(m, runSql);
      result.migrationsExecuted += 1;
      console.log(`Migration ${m.operation}:${m.table} executed successfully`);
    } catch (e) {
      console.error(`Migration ${m.operation}:${m.table} failed:`, e);
      result.migrationsFailed.push(`${m.operation}:${m.table} -> ${String(e)}`);
    }
  }

  // Execute seed operations using SQL (instead of PostgREST API)
  // This avoids PostgREST schema cache issues after DDL operations
  for (const s of seedOps) {
    try {
      const rowsSeeded = await executeSeedOperation(s, runSql);
      result.seedsExecuted += rowsSeeded;
      console.log(`Seeded ${rowsSeeded} rows into ${s.table} via SQL`);
    } catch (e) {
      console.error(`Seed operation failed:`, e);
      result.seedsFailed.push(String(e));
    }
  }

  console.log("Migration execution completed:", {
    executed: result.migrationsExecuted,
    failed: result.migrationsFailed.length,
    seedsExecuted: result.seedsExecuted,
    seedsFailed: result.seedsFailed.length,
  });

  // Refresh schema cache immediately after DDL/seeds
  try {
    const ok = await ensureSchemaSnapshotRpc(target);
    if (ok) {
      const fresh = await fetchSchemaSnapshot(target);
      if (fresh) {
        console.log(
          "Refreshing schema cache after migrations:",
          fresh.length,
          "tables"
        );
        await upsertSchemaCache(supabaseAdmin, appId, fresh);
      } else {
        // Fallback: invalidate
        await supabaseAdmin
          .from("app_schema_cache")
          .delete()
          .eq("app_id", appId);
      }
    }
  } catch (e) {
    console.error("Failed to invalidate schema cache:", e);
  }

  return result;
}

