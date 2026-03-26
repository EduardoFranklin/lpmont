import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    console.error("Token refresh failed:", await res.text());
    return null;
  }
  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadEmail, leadName, treatment, scheduledDay, scheduledTime } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the first available Google token (from any admin user)
    const { data: tokenRow, error: tokenError } = await supabaseAdmin
      .from("google_oauth_tokens")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (tokenError || !tokenRow) {
      console.log("No Google account connected, skipping calendar event");
      return new Response(JSON.stringify({ success: false, reason: "no_google_account" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Refresh token if expired
    let accessToken = tokenRow.access_token;
    if (new Date(tokenRow.token_expiry) <= new Date()) {
      const refreshed = await refreshAccessToken(tokenRow.refresh_token);
      if (!refreshed) {
        return new Response(JSON.stringify({ success: false, reason: "token_refresh_failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      accessToken = refreshed.access_token;
      const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
      await supabaseAdmin
        .from("google_oauth_tokens")
        .update({ access_token: accessToken, token_expiry: newExpiry, updated_at: new Date().toISOString() })
        .eq("id", tokenRow.id);
    }

    // Parse date and time - scheduledDay is like "Segunda" and scheduledTime like "9h às 9h30"
    // We need to figure out the actual date. scheduledDay comes as "dd/mm" format from the date field
    // Actually looking at Agendar.tsx, selectedSlot.day = d.day (weekday name) but the date is d.date (dd/mm)
    // Let me parse the time slot
    const timeMatch = scheduledTime.match(/^(\d+)h\s/);
    const startHour = timeMatch ? parseInt(timeMatch[1]) : 9;
    const startMinute = 0;
    const endMinute = 30;

    // scheduledDay is the weekday name like "Segunda", but we need the actual date
    // The date is passed separately or we calculate from the day name
    // Looking at the Agendar code, it saves scheduled_day as the weekday name
    // We need to find the next occurrence of that weekday
    const weekdayMap: Record<string, number> = {
      "Domingo": 0, "Segunda": 1, "Terça": 2, "Quarta": 3,
      "Quinta": 4, "Sexta": 5, "Sábado": 6,
    };
    
    const targetDow = weekdayMap[scheduledDay] ?? 1;
    const now = new Date();
    let eventDate = new Date(now);
    // Find next occurrence
    while (eventDate.getDay() !== targetDow || eventDate < now) {
      eventDate.setDate(eventDate.getDate() + 1);
    }

    // Build ISO dates in São Paulo timezone (UTC-3)
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, "0");
    const day = String(eventDate.getDate()).padStart(2, "0");
    const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:00`;
    const endTime = `${String(startHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`;

    // Create Google Calendar event with Meet
    const event = {
      summary: `Reunião - ${treatment} ${leadName}`,
      description: `Reunião agendada pelo Método Mont' com ${treatment} ${leadName}.\nEmail: ${leadEmail}`,
      start: {
        dateTime: `${year}-${month}-${day}T${startTime}`,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: `${year}-${month}-${day}T${endTime}`,
        timeZone: "America/Sao_Paulo",
      },
      attendees: [
        { email: leadEmail },
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
    };

    const calRes = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    const calData = await calRes.json();

    if (!calRes.ok) {
      console.error("Calendar API error:", calData);
      return new Response(JSON.stringify({ success: false, reason: "calendar_error", details: calData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      meetLink: calData.hangoutLink || null,
      eventId: calData.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error creating calendar event:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
