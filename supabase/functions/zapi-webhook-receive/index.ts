import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^55/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const payload = await req.json();
    console.log("Z-API webhook received:", JSON.stringify(payload).substring(0, 500));

    // Z-API sends different event types
    const isMessage = payload.type === "ReceivedCallback" || payload.isStatusReply === false || payload.text || payload.audio || payload.image;
    
    if (!isMessage && !payload.phone) {
      // Status update or other event - just acknowledge
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawPhone = payload.phone || payload.chatId?.replace("@c.us", "") || "";
    const senderName = payload.senderName || payload.chatName || "";
    const messageId = payload.messageId || payload.id?.id || "";
    const isFromMe = payload.fromMe === true;

    if (!rawPhone) {
      return new Response(JSON.stringify({ ok: true, skip: "no phone" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine message type and content
    let messageType = "text";
    let content = payload.text?.message || payload.body || "";
    let mediaUrl = "";

    if (payload.audio) {
      messageType = "audio";
      mediaUrl = payload.audio.audioUrl || payload.audio.url || "";
      content = "";
    } else if (payload.image) {
      messageType = "image";
      mediaUrl = payload.image.imageUrl || payload.image.url || "";
      content = payload.image.caption || "";
    } else if (payload.document) {
      messageType = "document";
      mediaUrl = payload.document.documentUrl || payload.document.url || "";
      content = payload.document.fileName || "";
    } else if (payload.video) {
      messageType = "video";
      mediaUrl = payload.video.videoUrl || payload.video.url || "";
      content = payload.video.caption || "";
    } else if (payload.sticker) {
      messageType = "sticker";
      mediaUrl = payload.sticker.stickerUrl || payload.sticker.url || "";
    }

    const normalizedPhone = normalizePhone(rawPhone);

    // Find or create conversation
    const { data: existingConv } = await supabase
      .from("whatsapp_conversations")
      .select("*")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    let conversationId: string;
    
    // Try to find matching lead
    const { data: matchedLead } = await supabase
      .from("leads")
      .select("id, name")
      .or(`phone.eq.${normalizedPhone},phone.eq.55${normalizedPhone},phone.eq.+55${normalizedPhone}`)
      .limit(1)
      .maybeSingle();

    if (existingConv) {
      conversationId = existingConv.id;
      const updates: any = {
        last_message: content || `[${messageType}]`,
        last_message_at: new Date().toISOString(),
      };
      if (senderName && !existingConv.contact_name) {
        updates.contact_name = senderName;
      }
      if (matchedLead && !existingConv.lead_id) {
        updates.lead_id = matchedLead.id;
      }
      // Increment unread only for incoming messages
      if (!isFromMe) {
        updates.unread_count = (existingConv.unread_count || 0) + 1;
      }
      await supabase.from("whatsapp_conversations").update(updates).eq("id", conversationId);
    } else {
      const { data: newConv, error: convErr } = await supabase
        .from("whatsapp_conversations")
        .insert({
          phone: normalizedPhone,
          contact_name: senderName || matchedLead?.name || normalizedPhone,
          last_message: content || `[${messageType}]`,
          last_message_at: new Date().toISOString(),
          unread_count: isFromMe ? 0 : 1,
          lead_id: matchedLead?.id || null,
        })
        .select("id")
        .single();

      if (convErr) {
        console.error("Error creating conversation:", convErr);
        throw convErr;
      }
      conversationId = newConv.id;
    }

    // Insert message
    const { error: msgErr } = await supabase.from("whatsapp_messages").insert({
      conversation_id: conversationId,
      direction: isFromMe ? "outgoing" : "incoming",
      message_type: messageType,
      content,
      media_url: mediaUrl || null,
      is_automated: isFromMe,
      status: "delivered",
      external_id: messageId || null,
    });

    if (msgErr) {
      console.error("Error inserting message:", msgErr);
      throw msgErr;
    }

    // If incoming WA and lead exists, reset wa_sem_resposta_count
    if (!isFromMe && matchedLead) {
      await supabase
        .from("leads")
        .update({ wa_sem_resposta_count: 0 })
        .eq("id", matchedLead.id);
    }

    return new Response(JSON.stringify({ ok: true, conversationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
