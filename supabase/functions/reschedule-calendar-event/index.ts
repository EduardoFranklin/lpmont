import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    const { leadId, newDateTimeISO } = await req.json();

    if (!leadId || !newDateTimeISO) {
      return new Response(JSON.stringify({ error: "leadId and newDateTimeISO are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get lead data
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadErr || !lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventId = lead.google_calendar_event_id;

    // Get admin tokens
    const { data: tokenRow, error: tokenErr } = await supabase
      .from("google_oauth_tokens")
      .select("*")
      .limit(1)
      .single();

    if (tokenErr || !tokenRow) {
      return new Response(
        JSON.stringify({ error: "Google Calendar não conectado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Parse the new date/time — force São Paulo interpretation
    const dt = new Date(newDateTimeISO);
    const pad = (n: number) => String(n).padStart(2, "0");

    // Extract São Paulo local components using Intl formatter
    const spFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
    const spParts = Object.fromEntries(
      spFormatter.formatToParts(dt).map((p) => [p.type, p.value])
    );
    const startDateTime = `${spParts.year}-${spParts.month}-${spParts.day}T${spParts.hour}:${spParts.minute}:00`;
    const endDt = new Date(dt.getTime() + 30 * 60000);
    const spPartsEnd = Object.fromEntries(
      spFormatter.formatToParts(endDt).map((p) => [p.type, p.value])
    );
    const endDateTime = `${spPartsEnd.year}-${spPartsEnd.month}-${spPartsEnd.day}T${spPartsEnd.hour}:${spPartsEnd.minute}:00`;

    // Build human-readable strings using São Paulo local time
    const spDayFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long" });
    const diasMap: Record<string, string> = {
      "domingo": "Domingo", "segunda-feira": "Segunda", "terça-feira": "Terça",
      "quarta-feira": "Quarta", "quinta-feira": "Quinta", "sexta-feira": "Sexta", "sábado": "Sábado",
    };
    const dataExtenso = diasMap[spDayFormatter.format(dt)] || spDayFormatter.format(dt);
    const spH = parseInt(spParts.hour);
    const spEndH = parseInt(spPartsEnd.hour);
    const spEndM = spPartsEnd.minute;
    const horaExtenso = `${spH}h às ${spEndH}h${spEndM !== "00" ? spEndM : "30"}`;

    let meetLink = lead.reuniao_link_google_meet;
    let calendarLink = lead.reuniao_link_google_calendar;
    let newEventId = eventId;

    if (eventId) {
      // Update existing event
      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?conferenceDataVersion=1&sendUpdates=all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: { dateTime: startDateTime, timeZone: "America/Sao_Paulo" },
            end: { dateTime: endDateTime, timeZone: "America/Sao_Paulo" },
          }),
        }
      );

      const calData = await calRes.json();
      if (!calRes.ok) {
        console.error("Calendar update error:", calData);
        return new Response(
          JSON.stringify({ error: "Erro ao atualizar evento", details: calData }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      meetLink = calData.conferenceData?.entryPoints?.find(
        (ep: any) => ep.entryPointType === "video"
      )?.uri || meetLink;
      calendarLink = calData.htmlLink || calendarLink;
    } else {
      // No event ID stored — create a new event
      const eventName = `Reunião Método Mont' - ${lead.treatment || ""} ${lead.name || "Lead"}`;
      const calRes = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: eventName,
            description: "Reunião online de 30 min com a equipe do Método Mont'.",
            start: { dateTime: startDateTime, timeZone: "America/Sao_Paulo" },
            end: { dateTime: endDateTime, timeZone: "America/Sao_Paulo" },
            attendees: [
              { email: lead.email },
              { email: "mktmetodomont@gmail.com" },
              { email: "contato@metodomont.com.br" },
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
            sendUpdates: "all",
          }),
        }
      );

      const calData = await calRes.json();
      if (!calRes.ok) {
        console.error("Calendar create error:", calData);
        return new Response(
          JSON.stringify({ error: "Erro ao criar evento", details: calData }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      newEventId = calData.id;
      meetLink = calData.conferenceData?.entryPoints?.find(
        (ep: any) => ep.entryPointType === "video"
      )?.uri || null;
      calendarLink = calData.htmlLink;
    }

    // Update lead record
    await supabase.from("leads").update({
      reuniao_data_hora_iso: newDateTimeISO,
      reuniao_data_extenso: dataExtenso,
      reuniao_hora_extenso: horaExtenso,
      reuniao_link_google_meet: meetLink,
      reuniao_link_google_calendar: calendarLink,
      google_calendar_event_id: newEventId,
      scheduled_day: `${spParts.day}/${spParts.month}`,
      scheduled_time: `${spH}h às ${spEndH}h${spEndM !== "00" ? spEndM : "30"}`,
      updated_at: new Date().toISOString(),
    }).eq("id", leadId);

    return new Response(
      JSON.stringify({
        success: true,
        meetLink,
        calendarLink,
        dataExtenso,
        horaExtenso,
        startDateTime,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Reschedule error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
