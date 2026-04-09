import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── SLEEP HELPER ──────────────────────────────────────────
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ── VARIABLE SUBSTITUTION ─────────────────────────────────
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
    "{{reuniao_link_google_calendar}}": lead.reuniao_link_google_calendar || "",
    "{{id_lead}}": lead.id || "",
  };
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

// ── FORMAT PHONE ──────────────────────────────────────────
function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 11 || digits.length === 10) return `55${digits}`;
  return `55${digits}`;
}


// ── DETERMINISTIC HASH FOR VARIATION ──────────────────────
function hashToIndex(str: string, len: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % len;
}

// ── MESSAGE VARIATION (anti-ban: no identical messages) ───
function getTimeGreeting(): string {
  const now = new Date();
  const spTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const hour = spTime.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const aberturas = [
  "{{tratamento}} {{primeiro_nome}},",
  "Oi, {{tratamento}} {{primeiro_nome}}! 👋",
  "Olá, {{primeiro_nome}}!",
  "{{primeiro_nome}}, tudo bem?",
  "{{saudacao}}, {{tratamento}} {{primeiro_nome}}! ☀️",
];

const fechamentos = [
  "— Equipe Mont'Alverne",
  "— Prof. Breno Mont'Alverne",
  "Qualquer dúvida, é só responder aqui. 😊",
  "Estou à disposição. 🙏",
];

function addVariation(body: string, lead: any): string {
  const primeiroNome = (lead.name || "").split(" ")[0];
  const tratamento = lead.treatment || "Dr.";
  const saudacao = getTimeGreeting();

  const abIdx = hashToIndex(lead.id || "a", aberturas.length);
  const feIdx = hashToIndex((lead.id || "a") + "f", fechamentos.length);

  const abertura = aberturas[abIdx]
    .replace("{{primeiro_nome}}", primeiroNome)
    .replace("{{tratamento}}", tratamento)
    .replace("{{saudacao}}", saudacao);

  const fechamento = fechamentos[feIdx];

  return `${abertura}\n\n${body}\n\n${fechamento}`;
}

// ── HUMANIZED DELAY (simulates typing behavior) ──────────
function calculateHumanDelay(messageLength: number): number {
  // 1s per 30 chars, clamped 3s–12s
  const charDelay = Math.floor(messageLength / 30) * 1000;
  const baseDelay = Math.max(3000, Math.min(charDelay, 12000));
  // Jitter ±30%
  const jitter = baseDelay * (0.7 + Math.random() * 0.6);
  return Math.round(jitter);
}

// ── Z-API: SEND TYPING PRESENCE ──────────────────────────
async function zapiSendPresence(
  phone: string,
  presence: "composing" | "paused",
  settings: any
): Promise<void> {
  const instanceId = settings.zapi_instance_id;
  const token = settings.zapi_token;
  const clientToken = settings.zapi_client_token;
  if (!instanceId || !token) return;

  try {
    await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-presence`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clientToken ? { "Client-Token": clientToken } : {}),
        },
        body: JSON.stringify({ phone, presence }),
      }
    );
  } catch (e) {
    console.warn("Presence send failed:", e);
  }
}

// ── Z-API: SEND WHATSAPP WITH HUMANIZED DELAY ────────────
async function sendWhatsAppHumanized(
  phone: string,
  message: string,
  settings: any
): Promise<{ success: boolean; error?: string }> {
  const instanceId = settings.zapi_instance_id;
  const token = settings.zapi_token;
  const clientToken = settings.zapi_client_token;

  if (!instanceId || !token) {
    return { success: false, error: "Z-API não configurada" };
  }

  try {
    const formattedPhone = formatPhoneE164(phone);
    const totalDelay = calculateHumanDelay(message.length);

    // 1. Send "typing..." presence for 60% of delay
    const typingDuration = Math.round(totalDelay * 0.6);
    await zapiSendPresence(formattedPhone, "composing", settings);
    await sleep(typingDuration);

    // 2. Pause presence
    await zapiSendPresence(formattedPhone, "paused", settings);

    // 3. Wait remaining 40%
    await sleep(totalDelay - typingDuration);

    // 4. Send the actual message
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientToken ? { "Client-Token": clientToken } : {}),
      },
      body: JSON.stringify({ phone: formattedPhone, message }),
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

// ── SEND EMAIL ────────────────────────────────────────────
async function sendEmail(
  to: string,
  subject: string,
  body: string,
  supabaseUrl: string,
  serviceKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        recipientEmail: to,
        subject,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">${body.replace(/\n/g, "<br>")}</body></html>`,
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
// ── GLOBAL RATE LIMITS ────────────────────────────────────
const HOURLY_WA_LIMIT = 30;
const MAX_DAILY_WA = 200;
const MIN_SAME_LEAD_INTERVAL_SEC = 60;

// ── PROCESS ONE MESSAGE ───────────────────────────────────
async function processOneMessage(
  msg: any,
  supabase: any,
  settings: Record<string, string>,
  sentToLeadInBatch: Set<string>,
  supabaseUrl: string,
  serviceKey: string,
): Promise<"processed" | "error" | "skipped"> {
  // Re-fetch lead data fresh
  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("*")
    .eq("id", msg.lead_id)
    .single();

  if (leadErr || !lead) {
    await supabase
      .from("message_queue")
      .update({ status: "failed", last_error: "Lead not found", attempts: msg.attempts + 1 })
      .eq("id", msg.id);
    return "error";
  }

  // Re-validate tags at send time
  const { data: leadTagsRows } = await supabase
    .from("lead_tags")
    .select("tag")
    .eq("lead_id", lead.id);
  const leadTags = new Set((leadTagsRows || []).map((t: any) => t.tag));

  // Cancel sales funnels if lead already paid
  const hasPaid = leadTags.has("pagou") || leadTags.has("comprador") || lead.status === "convertido";
  if (hasPaid && msg.funnel !== "F4") {
    await supabase.from("message_queue").update({ status: "cancelled", last_error: "Lead já comprou" }).eq("id", msg.id);
    await supabase.from("message_queue")
      .update({ status: "cancelled", last_error: "Lead já comprou" })
      .eq("lead_id", lead.id).eq("funnel", msg.funnel).eq("status", "pending");
    return "skipped";
  }

  // Cancel if lead is perdido (except F4)
  if (lead.status === "perdido" && msg.funnel !== "F4") {
    await supabase.from("message_queue").update({ status: "cancelled", last_error: "Lead perdido" }).eq("id", msg.id);
    return "skipped";
  }

  // Re-check sequence conditions
  if (msg.sequence_id) {
    const { data: seqRow } = await supabase.from("automation_sequences").select("conditions").eq("id", msg.sequence_id).single();
    const cond = seqRow?.conditions as any || {};
    if (cond.required_tags?.length) {
      const missing = cond.required_tags.some((t: string) => !leadTags.has(t));
      if (missing) {
        await supabase.from("message_queue").update({ status: "cancelled", last_error: "Tag obrigatória ausente" }).eq("id", msg.id);
        return "skipped";
      }
    }
    if (cond.excluded_tags?.length) {
      const blocked = cond.excluded_tags.some((t: string) => leadTags.has(t));
      if (blocked) {
        await supabase.from("message_queue").update({ status: "cancelled", last_error: "Tag de exclusão presente" }).eq("id", msg.id);
        return "skipped";
      }
    }
  }

  // WA-specific anti-ban checks
  if (msg.channel === "whatsapp") {
    if (sentToLeadInBatch.has(lead.id)) {
      const newTime = new Date(Date.now() + 90 * 1000).toISOString();
      await supabase.from("message_queue").update({ scheduled_for: newTime }).eq("id", msg.id);
      console.log(`Lead ${lead.id}: already sent in this batch, rescheduling`);
      return "skipped";
    }

    if ((lead.wa_sem_resposta_count || 0) >= 3) {
      await supabase.from("message_queue")
        .update({ status: "cancelled", last_error: "wa_sem_resposta >= 3 — bloqueado" })
        .eq("id", msg.id);
      return "skipped";
    }

    if (lead.last_wa_sent_at) {
      const lastSent = new Date(lead.last_wa_sent_at).getTime();
      const elapsed = (Date.now() - lastSent) / 1000;
      if (elapsed < MIN_SAME_LEAD_INTERVAL_SEC) {
        const newTime = new Date(lastSent + MIN_SAME_LEAD_INTERVAL_SEC * 1000).toISOString();
        await supabase.from("message_queue").update({ scheduled_for: newTime }).eq("id", msg.id);
        return "skipped";
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const dailyCount = lead.daily_wa_date === today ? lead.daily_wa_count || 0 : 0;
    if (dailyCount >= MAX_DAILY_WA) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 5, 0, 0);
      await supabase.from("message_queue").update({ scheduled_for: tomorrow.toISOString() }).eq("id", msg.id);
      return "skipped";
    }
  }

  // Substitute variables
  let body = substituteVariables(msg.body, lead);
  const subject = msg.subject ? substituteVariables(msg.subject, lead) : null;

  let result: { success: boolean; error?: string };

  if (msg.channel === "whatsapp") {
    result = await sendWhatsAppHumanized(lead.phone, body, settings);
  } else {
    result = await sendEmail(lead.email, subject || "Método Mont'Alverne", body, supabaseUrl, serviceKey);
  }

  if (result.success) {
    await supabase.from("message_queue").update({
      status: "sent",
      sent_at: new Date().toISOString(),
      attempts: msg.attempts + 1,
    }).eq("id", msg.id);

    await supabase.from("message_history").insert({
      lead_id: lead.id,
      funnel: msg.funnel,
      step_key: msg.step_key,
      channel: msg.channel,
      subject,
      body_preview: body.substring(0, 150),
      status: "sent",
    });

    if (msg.channel === "whatsapp") {
      sentToLeadInBatch.add(lead.id);
      const today = new Date().toISOString().split("T")[0];
      const newDailyCount = lead.daily_wa_date === today ? (lead.daily_wa_count || 0) + 1 : 1;
      await supabase.from("leads").update({
        last_wa_sent_at: new Date().toISOString(),
        wa_sem_resposta_count: (lead.wa_sem_resposta_count || 0) + 1,
        daily_wa_count: newDailyCount,
        daily_wa_date: today,
      }).eq("id", lead.id);
    }

    return "processed";
  } else {
    const newAttempts = msg.attempts + 1;
    await supabase.from("message_queue").update({
      status: newAttempts >= 3 ? "failed" : "pending",
      last_error: result.error,
      attempts: newAttempts,
      ...(newAttempts < 3 ? { scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString() } : {}),
    }).eq("id", msg.id);
    return "error";
  }
}

// ══════════════════════════════════════════════════════════
// MAIN HANDLER
// ══════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Parse trigger mode
    let triggerMode = "scheduled";
    try {
      const body = await req.json();
      if (body?.trigger === "immediate") triggerMode = "immediate";
    } catch { /* no body = scheduled cron */ }

    const now = new Date().toISOString();

    // ── Fetch Z-API settings ─────────────────────────────
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
    let skipped = 0;
    const sentToLeadInBatch = new Set<string>();

    // ── STEP 1: IMMEDIATE messages (delay_minutes=0) — priority, no hourly limit ──
    const { data: allPending } = await supabase
      .from("message_queue")
      .select("*, automation_sequences!message_queue_sequence_id_fkey(delay_minutes)")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("scheduled_for")
      .limit(30);

    const immediateMsgs: any[] = [];
    const scheduledMsgs: any[] = [];

    for (const msg of (allPending || [])) {
      const seqDelay = (msg as any).automation_sequences?.delay_minutes;
      // Immediate = delay_minutes is 0 or sequence not found (direct notification)
      if (seqDelay === 0 || seqDelay === undefined || seqDelay === null) {
        immediateMsgs.push(msg);
      } else {
        scheduledMsgs.push(msg);
      }
    }

    // Process all immediate messages first
    for (const msg of immediateMsgs) {
      const r = await processOneMessage(msg, supabase, settings, sentToLeadInBatch, supabaseUrl, serviceKey);
      if (r === "processed") processed++;
      else if (r === "error") errors++;
      else skipped++;

      if (immediateMsgs.indexOf(msg) < immediateMsgs.length - 1) {
        await sleep(1000 + Math.random() * 2000);
      }
    }

    // If immediate-only trigger, return early
    if (triggerMode === "immediate") {
      return new Response(
        JSON.stringify({ processed, errors, skipped, mode: "immediate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── STEP 2: SCHEDULED messages — respect hourly limit ──
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    const { count: waLastHour } = await supabase
      .from("message_history")
      .select("*", { count: "exact", head: true })
      .eq("channel", "whatsapp")
      .eq("status", "sent")
      .gte("created_at", oneHourAgo);

    const waRemaining = HOURLY_WA_LIMIT - (waLastHour || 0);
    if (waRemaining <= 0 && scheduledMsgs.length > 0) {
      console.log("Hourly WA limit reached. Skipping scheduled messages.");
      return new Response(
        JSON.stringify({ processed, errors, skipped, reason: "hourly_limit_scheduled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toProcess = scheduledMsgs.slice(0, Math.min(waRemaining, 10));
    for (const msg of toProcess) {
      const r = await processOneMessage(msg, supabase, settings, sentToLeadInBatch, supabaseUrl, serviceKey);
      if (r === "processed") processed++;
      else if (r === "error") errors++;
      else skipped++;

      if (toProcess.indexOf(msg) < toProcess.length - 1) {
        await sleep(1000 + Math.random() * 2000);
      }
    }

    return new Response(
      JSON.stringify({ processed, errors, skipped, total: immediateMsgs.length + toProcess.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("process-message-queue error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
