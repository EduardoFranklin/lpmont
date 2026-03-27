import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hotmart-hottok",
};

/**
 * Map Hotmart webhook event codes to our internal tag names.
 * Reference: https://developers.hotmart.com/docs/en/v2/webhook/
 */
const EVENT_TAG_MAP: Record<string, string> = {
  // Purchase
  PURCHASE_COMPLETE: "pagou",
  PURCHASE_APPROVED: "pagou",
  PURCHASE_CANCELED: "compra_cancelada",
  PURCHASE_REFUNDED: "reembolso",
  PURCHASE_CHARGEBACK: "chargeback",
  PURCHASE_DELAYED: "pagamento_atrasado",
  PURCHASE_PROTEST: "disputa",
  // Checkout
  PURCHASE_OUT_OF_SHOPPING_CART: "abandonou_checkout",
  // Subscription
  SUBSCRIPTION_CANCELLATION: "assinatura_cancelada",
  // Club / Course access
  CLUB_FIRST_ACCESS: "entrou_no_curso",
  CLUB_MODULE_COMPLETED: "modulo_concluido",
  // Checkout
  PURCHASE_BILLET_PRINTED: "boleto_impresso",
  PURCHASE_EXPIRED: "compra_expirada",
  SWITCH_PLAN: "troca_plano",
  UPDATE_SUBSCRIPTION_CHARGE_DATE: "atualizou_cobranca",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate hottok if configured
    const hottok = Deno.env.get("HOTMART_HOTTOK");
    if (hottok) {
      const receivedToken =
        req.headers.get("x-hotmart-hottok") ?? "";
      if (receivedToken !== hottok) {
        console.error("Invalid hottok received");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    console.log("Hotmart webhook received:", JSON.stringify(body));

    const event: string = body.event ?? body.data?.event ?? "";
    // Hotmart sends email in different paths depending on event type
    const buyerEmail: string =
      body.data?.buyer?.email ??
      body.data?.subscriber?.email ??
      body.data?.subscription?.user?.email ??
      body.data?.user?.email ??
      body.buyer?.email ??
      "";
    const productPrice: number =
      body.data?.purchase?.price?.value ??
      body.data?.purchase?.original_offer_price?.value ??
      body.data?.purchase?.price ??
      0;

    if (!buyerEmail) {
      console.error("No buyer email found in payload");
      return new Response(JSON.stringify({ error: "No buyer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Init Supabase with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find lead by email
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .select("id, revenue, status")
      .eq("email", buyerEmail.toLowerCase().trim())
      .maybeSingle();

    if (leadErr) {
      console.error("Error fetching lead:", leadErr);
      return new Response(JSON.stringify({ error: "DB error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!lead) {
      console.log(`No lead found for email: ${buyerEmail}`);
      return new Response(
        JSON.stringify({ ok: true, message: "No matching lead" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert tag
    const tag = EVENT_TAG_MAP[event] ?? event.toLowerCase();
    await supabase.from("lead_tags").insert({
      lead_id: lead.id,
      tag,
      source: "hotmart",
    });

    // If purchase completed/approved → move to convertido + add revenue
    const isPurchase = ["PURCHASE_COMPLETE", "PURCHASE_APPROVED"].includes(
      event
    );
    if (isPurchase) {
      const newRevenue = (lead.revenue ?? 0) + productPrice;
      await supabase
        .from("leads")
        .update({
          status: "convertido",
          revenue: newRevenue,
        })
        .eq("id", lead.id);
      console.log(
        `Lead ${lead.id} converted. Revenue: ${newRevenue}`
      );
    }

    return new Response(JSON.stringify({ ok: true, tag, leadId: lead.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
