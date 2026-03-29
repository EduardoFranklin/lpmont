import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Variable substitution from lead data
function substituteVariables(template: string, lead: any): string {
  const vars: Record<string, string> = {
    "{{nome}}": lead.name || "",
    "{{email}}": lead.email || "",
    "{{telefone}}": lead.phone || "",
    "{{tratamento}}": lead.treatment || "Dr.",
    "{{cidade}}": lead.city || "",
    "{{score}}": String(lead.quiz_score ?? ""),
    "{{data}}": lead.reuniao_data_extenso || lead.scheduled_day || "",
    "{{hora}}": lead.reuniao_hora_extenso || lead.scheduled_time || "",
    "{{reuniao_link_google_meet}}": lead.reuniao_link_google_meet || "",
    "{{id_lead}}": lead.id || "",
  };
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

// Format phone to E.164
function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 11 || digits.length === 10) return `+55${digits}`;
  return `+55${digits}`;
}

// Check if within sending window (08-21h São Paulo)
function isWithinSendingWindow(): boolean {
  const now = new Date();
  const spTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const hour = spTime.getHours();
  return hour >= 8 && hour < 21;
}

// Send WhatsApp via Z-API
async function sendWhatsApp(phone: string, message: string, settings: any): Promise<{ success: boolean; error?: string }> {
  const instanceId = settings.zapi_instance_id;
  const token = settings.zapi_token;
  const clientToken = settings.zapi_client_token;

  if (!instanceId || !token) {
    return { success: false, error: "Z-API não configurada" };
  }

  try {
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientToken ? { "Client-Token": clientToken } : {}),
      },
      body: JSON.stringify({ phone: formatPhoneE164(phone), message }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Z-API ${res.status}: ${body}` };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// Send email via SMTP edge function (reuse existing send-welcome-email pattern)
async function sendEmail(
  to: string, subject: string, body: string, supabaseUrl: string, serviceKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.hostinger.com";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const smtpUser = Deno.env.get("SMTP_USER") || "contato@metodomont.com.br";
    const smtpPass = Deno.env.get("SMTP_PASSWORD");

    if (!smtpPass) {
      return { success: false, error: "SMTP_PASSWORD not configured" };
    }

    // Use the existing send-welcome-email function for actual sending
    const res = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html: body.replace(/\n/g, "<br>"),
        from_name: "Prof. Breno Mont'Alverne",
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { success: false, error: `Email ${res.status}: ${errBody}` };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch pending messages that are due
    const { data: pendingMessages, error: fetchError } = await supabase
      .from("message_queue")
      .select("*, leads(*)")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for")
      .limit(50);

    if (fetchError) throw fetchError;
    if (!pendingMessages || pendingMessages.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check sending window
    if (!isWithinSendingWindow()) {
      console.log("Outside sending window (08-21h SP). Skipping.");
      return new Response(JSON.stringify({ processed: 0, reason: "outside_window" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch Z-API settings
    const { data: settingsRows } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["zapi_instance_id", "zapi_token", "zapi_client_token"]);

    const settings: Record<string, string> = {};
    for (const row of settingsRows || []) {
      settings[row.key] = row.value;
    }

    let processed = 0;
    let errors = 0;

    for (const msg of pendingMessages) {
      const lead = msg.leads;
      if (!lead) {
        await supabase.from("message_queue").update({
          status: "failed",
          last_error: "Lead not found",
          attempts: msg.attempts + 1,
        }).eq("id", msg.id);
        errors++;
        continue;
      }

      // Check if lead already purchased (cancel all sales funnel messages)
      if (lead.status === "convertido" && msg.funnel !== "F4") {
        await supabase.from("message_queue").update({ status: "cancelled" }).eq("id", msg.id);
        continue;
      }

      // Substitute variables in body and subject
      const body = substituteVariables(msg.body, lead);
      const subject = msg.subject ? substituteVariables(msg.subject, lead) : null;

      let result: { success: boolean; error?: string };

      if (msg.channel === "whatsapp") {
        result = await sendWhatsApp(lead.phone, body, settings);
      } else {
        result = await sendEmail(lead.email, subject || "Método Mont'Alverne", body, supabaseUrl, serviceKey);
      }

      if (result.success) {
        await supabase.from("message_queue").update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempts: msg.attempts + 1,
        }).eq("id", msg.id);

        // Log to history
        await supabase.from("message_history").insert({
          lead_id: lead.id,
          funnel: msg.funnel,
          step_key: msg.step_key,
          channel: msg.channel,
          subject: subject,
          body_preview: body.substring(0, 150),
          status: "sent",
        });

        processed++;
      } else {
        const newAttempts = msg.attempts + 1;
        await supabase.from("message_queue").update({
          status: newAttempts >= 3 ? "failed" : "pending",
          last_error: result.error,
          attempts: newAttempts,
          // Retry in 5 minutes
          ...(newAttempts < 3 ? { scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString() } : {}),
        }).eq("id", msg.id);
        errors++;
      }
    }

    return new Response(JSON.stringify({ processed, errors, total: pendingMessages.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("process-message-queue error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
