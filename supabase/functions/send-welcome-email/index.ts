import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "mktmetodomont@gmail.com";

// Generate Google Calendar URL
function buildCalendarUrl(
  title: string,
  description: string,
  dateStr: string, // "dd/mm"
  timeSlot: string, // "9h às 9h30"
  guestEmail: string
): string {
  const [dd, mm] = dateStr.split("/").map(Number);
  const year = new Date().getFullYear();
  const timeMatch = timeSlot.match(/^(\d+)h/);
  const startHour = timeMatch ? parseInt(timeMatch[1]) : 9;

  const fmt = (h: number, m: number) =>
    `${year}${String(mm).padStart(2, "0")}${String(dd).padStart(2, "0")}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(startHour, 0)}/${fmt(startHour, 30)}`,
    details: description,
    add: `${guestEmail},${ADMIN_EMAIL}`,
    ctz: "America/Sao_Paulo",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, treatment, scheduledDay, scheduledDate, scheduledTime } = await req.json();

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

    // Build calendar link if schedule info is available
    let calendarSection = "";
    if (scheduledDay && scheduledDate && scheduledTime) {
      const calUrl = buildCalendarUrl(
        `Reunião Método Mont' - ${trt} ${name}`,
        `Reunião online de 30 min com a equipe do Método Mont'.`,
        scheduledDate,
        scheduledTime,
        recipientEmail
      );

      calendarSection = `
        <div style="margin: 24px 0; padding: 20px; border-radius: 12px; background: #f8f9fa; border: 1px solid #e9ecef; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #495057; font-weight: 600;">📅 Sua reunião</p>
          <p style="margin: 0 0 16px; font-size: 16px; color: #212529; font-weight: 700;">${scheduledDay} · ${scheduledDate} · ${scheduledTime}</p>
          <a href="${calUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 28px; background: #4285f4; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Adicionar ao Google Calendar
          </a>
        </div>
      `;
    }

    // Build HTML email
    const htmlBody = body.replace(/\n/g, "<br>") + calendarSection;

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
      html: htmlBody,
    });

    await client.close();

    // Also send notification to admin with calendar link
    if (scheduledDay && scheduledDate && scheduledTime) {
      const adminCalUrl = buildCalendarUrl(
        `Reunião - ${trt} ${name}`,
        `Lead: ${trt} ${name}\nEmail: ${recipientEmail}\nTelefone: disponível no dashboard`,
        scheduledDate,
        scheduledTime,
        recipientEmail
      );

      const adminClient = new SMTPClient({
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

      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px;">
          <h2 style="color: #212529;">Novo Agendamento 🎯</h2>
          <p><strong>${trt} ${name}</strong> agendou uma reunião.</p>
          <p>📧 ${recipientEmail}</p>
          <p>📅 ${scheduledDay} · ${scheduledDate} · ${scheduledTime}</p>
          <br>
          <a href="${adminCalUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 28px; background: #4285f4; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Adicionar ao meu Calendar
          </a>
        </div>
      `;

      await adminClient.send({
        from: "Método Mont' <contato@metodomont.com.br>",
        to: ADMIN_EMAIL,
        subject: `Novo agendamento: ${trt} ${name} - ${scheduledDay} ${scheduledDate} ${scheduledTime}`,
        content: `Novo agendamento: ${trt} ${name} - ${scheduledDay} ${scheduledDate} ${scheduledTime}`,
        html: adminHtml,
      });

      await adminClient.close();
    }

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
