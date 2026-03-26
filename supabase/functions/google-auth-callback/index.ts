import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Step 1: POST → Generate auth URL (called from frontend)
  if (req.method === "POST") {
    try {
      const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
      if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");

      const { redirectUri, userId } = await req.json();
      if (!userId) throw new Error("userId is required");

      const state = JSON.stringify({ userId, redirectUri });

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/calendar.events",
        access_type: "offline",
        prompt: "consent",
        state,
      });

      return new Response(
        JSON.stringify({
          authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Step 2: GET → Google redirects here with ?code=...&state=...
  if (req.method === "GET") {
    try {
      const code = url.searchParams.get("code");
      const stateParam = url.searchParams.get("state");

      if (!code || !stateParam) {
        return new Response("<p>Erro: parâmetros ausentes.</p>", {
          status: 400,
          headers: { "Content-Type": "text/html" },
        });
      }

      const { userId, redirectUri } = JSON.parse(stateParam);

      const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
      const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

      // Exchange code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        console.error("Token exchange failed:", tokenData);
        return new Response(`<p>Erro na troca de token: ${JSON.stringify(tokenData)}</p>`, {
          status: 400,
          headers: { "Content-Type": "text/html" },
        });
      }

      // Get user email
      const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();

      // Store tokens in database
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);

      const tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      // Delete existing tokens for this user then insert new ones
      await supabase.from("google_oauth_tokens").delete().eq("user_id", userId);
      await supabase.from("google_oauth_tokens").insert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expiry: tokenExpiry,
        email: profile.email || null,
      });

      // Return HTML that notifies the opener and closes
      const html = `<!DOCTYPE html><html><body><script>
        window.opener?.postMessage({ type: "google-auth-success" }, "*");
        window.close();
      </script><p>✅ Autorização concluída! Pode fechar esta janela.</p></body></html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (err) {
      console.error("OAuth callback error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      return new Response(`<p>Erro: ${msg}</p>`, {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});
