import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shard/cors.ts";

const EXPECTED_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

console.log("chat handler up and running!");

serve(async (req: Request) => {
  console.log("chat request:", req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Puck cloud-client sendet den Anon Key im Header "x-api-key" (vgl. cloud-api.ts)
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

  try {
    const payload = await req.json();
    console.log("chat payload:", payload);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON payload" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
