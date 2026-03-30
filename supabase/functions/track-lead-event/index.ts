import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Tracks lead events from the frontend:
 * - "site_visit"       → adds "visitou_site" tag, sets temperature to morno
 * - "checkout_started" → adds "abandonou_checkout" tag, sets temperature to quente
 *
 * Identifies lead by email (required).
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { email, event, phone } = await req.json();

    if (!email || !event) {
      return new Response(JSON.stringify({ error: "email and event required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find lead by email (or phone fallback)
    let query = supabase.from("leads").select("id, status, temperature").eq("email", normalizedEmail);
    const { data: leads } = await query;

    let lead = leads?.[0];

    // Fallback: try phone
    if (!lead && phone) {
      const cleaned = phone.replace(/\D/g, "");
      const { data: phoneLeads } = await supabase
        .from("leads")
        .select("id, status, temperature")
        .eq("phone", cleaned);
      lead = phoneLeads?.[0];
    }

    if (!lead) {
      return new Response(JSON.stringify({ ok: false, reason: "lead_not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip if already converted or lost
    if (lead.status === "convertido" || lead.status === "perdido") {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event === "site_visit") {
      // Add tag (ignore duplicate)
      await supabase.from("lead_tags").upsert(
        { lead_id: lead.id, tag: "visitou_site", source: "tracking" },
        { onConflict: "lead_id,tag", ignoreDuplicates: true }
      ).select();

      // Only upgrade temp if currently frio
      if (lead.temperature === "frio" || !lead.temperature) {
        await supabase.from("leads").update({ temperature: "morno", updated_at: new Date().toISOString() }).eq("id", lead.id);
      }
    } else if (event === "checkout_started") {
      await supabase.from("lead_tags").upsert(
        { lead_id: lead.id, tag: "abandonou_checkout", source: "tracking" },
        { onConflict: "lead_id,tag", ignoreDuplicates: true }
      ).select();

      // Always set to quente on checkout
      await supabase.from("leads").update({ temperature: "quente", updated_at: new Date().toISOString() }).eq("id", lead.id);
    }

    return new Response(JSON.stringify({ ok: true, lead_id: lead.id, event }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("track-lead-event error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
