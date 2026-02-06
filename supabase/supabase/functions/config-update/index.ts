import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS Headers mit Environment Variable
function getCorsHeaders() {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// JSON Patch operations
interface JsonPatchOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: any;
  from?: string;
}

interface ConfigUpdateRequest {
  appId: string;
  operations: JsonPatchOperation[];
  operationType: "reorder" | "move" | "nest" | "unnest";
}

/**
 * Apply JSON Patch operations to an object
 */
function applyJsonPatch(obj: any, operations: JsonPatchOperation[]): any {
  let result = JSON.parse(JSON.stringify(obj)); // Deep clone

  for (const operation of operations) {
    try {
      result = applyOperation(result, operation);
    } catch (error) {
      console.error(`Failed to apply operation:`, operation, error);
      throw new Error(`Failed to apply operation: ${error.message}`);
    }
  }

  return result;
}

/**
 * Apply a single JSON Patch operation
 */
function applyOperation(obj: any, operation: JsonPatchOperation): any {
  const { op, path, value, from } = operation;

  switch (op) {
    case "add":
      return addValue(obj, path, value);
    case "remove":
      return removeValue(obj, path);
    case "replace":
      return replaceValue(obj, path, value);
    case "move":
      return moveValue(obj, from!, path);
    case "copy":
      return copyValue(obj, from!, path);
    case "test":
      return testValue(obj, path, value);
    default:
      throw new Error(`Unsupported operation: ${op}`);
  }
}

/**
 * Add a value at the specified path
 */
function addValue(obj: any, path: string, value: any): any {
  const pathParts = path.split("/").filter((p) => p !== "");
  let current = obj;

  // Navigate to parent
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  // Set the value
  const key = pathParts[pathParts.length - 1];
  current[key] = value;

  return obj;
}

/**
 * Remove a value at the specified path
 */
function removeValue(obj: any, path: string): any {
  const pathParts = path.split("/").filter((p) => p !== "");
  let current = obj;

  // Navigate to parent
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (!current[part]) {
      return obj; // Path doesn't exist, nothing to remove
    }
    current = current[part];
  }

  // Remove the value
  const key = pathParts[pathParts.length - 1];
  delete current[key];

  return obj;
}

/**
 * Replace a value at the specified path
 */
function replaceValue(obj: any, path: string, value: any): any {
  const pathParts = path.split("/").filter((p) => p !== "");
  let current = obj;

  // Navigate to the target
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (!current[part]) {
      throw new Error(`Path not found: ${path}`);
    }
    current = current[part];
  }

  // Replace the value
  const key = pathParts[pathParts.length - 1];
  current[key] = value;

  return obj;
}

/**
 * Move a value from one path to another
 */
function moveValue(obj: any, from: string, to: string): any {
  // Get the value from source
  const value = getValueAtPath(obj, from);
  if (value === undefined) {
    throw new Error(`Source path not found: ${from}`);
  }

  // Remove from source
  const objWithoutSource = removeValue(obj, from);

  // Add to destination
  return addValue(objWithoutSource, to, value);
}

/**
 * Copy a value from one path to another
 */
function copyValue(obj: any, from: string, to: string): any {
  const value = getValueAtPath(obj, from);
  if (value === undefined) {
    throw new Error(`Source path not found: ${from}`);
  }

  return addValue(obj, to, JSON.parse(JSON.stringify(value))); // Deep clone
}

/**
 * Test if a value exists at the specified path
 */
function testValue(obj: any, path: string, expectedValue: any): any {
  const actualValue = getValueAtPath(obj, path);
  if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
    throw new Error(
      `Test failed: expected ${JSON.stringify(
        expectedValue
      )}, got ${JSON.stringify(actualValue)}`
    );
  }
  return obj;
}

/**
 * Get a value at the specified path
 */
function getValueAtPath(obj: any, path: string): any {
  const pathParts = path.split("/").filter((p) => p !== "");
  let current = obj;

  for (const part of pathParts) {
    if (current === null || current === undefined || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Update sibling orders after component moves
 */
function updateSiblingOrders(
  config: any,
  parentPath: string,
  action: "increment" | "decrement",
  fromOrder?: number
): any {
  const pathParts = parentPath.split("/").filter((p) => p !== "");
  let current = config;

  // Navigate to parent
  for (const part of pathParts) {
    if (!current[part]) {
      return config;
    }
    current = current[part];
  }

  // Update children orders
  if (current.children) {
    for (const [childId, child] of Object.entries(current.children)) {
      const childConfig = child as any;
      if (childConfig.order !== undefined) {
        if (action === "increment" && childConfig.order >= (fromOrder || 0)) {
          childConfig.order += 1;
        } else if (
          action === "decrement" &&
          childConfig.order > (fromOrder || 0)
        ) {
          childConfig.order -= 1;
        }
      }
    }
  }

  return config;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders();

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

    const { appId, operations, operationType }: ConfigUpdateRequest =
      await req.json();

    if (!appId || !operations || !Array.isArray(operations)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: appId, operations",
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

    // Get current active config
    const { data: active, error: activeError } = await supabaseAdmin
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

    // Apply operations
    let updatedConfig: any;
    try {
      updatedConfig = applyJsonPatch(currentConfig, operations);

      // Handle special order update operations
      for (const operation of operations) {
        if (operation.op === "update-sibling-orders") {
          updatedConfig = updateSiblingOrders(
            updatedConfig,
            operation.path,
            operation.action,
            operation.afterOrder || operation.fromOrder
          );
        }
      }
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to apply operations",
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

    // Get next version
    const { data: nextVersion, error: versionError } = await supabaseAdmin.rpc(
      "next_app_config_version",
      { app_id: appId }
    );

    if (versionError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to get next version",
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

    // Create new config version
    const { error: insertError } = await supabaseAdmin
      .from("app_configs")
      .insert({
        app_id: appId,
        version: nextVersion,
        config: updatedConfig,
        operation_type: operationType,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create new config version",
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
        updated_at: new Date().toISOString(),
      });

    if (pointerError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to update pointer",
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

    return new Response(
      JSON.stringify({
        success: true,
        version: nextVersion,
        operationType,
        operationsCount: operations.length,
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
    console.error("config-update error:", err);
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
