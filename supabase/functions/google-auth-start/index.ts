import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

  if (!GOOGLE_CLIENT_ID) {
    return new Response(JSON.stringify({ error: "GOOGLE_CLIENT_ID not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { user_id, redirect_url } = await req.json();

  const state = btoa(JSON.stringify({ user_id, redirect_url }));
  const callbackUrl = `${SUPABASE_URL}/functions/v1/google-auth-callback`;
  const scopes = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", callbackUrl);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", state);

  return new Response(JSON.stringify({ url: authUrl.toString() }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
