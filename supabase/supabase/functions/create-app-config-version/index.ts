// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type RequestBody = {
  appId?: string;
  config?: any;
  message?: string;
};

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function createUserClient(req: Request) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: req.headers.get("Authorization") ?? "" },
    },
  });
}

function createAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const body = (await req.json()) as RequestBody;
    const appId = body?.appId?.trim();
    const config = body?.config;
    const message = body?.message?.trim() || "Updated app configuration";

    if (!appId) {
      return new Response(
        JSON.stringify({ success: false, error: "appId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!config) {
      return new Response(
        JSON.stringify({ success: false, error: "config is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createUserClient(req);
    const supabaseAdmin = createAdminClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify ownership via RLS-safe query on apps (user client)
    const { data: appRow, error: appError } = await supabaseUser
      .from("apps")
      .select("id")
      .eq("id", appId)
      .single();
    if (appError || !appRow) {
      return new Response(
        JSON.stringify({ success: false, error: "App not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get next version number
    const { data: nextVersion, error: versionError } = await supabaseAdmin.rpc(
      "next_app_config_version",
      { p_app_id: appId }
    );

    if (versionError) {
      console.error("Failed to get next version:", versionError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to get next version" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert new config version
    const { data: configRow, error: configError } = await supabaseAdmin
      .from("app_configs")
      .insert({
        app_id: appId,
        version: nextVersion,
        data: config,
        message: message,
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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update pointer to new version
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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        version: nextVersion,
        configId: configRow.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-app-config-version error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

