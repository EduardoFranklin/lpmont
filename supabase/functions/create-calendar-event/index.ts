import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "mktmetodomont@gmail.com";
const CONTATO_EMAIL = "contato@metodomont.com.br";

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      title,
      description,
      dateStr,    // "dd/mm"
      timeSlot,   // "9h às 9h30"
      guestEmail,
      guestName,
      treatment,
    } = await req.json();

    if (!dateStr || !timeSlot || !guestEmail) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get admin tokens (first available)
    const { data: tokenRow, error: tokenErr } = await supabase
      .from("google_oauth_tokens")
      .select("*")
      .limit(1)
      .single();

    if (tokenErr || !tokenRow) {
      return new Response(
        JSON.stringify({ error: "Google Calendar não está conectado. O administrador precisa autorizar o acesso." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired, refresh if needed
    let accessToken = tokenRow.access_token;
    const expiry = new Date(tokenRow.token_expiry);
    if (expiry.getTime() - Date.now() < 60000) {
      const refreshed = await refreshAccessToken(tokenRow.refresh_token);
      accessToken = refreshed.access_token;
      const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
      await supabase
        .from("google_oauth_tokens")
        .update({ access_token: accessToken, token_expiry: newExpiry })
        .eq("id", tokenRow.id);
    }

    // Parse date and time
    const [dd, mm] = dateStr.split("/").map(Number);
    const year = new Date().getFullYear();
    const timeMatch = timeSlot.match(/^(\d+)h/);
    const startHour = timeMatch ? parseInt(timeMatch[1]) : 9;

    // Build ISO date strings with São Paulo timezone offset
    const pad = (n: number) => String(n).padStart(2, "0");
    const startDateTime = `${year}-${pad(mm)}-${pad(dd)}T${pad(startHour)}:00:00`;
    const endDateTime = `${year}-${pad(mm)}-${pad(dd)}T${pad(startHour)}:30:00`;

    const eventName = title || `Reunião Método Mont' - ${treatment || ""} ${guestName || "Lead"}`;
    const eventDesc = description || `Reunião online de 30 min com a equipe do Método Mont'.`;

    // Create event with Google Meet
    const calRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: eventName,
        description: eventDesc,
        start: {
          dateTime: startDateTime,
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "America/Sao_Paulo",
        },
        attendees: [
          { email: guestEmail },
          { email: ADMIN_EMAIL },
          { email: CONTATO_EMAIL },
        ],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 60 },
            { method: "popup", minutes: 30 },
          ],
        },
        guestsCanModify: false,
        sendUpdates: "all",
      }),
    });

    const calData = await calRes.json();

    if (!calRes.ok) {
      console.error("Calendar API error:", calData);
      return new Response(
        JSON.stringify({ error: "Erro ao criar evento no Google Calendar", details: calData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const meetLink = calData.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === "video"
    )?.uri || null;

    return new Response(
      JSON.stringify({
        success: true,
        eventId: calData.id,
        htmlLink: calData.htmlLink,
        calendarLink: calData.htmlLink,
        meetLink,
        startDateTime,
        googleCalendarEventId: calData.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Create calendar event error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
