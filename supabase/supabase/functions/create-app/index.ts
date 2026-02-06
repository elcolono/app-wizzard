// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types
type CreateAppBody = {
  title: string;
  description?: string;
  image?: string;
  appConfig?: any;
  region?: string; // e.g. "eu-central-1"
};

type SupabaseProject = {
  id: string; // project ref
  name: string;
  status: string;
  organization_id: string;
  region: string;
};

type ApiKey = {
  name: string;
  api_key: string;
};

type ApiKeysResponse = ApiKey[];

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Management API credentials
const MGMT_TOKEN = Deno.env.get("MANAGEMENT_TOKEN")!;
const ORG_ID = Deno.env.get("ORG_ID")!; // Your org id
const DEFAULT_REGION =
  Deno.env.get("SUPABASE_DEFAULT_REGION") || "eu-central-1";
const DEFAULT_DB_PASS =
  Deno.env.get("SUPABASE_DEFAULT_DB_PASS") || crypto.randomUUID();

// Avoid logging sensitive secrets in production

// Bootstrap SQL to provision a safe DDL-only RPC in the target project
const BOOTSTRAP_SQL = `
create extension if not exists pgcrypto;

create or replace function public.execute_sql(sql text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s text := sql;
begin
  -- Strip leading whitespace and comments
  s := regexp_replace(s, '^(?:\\s|/\\*.*?\\*/|--.*?\\n)+', '', 'gs');

  -- Block DML/CTE; allow DDL like CREATE/ALTER/DROP
  if s ~* '^\\s*(select|insert|update|delete|with)\\b' then
    raise exception 'Only DDL allowed';
  end if;

  execute s;
end;
$$;

revoke all on function public.execute_sql(text) from public, anon, authenticated;
grant execute on function public.execute_sql(text) to service_role;
`;

// Run bootstrap SQL against a newly created Supabase project via Management API
async function bootstrapProjectSql(projectRef: string) {
  console.log(`Bootstrapping project SQL for: ${projectRef}`);
  const resp = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/sql`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MGMT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: BOOTSTRAP_SQL }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    console.error(
      `Bootstrap SQL failed for ${projectRef}: ${resp.status} ${text}`
    );
    throw new Error(
      `Failed to bootstrap SQL in project ${projectRef}: ${resp.status}`
    );
  }

  console.log(`Bootstrap SQL applied successfully for: ${projectRef}`);
}

// Helper functions to create Supabase clients
// 1) Client acting as the end-user (for auth checks)
function createUserClient(req: Request) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") ?? "",
      },
    },
  });
}

// 2) Admin client using service role (bypasses RLS). Do NOT attach Authorization header here.
function createAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Create a new Supabase project via Management API
async function createSupabaseProject(
  name: string,
  region: string
): Promise<SupabaseProject> {
  console.log(`Creating Supabase project: ${name} in region: ${region}`);

  const response = await fetch(`https://api.supabase.com/v1/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MGMT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      organization_id: ORG_ID,
      name: name.replace(/[^a-zA-Z0-9-]/g, "-"), // Sanitize name
      region: region || DEFAULT_REGION,
      db_pass: DEFAULT_DB_PASS,
      plan: "free",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Project creation failed: ${response.status} ${errorText}`);
    throw new Error(
      `Failed to create Supabase project: ${response.status} ${errorText}`
    );
  }

  const project = (await response.json()) as SupabaseProject;
  console.log(`Project created successfully: ${project.id}`);
  return project;
}

// Fetch API keys for a project
async function fetchProjectKeys(
  projectRef: string
): Promise<{ anon: string; service_role: string }> {
  console.log(`Fetching API keys for project: ${projectRef}`);

  // Wait a bit for project to be ready
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/api-keys`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MGMT_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch API keys: ${response.status} ${errorText}`);
    throw new Error(
      `Failed to fetch API keys: ${response.status} ${errorText}`
    );
  }

  const keys = (await response.json()) as ApiKeysResponse;
  console.log(`API keys fetched: ${keys.length} keys found`);

  const result: { anon: string; service_role: string } = {
    anon: "",
    service_role: "",
  };

  for (const key of keys) {
    if (key.name === "anon") result.anon = key.api_key;
    if (key.name === "service_role") result.service_role = key.api_key;
  }

  if (!result.anon || !result.service_role) {
    throw new Error("Required API keys not found in response");
  }

  return result;
}

// Get project API URL
function getProjectApiUrl(projectRef: string): string {
  return `https://${projectRef}.supabase.co`;
}

// Main handler
serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Create Supabase clients
    const supabaseUser = createUserClient(req);
    const supabaseAdmin = createAdminClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response("Unauthorized", { status: 401 });
    }

    console.log(`Creating app for user: ${user.id}`);

    // Parse request body
    const body = (await req.json()) as CreateAppBody;

    if (!body?.title || body.title.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Title is required and cannot be empty",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate title length
    if (body.title.length > 100) {
      return new Response(
        JSON.stringify({
          error: "Title must be 100 characters or less",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1) Create Supabase project
    const project = await createSupabaseProject(
      body.title,
      body.region || DEFAULT_REGION
    );

    const projectRef = project.id;

    // 2) Fetch API keys (with retry logic)
    let keys: { anon: string; service_role: string } | null = null;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        keys = await fetchProjectKeys(projectRef);
        break;
      } catch (error) {
        retries++;
        console.log(`Attempt ${retries} failed, retrying...`);

        if (retries >= maxRetries) {
          throw error;
        }

        // Wait longer between retries
        await new Promise((resolve) => setTimeout(resolve, 10000 * retries));
      }
    }

    // 3) Get project URL
    const projectUrl = getProjectApiUrl(projectRef);

    if (!keys) {
      throw new Error("Project API keys unavailable after retries");
    }

    // 3a) Bootstrap target project with execute_sql RPC (DDL-only)
    try {
      await bootstrapProjectSql(projectRef);
    } catch (e) {
      console.error("Project bootstrap failed:", e);
      // Decide policy: fail fast to guarantee migrations will work
      throw e;
    }

    // 4) Store app data in our database
    // First, insert into apps table
    const { data: appRow, error: insertAppError } = await supabaseAdmin
      .from("apps")
      .insert({
        user_id: user.id,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        image: body.image || null,
        app_config: body.appConfig || {},
      })
      .select("id")
      .single();

    if (insertAppError) {
      console.error("Failed to insert app:", insertAppError);
      throw new Error(`Failed to save app data: ${insertAppError.message}`);
    }

    // Then, insert credentials
    const { error: insertCredsError } = await supabaseAdmin
      .from("apps_credentials")
      .insert({
        app_id: appRow.id,
        supabase_url: projectUrl,
        supabase_anon_key: keys.anon,
        supabase_service_key: keys.service_role,
        project_ref: projectRef,
      });

    if (insertCredsError) {
      console.error("Failed to insert credentials:", insertCredsError);
      throw new Error(
        `Failed to save app credentials: ${insertCredsError.message}`
      );
    }

    console.log(`App created successfully: ${appRow.id}`);

    // Return success response (no sensitive data)
    return new Response(
      JSON.stringify({
        success: true,
        appId: appRow.id,
        projectRef,
        supabaseUrl: projectUrl,
        message: "App created successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Create app error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
