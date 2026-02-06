// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
// @ts-ignore
import { serve } from "https://deno.land/std@0.132.0/http/server.ts";

interface WebhookPayload {
  user_id: string;
  token: string;
  title: string;
  body: string;
}

// @ts-ignore
const SUPABASE_URL = Deno.env.get("BASE_SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

// @ts-ignore
const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const { data } = await supabaseAdmin
    .from("expo_tokens")
    .select("token")
    .eq("user_id", payload.user_id);

  let res;
  try {
    if (!data || data.length === 0) {
      throw new Error("No valid tokens found for the user");
    }

    // Create an array of notification messages
    // Each message is formatted for the Expo push notification service
    const messages = data.map((item) => ({
      to: item.token, // The Expo push token for the device
      sound: "default", // Use the default notification sound
      body: payload.body, // The main content of the notification
      title: payload.title, // The title of the notification
    }));

    // Yes, this will send the notification to every token in the 'data' array
    // If a user has multiple devices, they will receive the notification on all of them

    // Send the push notifications to Expo's push notification service
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST", // Use POST method to send data
      headers: {
        "Content-Type": "application/json", // Specify JSON content type
        Authorization: `Bearer ${EXPO_ACCESS_TOKEN}`, // Authenticate with Expo
      },
      body: JSON.stringify(messages), // Convert messages array to JSON string
    });

    // The Expo service will handle sending to multiple tokens in a single request
    // This is more efficient than sending individual requests for each token

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    res = await response.json();

    if (res.errors && res.errors.length > 0) {
      throw new Error(res.errors[0].message);
    }
  } catch (error) {
    console.error("Error sending push notifications:", error);
    res = {
      error:
        error instanceof Error
          ? error.message
          : "Failed to send push notifications",
    };
  }

  return new Response(JSON.stringify(res), {
    headers: { "Content-Type": "application/json" },
  });
});
