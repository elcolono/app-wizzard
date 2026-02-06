// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
// @ts-ignore
import { serve } from "https://deno.land/std@0.132.0/http/server.ts";

// Environment
// @ts-ignore
const SUPABASE_URL = Deno.env.get("BASE_SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.substring(7) : null;
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify user from JWT
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Best-effort delete from public tables first (ignore errors but report)
    const errors: string[] = [];
    const collect = (e: any) => {
      if (e) errors.push(e.message || String(e));
    };

    const delExpo = await supabaseAdmin
      .from("expo_tokens")
      .delete()
      .eq("user_id", userId);
    collect(delExpo.error);

    const delClubMembers = await supabaseAdmin
      .from("club_members")
      .delete()
      .eq("user_id", userId);
    collect(delClubMembers.error);

    const delDaily = await supabaseAdmin
      .from("daily_checkins")
      .delete()
      .eq("user_id", userId);
    collect(delDaily.error);

    const delUsers = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);
    collect(delUsers.error);

    // Delete auth user (requires service role)
    // @ts-ignore
    const delAuth = await supabaseAdmin.auth.admin.deleteUser(userId);
    // Some SDKs return nothing on success; no error thrown means success

    const body = { ok: true, warnings: errors.length ? errors : undefined };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message || "Unexpected error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
