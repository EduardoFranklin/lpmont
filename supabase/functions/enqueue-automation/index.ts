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

    const now = new Date();
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
      });
    }

    if (toEnqueue.length > 0) {
      const { error: insertError } = await supabase
        .from("message_queue")
        .insert(toEnqueue);

      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({ enqueued: toEnqueue.length, funnel }), {
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
