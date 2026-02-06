// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types and config
import type { RequestBody, AIOperation } from "./types.ts";

// Utils
import { getCorsHeaders } from "./lib/utils/cors.ts";
import { createUserClient, createAdminClient } from "./lib/utils/clients.ts";

// Patch operations
import { applyJsonPatch } from "./lib/patch/json-patch.ts";

// Schema management
import { getOrRefreshSchema } from "./lib/schema/cache.ts";

// Prompt builders
import {
  buildPromptSchema,
  buildPromptComponentCatalog,
  buildPromptConfigSchemaSlice,
} from "./lib/prompt/builders.ts";

// AI integration
import { callGeminiFlash } from "./lib/ai/gemini.ts";

// Validation
import { validateAppConfig } from "./lib/validation/schema.ts";

// Migration execution
import { executeMigrations } from "./lib/migrations/executor.ts";

const MAX_REPAIR_ATTEMPTS = 3;

function extractPatchOps(ops: any[]): any[] {
  if (!Array.isArray(ops)) return [];
  return ops.filter(
    (op: any) =>
      op &&
      typeof op === "object" &&
      (op.type === "patch" || ("op" in op && !op.type))
  );
}

function extractMigrationOps(ops: any[]): any[] {
  if (!Array.isArray(ops)) return [];
  return ops.filter(
    (op: any) => op && typeof op === "object" && op.type === "migration"
  );
}

function summarizeValidationErrors(errors: any[] | undefined): string {
  if (!errors || errors.length === 0) {
    return "(no validation errors provided)";
  }

  return errors
    .map((err: any) => {
      const location = err.instancePath || err.schemaPath || "(unknown path)";
      const message = err.message || JSON.stringify(err);
      return `- ${location}: ${message}`;
    })
    .join("\n");
}

