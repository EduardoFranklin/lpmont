import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // contains user_id + redirect_url

  if (!code || !state) {
    return new Response("Missing code or state", { status: 400 });
  }

  let stateData: { user_id: string; redirect_url: string };
  try {
    stateData = JSON.parse(atob(state));
  } catch {
    return new Response("Invalid state", { status: 400 });
  }

  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return new Response("Google OAuth not configured", { status: 500 });
  }

  // Exchange code for tokens
  const callbackUrl = `${SUPABASE_URL}/functions/v1/google-auth-callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error("Token exchange failed:", tokenData);
    return new Response(`Token exchange failed: ${JSON.stringify(tokenData)}`, { status: 400 });
  }

  // Get user email from Google
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userInfo = await userInfoRes.json();

  // Store tokens in DB
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const expiryDate = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from("google_oauth_tokens")
    .upsert({
      user_id: stateData.user_id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expiry: expiryDate,
      email: userInfo.email || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) {
    console.error("DB error:", error);
    return new Response("Failed to store tokens", { status: 500 });
  }

  // Redirect back to dashboard
  const redirectUrl = stateData.redirect_url || "/dash";
  return new Response(null, {
    status: 302,
    headers: { Location: redirectUrl },
  });
});
