import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, treatment } = await req.json();

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "recipientEmail is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch template from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: template } = await supabase
      .from("messaging_templates")
      .select("*")
      .eq("channel", "email")
      .eq("trigger", "novo")
      .eq("active", true)
      .single();

    if (!template) {
      return new Response(JSON.stringify({ error: "No active welcome email template found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Replace variables in template
    const name = recipientName || "Lead";
    const trt = treatment || "Dr.";
    let body = template.body
      .replace(/\{\{nome\}\}/g, name)
      .replace(/\{\{email\}\}/g, recipientEmail)
      .replace(/\{\{tratamento\}\}/g, trt);

    let subject = (template.subject || "Bem-vindo(a) ao Método Mont'")
      .replace(/\{\{nome\}\}/g, name)
      .replace(/\{\{tratamento\}\}/g, trt);

    // Send via SMTP (Hostinger)
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    if (!smtpPassword) {
      throw new Error("SMTP_PASSWORD not configured");
    }

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.hostinger.com",
        port: 465,
        tls: true,
        auth: {
          username: "contato@metodomont.com.br",
          password: smtpPassword,
        },
      },
    });

    await client.send({
      from: "Método Mont' <contato@metodomont.com.br>",
      to: recipientEmail,
      subject,
      content: body,
      html: body.replace(/\n/g, "<br>"),
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Email send error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
