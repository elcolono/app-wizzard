// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = (Deno.env.get("ALLOWED_ORIGIN") || "*")
    .split(",")
    .map((s) => s.trim());

  const allowOrigin = allowed.includes("*")
    ? "*"
    : allowed.includes(origin)
    ? origin
    : allowed[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info, x-supabase-authorization, accept",
    "Access-Control-Max-Age": "86400",
  };
}