function buildRepairInstruction(
  baseInstruction: string,
  validationErrors: any[] | undefined
): string {
  const summary = summarizeValidationErrors(validationErrors);
  return [
    "The previous change produced an app_config that failed schema validation.",
    "Please fix the configuration while preserving the user's intent.",
    "",
    `Original instruction: ${baseInstruction}`,
    "",
    "Validation errors:",
    summary,
    "",
    "Return ONLY additional JSON Patch and migration operations required to fix these issues.",
  ].join("\n");
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const supabaseUser = createUserClient(req);
    const supabaseAdmin = createAdminClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const body = (await req.json()) as RequestBody;
    const appId = body?.appId?.trim();
    const instruction = body?.instruction?.trim();
    const pageId = body?.pageId?.trim();
    const componentReference = body?.componentReference;

    if (!appId || !instruction) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "appId and instruction are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Verify ownership via RLS-safe query
    const { data: appRow, error: appError } = await supabaseUser
      .from("apps")
      .select("id, title")
      .eq("id", appId)
      .single();
    if (appError || !appRow) {
      return new Response(
        JSON.stringify({ success: false, error: "App not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Load active config from view
    const { data: active, error: activeError } = await supabaseUser
      .from("apps_with_active_config")
      .select("app_config, active_version")
      .eq("id", appId)
      .single();
    if (activeError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to load active config",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const currentConfig = active?.app_config ?? {};

    // Log component reference and pageId if provided
    console.log("Request details:", {
      pageId: pageId || "not provided",
      componentReference: componentReference
        ? {
            componentId: componentReference.componentId,
            componentType: componentReference.componentType,
            componentPath: componentReference.componentPath,
            pageId: componentReference.pageId,
            layoutId: componentReference.layoutId,
          }
        : "not provided",
    });

    // Performance optimization: Filter config to only relevant parts
    const currentPageId = pageId || componentReference?.pageId;
    const buildFilteredConfig = (config: any) => {
      if (currentPageId && config.pages?.[currentPageId]) {
        const page = config.pages[currentPageId];
        const filtered: any = {
          pages: {
            [currentPageId]: page,
          },
        };

        // Include the referenced layout if the page uses one
        const layoutId = page?.layout;
        if (layoutId && config.layouts?.[layoutId]) {
          filtered.layouts = {
            [layoutId]: config.layouts[layoutId],
          };
        }

        return filtered;
      }

      // Fallback: no specific page - return all pages and layouts
      return {
        pages: config.pages,
        layouts: config.layouts,
      };
    };

    let filteredConfig = buildFilteredConfig(currentConfig);

    console.log(
      "Filtered config size:",
      JSON.stringify(filteredConfig).length,
      "bytes"
    );
    console.log(
      "Original config size:",
      JSON.stringify(currentConfig).length,
      "bytes"
    );

    // Load per-app credentials for target project (needed to read DB schema)
    let promptDbSchema: any[] | null = null;
    let promptComponentCatalog: any[] | null = null;
    try {
      const { data: appCredentials, error: credentialsError } =
        await supabaseAdmin
          .from("apps_credentials")
          .select(
            "supabase_url, supabase_anon_key, supabase_service_key, project_ref"
          )
          .eq("app_id", appId)
          .single();

      if (
        !credentialsError &&
        appCredentials &&
        appCredentials.supabase_url &&
        appCredentials.supabase_service_key
      ) {
        const target = createClient(
          appCredentials.supabase_url,
          appCredentials.supabase_service_key
        );
        const schema = await getOrRefreshSchema(supabaseAdmin, target, appId);
        promptDbSchema = buildPromptSchema(schema, instruction);
        if (promptDbSchema) {
          const schemaPreview = JSON.stringify(promptDbSchema).slice(0, 2000);
          console.log("Prompt DB schema preview:", schemaPreview);
          if (schemaPreview.length === 2000) {
            console.log("Prompt DB schema preview truncated");
          }
        } else {
          console.log("No schema available for prompt");
        }
      } else {
        console.log(
          "App credentials not found or incomplete; skipping DB schema in prompt"
        );
      }
    } catch (e) {
      console.error("Failed to prepare DB schema for prompt:", e);
    }

    try {
      promptComponentCatalog = buildPromptComponentCatalog(instruction);
      if (promptComponentCatalog) {
        const catalogPreview = JSON.stringify(promptComponentCatalog).slice(
          0,
          2000
        );
        console.log("Prompt component catalog preview:", catalogPreview);
        if (catalogPreview.length === 2000) {
          console.log("Prompt component catalog preview truncated");
        }
      } else {
        console.log("No component catalog available for prompt");
      }
    } catch (e) {
      console.error("Failed to prepare component catalog for prompt:", e);
    }

    // Call Gemini to get operations (JSON patches + optional migrations)
    const promptConfigSchemaSlice = buildPromptConfigSchemaSlice();
    const contextAssets = {
      dbSchema: promptDbSchema || undefined,
      componentCatalog: promptComponentCatalog || undefined,
      configSchemaSlice: promptConfigSchemaSlice || undefined,
      componentReference,
    };

    let ops = await callGeminiFlash({
      instruction,
      currentConfig: filteredConfig,
      ...contextAssets,
    });

    let workingConfig: any = currentConfig;
    let patchOps: any[] = [];
    let migrationOps: any[] = [];
    let ddlOps: any[] = [];
    let seedOps: any[] = [];

    for (let attempt = 0; attempt < MAX_REPAIR_ATTEMPTS; attempt++) {
      console.log(`aiOps[attempt ${attempt}]`, JSON.stringify(ops, null, 2));

      const newPatchOps = extractPatchOps(ops);
      const newMigrationOps = extractMigrationOps(ops);
      patchOps = patchOps.concat(newPatchOps);
      migrationOps = migrationOps.concat(newMigrationOps);

      console.log(
        `Detected ${newPatchOps.length} patches and ${newMigrationOps.length} migrations (attempt ${attempt})`
      );

      try {
        workingConfig = applyJsonPatch(workingConfig, newPatchOps);
      } catch (e) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to apply patch",
            detail: String(e),
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      const validation = validateAppConfig(workingConfig);
      if (validation.valid) {
        ddlOps = migrationOps.filter((m: any) =>
          [
            "create_table",
            "add_column",
            "drop_column",
            "alter_table",
            "create_index",
            "drop_table",
          ].includes(m.operation)
        );
        seedOps = migrationOps.filter((m: any) => m.operation === "seed_rows");
        filteredConfig = buildFilteredConfig(workingConfig);
        break;
      }

      console.error("app_config schema validation failed", validation.errors);

      if (attempt === MAX_REPAIR_ATTEMPTS - 1) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "app_config validation failed",
            validationErrors: validation.errors,
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      const repairInstruction = buildRepairInstruction(
        instruction,
        validation.errors
      );

      const repairFilteredConfig = buildFilteredConfig(workingConfig);
      ops = await callGeminiFlash({
        instruction: repairInstruction,
        currentConfig: repairFilteredConfig,
        ...contextAssets,
      });
    }

    const updatedConfig: any = workingConfig;

    // Get next version
    const { data: nextVersion, error: versionError } = await supabaseAdmin.rpc(
      "next_app_config_version",
      { p_app_id: appId }
    );
    if (versionError) {
      console.error("Failed to get next version:", versionError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to get next version" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Insert new config version
    const { data: configRow, error: configError } = await supabaseAdmin
      .from("app_configs")
      .insert({
        app_id: appId,
        version: nextVersion,
        data: updatedConfig,
        message: instruction,
        created_by: user.id,
      })
      .select("id, version")
      .single();
    if (configError) {
      console.error("Failed to insert config version:", configError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create config version",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Update pointer
    const { error: pointerError } = await supabaseAdmin
      .from("app_config_pointers")
      .upsert({
        app_id: appId,
        version: nextVersion,
        updated_by: user.id,
      });
    if (pointerError) {
      console.error("Failed to update pointer:", pointerError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to update active version",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // If there are migrations, execute them against the app's own Supabase project
    let migrationsExecuted = 0;
    let migrationsFailed: string[] = [];
    let seedsExecuted = 0;
    let seedsFailed: string[] = [];

    if (migrationOps.length > 0) {
      console.log("Starting migration execution...", {
        migrationCount: migrationOps.length,
      });
      try {
        // Load per-app credentials for target project
        console.log("Loading app credentials for appId:", appId);
        const { data: appCredentials, error: credentialsError } =
          await supabaseAdmin
            .from("apps_credentials")
            .select(
              "supabase_url, supabase_anon_key, supabase_service_key, project_ref"
            )
            .eq("app_id", appId)
            .single();

        if (credentialsError || !appCredentials) {
          console.error("App credentials error:", credentialsError);
          throw new Error("App credentials not found");
        }

        console.log("App credentials loaded successfully:", {
          project_ref: appCredentials.project_ref,
          has_url: !!appCredentials.supabase_url,
          has_service_key: !!appCredentials.supabase_service_key,
        });

        const result = await executeMigrations(
          ddlOps,
          seedOps,
          appCredentials,
          supabaseAdmin,
          appId
        );

        migrationsExecuted = result.migrationsExecuted;
        migrationsFailed = result.migrationsFailed;
        seedsExecuted = result.seedsExecuted;
        seedsFailed = result.seedsFailed;

        // Log summary to main project
        await supabaseAdmin.from("app_migrations").insert({
          app_id: appId,
          project_ref: appCredentials.project_ref,
          executed_at: new Date().toISOString(),
          summary: { executed: migrationsExecuted, failed: migrationsFailed },
        } as any);
      } catch (merr) {
        console.error("Migration execution error:", merr);
      }
    } else {
      console.log("No migrations to execute");
    }

    return new Response(
      JSON.stringify({
        success: true,
        version: nextVersion,
        patchCount: patchOps.length,
        migrations: {
          executed: migrationsExecuted,
          failed: migrationsFailed.length,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (err) {
    console.error("ai-config-edit error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
