import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { lead_id, funnel, event } = await req.json();

    if (!lead_id || !funnel) {
      return new Response(JSON.stringify({ error: "lead_id and funnel required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch lead data
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch lead tags
    const { data: leadTags } = await supabase
      .from("lead_tags")
      .select("tag")
      .eq("lead_id", lead_id);

    const tags = new Set((leadTags || []).map((t: any) => t.tag));

    // If lead purchased, cancel all pending sales messages
    if (event === "purchase_complete" || tags.has("comprador")) {
      await supabase
        .from("message_queue")
        .update({ status: "cancelled" })
        .eq("lead_id", lead_id)
        .eq("status", "pending")
        .neq("funnel", "F4");
    }

    // Fetch sequences for this funnel
    const { data: sequences, error: seqError } = await supabase
      .from("automation_sequences")
      .select("*")
      .eq("funnel", funnel)
      .eq("active", true)
      .order("step_order");

    if (seqError) throw seqError;
    if (!sequences || sequences.length === 0) {
      return new Response(JSON.stringify({ enqueued: 0, reason: "no_active_sequences" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check which steps already have pending/sent messages for this lead+funnel
    const { data: existingQueue } = await supabase
      .from("message_queue")
      .select("step_key, channel, status")
      .eq("lead_id", lead_id)
      .eq("funnel", funnel)
      .in("status", ["pending", "sent"]);

    const existingKeys = new Set(
      (existingQueue || []).map((q: any) => `${q.step_key}:${q.channel}`)
    );

    // Use Brazil/SP timezone for scheduling
    const now = new Date();
    const spNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const tzOffsetMs = now.getTime() - spNow.getTime(); // offset to convert SP local → UTC
    const toEnqueue: any[] = [];

    for (const seq of sequences) {
      // Skip if already enqueued
      if (existingKeys.has(`${seq.step_key}:${seq.channel}`)) continue;

      // Evaluate conditions
      const conditions = seq.conditions || {} as any;

      // Check required_tags (new format — array)
      if (conditions.required_tags?.length) {
        const missing = conditions.required_tags.some((t: string) => !tags.has(t));
        if (missing) continue;
      }
      // Check excluded_tags (new format — array)
      if (conditions.excluded_tags?.length) {
        const blocked = conditions.excluded_tags.some((t: string) => tags.has(t));
        if (blocked) continue;
      }

      // Legacy single-tag conditions (backwards compat)
      if (conditions.tag && !tags.has(conditions.tag)) continue;
      if (conditions.not_tag && tags.has(conditions.not_tag)) continue;
      if (conditions.not_tag2 && tags.has(conditions.not_tag2)) continue;

      // Check quiz_diagnostico condition
      if (conditions.quiz_diagnostico && lead.quiz_diagnostico !== conditions.quiz_diagnostico) continue;

      // Check status requirements
      if (conditions.requires_status && lead.status !== conditions.requires_status) continue;

      // Check hotmart status
      if (conditions.hotmart_status && lead.hotmart_status !== conditions.hotmart_status) continue;

      // Check quiz state
      if (conditions.requires === "quiz_started" && !lead.quiz_started_at) continue;
      if (conditions.not_requires === "quiz_concluido" && lead.quiz_concluido) continue;

      // Calculate scheduled time
      let scheduledFor: Date;
      if (conditions.relative_to === "reuniao_data_hora_iso" && lead.reuniao_data_hora_iso) {
        // Relative to meeting time (negative = before meeting)
        scheduledFor = new Date(new Date(lead.reuniao_data_hora_iso).getTime() + seq.delay_minutes * 60 * 1000);
      } else {
        // Relative to now
        scheduledFor = new Date(now.getTime() + Math.max(0, seq.delay_minutes) * 60 * 1000);
      }

      // Don't schedule in the past
      if (scheduledFor < now) continue;

      toEnqueue.push({
        lead_id,
        sequence_id: seq.id,
        funnel,
        step_key: seq.step_key,
        channel: seq.channel,
        subject: seq.subject,
        body: seq.body,
        scheduled_for: scheduledFor.toISOString(),
        status: "pending",
        skip_sending_window: seq.skip_sending_window || false,
      });
    }

    if (toEnqueue.length > 0) {
      const { error: insertError } = await supabase
        .from("message_queue")
        .insert(toEnqueue);

      if (insertError) throw insertError;

      // Immediately trigger processing for instant messages (delay_minutes = 0)
      const hasImmediate = toEnqueue.some((m: any) => {
        const seq = sequences.find((s: any) => s.step_key === m.step_key && s.channel === m.channel);
        return seq && seq.delay_minutes === 0;
      });

      if (hasImmediate) {
        // Fire-and-forget: invoke process-message-queue immediately
        fetch(`${supabaseUrl}/functions/v1/process-message-queue`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ trigger: "immediate" }),
        }).catch((err) => console.error("Immediate process trigger error:", err));
      }
    }

    // ── TEAM NOTIFICATIONS ──────────────────────────────────
    // Determine the lead status that triggered this automation
    const triggerStatus = lead.status; // current status after the change
    let teamSent = 0;

    const { data: teamSeqs } = await supabase
      .from("team_automation_sequences")
      .select("*")
      .eq("trigger_status", triggerStatus)
      .eq("active", true)
      .order("step_order");

    if (teamSeqs && teamSeqs.length > 0) {
      // Variable substitution for team messages
      const teamVars: Record<string, string> = {
        "{{nome}}": lead.name || "",
        "{{email}}": lead.email || "",
        "{{telefone}}": lead.phone || "",
        "{{tratamento}}": lead.treatment || "Dr.",
        "{{cidade}}": lead.city || "",
        "{{uf}}": lead.uf || "",
        "{{score}}": String(lead.quiz_score ?? ""),
        "{{diagnostico}}": lead.quiz_diagnostico || "",
        "{{data}}": lead.reuniao_data_extenso || lead.scheduled_day || "",
        "{{hora}}": lead.reuniao_hora_extenso || lead.scheduled_time || "",
        "{{reuniao_link_google_meet}}": lead.reuniao_link_google_meet || "",
        "{{reuniao_link_google_calendar}}": lead.reuniao_link_google_calendar || "",
        "{{lead_number}}": String(lead.lead_number ?? ""),
      };

      const substituteTeam = (tpl: string) => {
        let result = tpl;
        for (const [key, value] of Object.entries(teamVars)) {
          result = result.replaceAll(key, value);
        }
        return result;
      };

      // Fetch Z-API settings
      const { data: settingsRows } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["zapi_instance_id", "zapi_token", "zapi_client_token"]);

      const settings: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settings[row.key] = row.value;
      }

      const instanceId = settings.zapi_instance_id;
      const token = settings.zapi_token;
      const clientToken = settings.zapi_client_token;

      if (instanceId && token) {
        for (const seq of teamSeqs) {
          const recipients = (seq.recipient_phones as any[]) || [];
          const messageBody = substituteTeam(seq.body);

          for (const recipient of recipients) {
            const phone = (recipient.phone || "").replace(/\D/g, "");
            const formattedPhone = phone.startsWith("55") ? phone : `55${phone}`;

            try {
              const res = await fetch(
                `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(clientToken ? { "Client-Token": clientToken } : {}),
                  },
                  body: JSON.stringify({ phone: formattedPhone, message: messageBody }),
                }
              );
              if (res.ok) {
                teamSent++;
                console.log(`Team notification sent to ${recipient.name || formattedPhone}`);
              } else {
                const errText = await res.text();
                console.error(`Team notification failed for ${formattedPhone}: ${errText}`);
              }
            } catch (e: any) {
              console.error(`Team notification error: ${e.message}`);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ enqueued: toEnqueue.length, funnel, teamSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("enqueue-automation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
