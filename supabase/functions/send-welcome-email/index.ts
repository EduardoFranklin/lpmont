import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";
import nodemailer from "npm:nodemailer@6.9.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "mktmetodomont@gmail.com";
const CONTATO_EMAIL = "contato@metodomont.com.br";

function createTransporter(smtpPassword: string) {
  return nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "contato@metodomont.com.br",
      pass: smtpPassword,
    },
  });
}

function wrapHtml(html: string): string {
  if (html.startsWith("<!DOCTYPE")) return html;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">
${html}
</body></html>`;
}

// Generate Google Calendar URL
function buildCalendarUrl(
  title: string,
  description: string,
  dateStr: string,
  timeSlot: string,
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
    const payload = await req.json();
    const { recipientEmail, recipientName, treatment, scheduledDay, scheduledDate, scheduledTime, meetLink, subject: rawSubject, html: rawHtml, from_name } = payload;

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "recipientEmail is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    if (!smtpPassword) throw new Error("SMTP_PASSWORD not configured");

    const transporter = createTransporter(smtpPassword);

    // ── Generic email mode: subject + html provided directly ──
    if (rawSubject && rawHtml) {
      const senderName = from_name || "Método Mont'";

      await transporter.sendMail({
        from: `"${senderName}" <contato@metodomont.com.br>`,
        to: recipientEmail,
        subject: rawSubject,
        text: rawHtml.replace(/<[^>]*>/g, ""),
        html: wrapHtml(rawHtml),
      });

      return new Response(JSON.stringify({ success: true }), {
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

      const meetSection = meetLink
        ? `<a href="${meetLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 28px; background: #00897B; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; margin-right: 8px;">
            🎥 Entrar no Google Meet
          </a>`
        : "";

      calendarSection = `
        <div style="margin: 24px 0; padding: 20px; border-radius: 12px; background: #f8f9fa; border: 1px solid #e9ecef; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #495057; font-weight: 600;">📅 Sua reunião</p>
          <p style="margin: 0 0 16px; font-size: 16px; color: #212529; font-weight: 700;">${scheduledDay} · ${scheduledDate} · ${scheduledTime}</p>
          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            ${meetSection}
            <a href="${calUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 28px; background: #4285f4; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
              📅 Adicionar ao Calendar
            </a>
          </div>
        </div>
      `;
    }

    // Build HTML email
    const htmlBody = body.replace(/\n/g, "<br>") + calendarSection;

    await transporter.sendMail({
      from: `"Método Mont'" <contato@metodomont.com.br>`,
      to: recipientEmail,
      subject,
      text: body,
      html: wrapHtml(htmlBody),
    });

    // Also send notification to admin with calendar link
    if (scheduledDay && scheduledDate && scheduledTime) {
      const adminCalUrl = buildCalendarUrl(
        `Reunião - ${trt} ${name}`,
        `Lead: ${trt} ${name}\nEmail: ${recipientEmail}\nTelefone: disponível no dashboard`,
        scheduledDate,
        scheduledTime,
        recipientEmail
      );

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

      for (const adminTo of [ADMIN_EMAIL, CONTATO_EMAIL]) {
        await transporter.sendMail({
          from: `"Método Mont'" <contato@metodomont.com.br>`,
          to: adminTo,
          subject: `Novo agendamento: ${trt} ${name} - ${scheduledDay} ${scheduledDate} ${scheduledTime}`,
          text: `Novo agendamento: ${trt} ${name} - ${scheduledDay} ${scheduledDate} ${scheduledTime}`,
          html: wrapHtml(adminHtml),
        });
      }
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
