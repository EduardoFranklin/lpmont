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
    const phoneSuffix = normalizedPhone.slice(-9); // last 9 digits

    // Find matching lead by phone suffix
    const { data: allLeads } = await supabase
      .from("leads")
      .select("id, name, phone, treatment")
      .limit(500);

    const matchedLead = allLeads?.find((l) => {
      const leadDigits = l.phone.replace(/\D/g, "").replace(/^55/, "");
      return leadDigits === normalizedPhone || leadDigits.endsWith(phoneSuffix) || normalizedPhone.endsWith(leadDigits.slice(-9));
    }) || null;

    // Find conversation by phone suffix match (handles 55 prefix inconsistencies)
    const { data: allConvs } = await supabase
      .from("whatsapp_conversations")
      .select("*")
      .limit(500);

    const existingConv = (allConvs || []).find((c: any) => {
      const convDigits = c.phone.replace(/\D/g, "").replace(/^55/, "");
      return convDigits === normalizedPhone || convDigits.endsWith(phoneSuffix) || normalizedPhone.endsWith(convDigits.slice(-9));
    }) || null;

    let conversationId: string;

    if (existingConv) {
      conversationId = existingConv.id;
      const updates: any = {
        last_message: content || `[${messageType}]`,
        last_message_at: new Date().toISOString(),
      };
      // For incoming messages, update contact name if empty
      if (!isFromMe && senderName && !existingConv.contact_name) {
        updates.contact_name = senderName;
      }
      if (matchedLead && !existingConv.lead_id) {
        updates.lead_id = matchedLead.id;
      }
      if (!isFromMe) {
        updates.unread_count = (existingConv.unread_count || 0) + 1;
      }
      await supabase.from("whatsapp_conversations").update(updates).eq("id", conversationId);
    } else {
      // Use lead name for contact, never the business name from isFromMe
      const contactName = matchedLead?.name || (!isFromMe ? senderName : "") || normalizedPhone;
      const { data: newConv, error: convErr } = await supabase
        .from("whatsapp_conversations")
        .insert({
          phone: normalizedPhone,
          contact_name: contactName,
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

    // Skip outgoing messages already saved by ChatMont (avoid duplication)
    if (isFromMe && messageId) {
      const { data: existingMsg } = await supabase
        .from("whatsapp_messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("direction", "outgoing")
        .gte("created_at", new Date(Date.now() - 60000).toISOString()) // last 60s
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingMsg) {
        // Message already saved by send-whatsapp-chat, skip
        console.log("Skipping duplicate outgoing message from ChatMont");
        return new Response(JSON.stringify({ ok: true, skip: "duplicate_outgoing" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Determine if this is an automated message (from message_queue/automation, not ChatMont)
    let isAutomated = false;
    if (isFromMe) {
      // Check if this message matches a recent automation send (message_history)
      const { data: automationMatch } = await supabase
        .from("message_history")
        .select("id")
        .eq("channel", "whatsapp")
        .gte("created_at", new Date(Date.now() - 120000).toISOString()) // last 2min
        .limit(1)
        .maybeSingle();
      
      // If found in automation history, it's automated; otherwise it's manual from phone
      isAutomated = !!automationMatch;
    }

    // Insert message
    const { error: msgErr } = await supabase.from("whatsapp_messages").insert({
      conversation_id: conversationId,
      direction: isFromMe ? "outgoing" : "incoming",
      message_type: messageType,
      content,
      media_url: mediaUrl || null,
      is_automated: isAutomated,
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
