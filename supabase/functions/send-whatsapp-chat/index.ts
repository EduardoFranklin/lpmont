import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 11 || digits.length === 10) return `55${digits}`;
  return `55${digits}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getUser(token);
    if (claimsErr || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversationId, phone: directPhone, message, messageType = "text" } = await req.json();

    // Support two modes: conversationId-based (ChatMont) or direct phone (Kanban notifications)
    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let targetPhone: string;

    if (conversationId) {
      // Mode 1: Get phone from conversation
      const { data: conv, error: convErr } = await supabase
        .from("whatsapp_conversations")
        .select("phone")
        .eq("id", conversationId)
        .single();

      if (convErr || !conv) {
        return new Response(JSON.stringify({ error: "Conversation not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      targetPhone = conv.phone;
    } else if (directPhone) {
      // Mode 2: Direct phone number (for Kanban/team/sale notifications)
      targetPhone = directPhone;
    } else {
      return new Response(JSON.stringify({ error: "Missing conversationId or phone" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Z-API settings
    const { data: settingsRows } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["zapi_instance_id", "zapi_token", "zapi_client_token"]);

    const settings: Record<string, string> = {};
    for (const row of settingsRows || []) {
      settings[row.key] = row.value;
    }

    const instanceId = settings.zapi_instance_id;
    const zapiToken = settings.zapi_token;
    const clientToken = settings.zapi_client_token;

    if (!instanceId || !zapiToken) {
      return new Response(JSON.stringify({ error: "Z-API not configured" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formattedPhone = formatPhoneE164(targetPhone);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(clientToken ? { "Client-Token": clientToken } : {}),
    };

    let zapiUrl: string;
    let zapiBody: any;

    if (messageType === "audio") {
      zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${zapiToken}/send-audio`;
      zapiBody = { phone: formattedPhone, audio: message };
    } else {
      zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${zapiToken}/send-text`;
      zapiBody = { phone: formattedPhone, message };
    }

    const res = await fetch(zapiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(zapiBody),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Z-API error:", res.status, body);
      return new Response(JSON.stringify({ error: `Z-API ${res.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const zapiResponse = await res.json();

    // Save message to DB only if conversationId was provided
    if (conversationId) {
      await supabase.from("whatsapp_messages").insert({
        conversation_id: conversationId,
        direction: "outgoing",
        message_type: messageType,
        content: messageType === "audio" ? "" : message,
        media_url: messageType === "audio" ? message : null,
        is_automated: false,
        status: "sent",
        external_id: zapiResponse?.messageId || null,
      });

      await supabase.from("whatsapp_conversations").update({
        last_message: messageType === "audio" ? "[Áudio]" : message,
        last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Send error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
