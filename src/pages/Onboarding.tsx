import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSection, parseJSON } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowUpRight,
  Check,
  Package,
  ExternalLink,
  MessageCircle,
  Users,
  Mail,
  BookOpen,
  Play,
  Calendar,
  Bell,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  description: string;
  announcement_date: string;
  active: boolean;
};

const Onboarding = () => {
  const c = useSection("onboarding");
  const [scrollY, setScrollY] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const mochila = parseJSON<{ text: string; bold: string }[]>(c.mochila_items, []);
  const bonuses = parseJSON<{ name: string; author: string; url: string }[]>(c.bonuses, []);
  const steps = parseJSON<{ title: string; desc: string; pill?: string }[]>(c.hotmart_steps, []);
  const support = parseJSON<{ type: string; label: string; contact: string; url: string }[]>(c.support_links, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase
      .from("onboarding_announcements")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setAnnouncements(data as Announcement[]);
      });
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const day = d.getDate();
    const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return { day, month };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-foreground/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/images/logo-metodo-mont.svg" alt="Método Mont'" className="h-6" />
            <span className="text-[11px] tracking-wide text-foreground/25 italic font-light">onboarding</span>
          </div>
        </div>
      </nav>

      {/* Hero with mountain bg */}
      <section ref={sectionRef} className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/thumbs/bg-montanha-thumb.webp"
            alt=""
            className="w-full h-full object-cover object-[center_30%] will-change-transform"
            decoding="async"
            style={{ transform: `translateY(${scrollY * 0.2}px) scale(1.1)` }}
          />
        </div>
        <div className="absolute inset-0 bg-background/70 sm:bg-background/80" />
        <div className="glow-gold" style={{ width: 600, height: 600, top: "-30%", left: "50%", transform: "translateX(-50%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-3">
            <span className="w-[6px] h-[6px] rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] tracking-[0.1em] uppercase font-medium text-foreground/35">{c.hero_eyebrow || "Bem-vindo à expedição"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-[2.75rem] font-extrabold sm:font-semibold leading-[1.12] text-foreground/95 mb-3"
          >
            {c.hero_title || "Tudo começa"}<br />
            {c.hero_title_line2 || "aqui,"}{" "}
            <span className="summit-text font-extrabold sm:font-medium">{c.hero_highlight || "agora."}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-foreground/35 max-w-lg leading-relaxed font-light"
          >
            {c.hero_description || "Você garantiu acesso completo ao Método Mont. Abaixo estão seus primeiros passos, todos os acessos e o que está na sua mochila."}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Na sua mochila ── */}
        <Section label={c.mochila_label || "Na sua mochila"}>
          <div className="mountain-card p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {mochila.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 py-2.5 ${
                    i < mochila.length - 2 ? "border-b border-foreground/[0.06]" : ""
                  } ${i % 2 === 0 && mochila.length > 1 ? "sm:pr-5 sm:border-r sm:border-foreground/[0.06]" : "sm:pl-5"}`}
                >
                  <span className="w-[5px] h-[5px] rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-[13px] text-foreground/50 leading-relaxed">
                    <strong className="text-foreground/80 font-medium">{item.bold}</strong> {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Seus acessos ── */}
        <Section label={c.access_label || "Seus acessos"}>
          <a
            href={c.main_access_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 bg-foreground text-background rounded-xl p-4 mb-2.5 group hover:opacity-90 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#FF4D00] flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium">{c.main_access_title || "Acessar o Método Mont — Hotmart"}</div>
              <div className="text-[11px] opacity-50">{c.main_access_sub || "13 módulos · 5 Hands-On · materiais · encontros ao vivo"}</div>
            </div>
            <div className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center flex-shrink-0 group-hover:bg-white/25 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <AccessCard
              icon={<MessageCircle className="w-4 h-4 text-white" />}
              iconBg="bg-[#25D366]"
              label={c.wa_group_label || "Grupo no WhatsApp"}
              sub={c.wa_group_sub || "Equipe + alunos · acesso direto"}
              url={c.wa_group_url || "#"}
            />
            <AccessCard
              icon={<Users className="w-4 h-4 text-foreground/50" />}
              iconBg="bg-foreground/[0.06] border border-foreground/[0.08]"
              label={c.experience_label || "Mont'Alverne Experience"}
              sub={c.experience_sub || "Comunidade · membro fundador"}
              url={c.experience_url || "#"}
            />
          </div>
        </Section>

        {/* ── Como acessar na Hotmart ── */}
        <Section label={c.steps_label || "Como acessar na Hotmart"}>
          <div className="mountain-card p-4 sm:p-5">
            <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-foreground/[0.06]">
              <div className="w-7 h-7 rounded-lg bg-[#FF4D00] flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="text-[13px] font-medium text-foreground/80">{c.steps_title || "Acesso em 3 passos"}</div>
                <div className="text-[11px] text-foreground/30">{c.steps_sub || "Você já tem conta — é só entrar"}</div>
              </div>
            </div>
            <div className="space-y-0">
              {steps.map((step, i) => (
                <div key={i} className={`flex gap-3 py-3 ${i < steps.length - 1 ? "border-b border-foreground/[0.06]" : ""}`}>
                  <div className="w-5 h-5 rounded-full bg-foreground/[0.06] border border-foreground/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-medium text-foreground/40">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-foreground/80 mb-0.5">{step.title}</div>
                    <div className="text-[11px] text-foreground/35 leading-relaxed">{step.desc}</div>
                    {step.pill && (
                      <span className="inline-block mt-1.5 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {step.pill}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Bônus ── */}
        <Section label={c.bonus_label || "Bônus da expedição"}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {bonuses.map((bonus, i) => (
              <a
                key={i}
                href={bonus.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mountain-card p-3.5 flex flex-col gap-1 group hover:border-foreground/15 transition-all hover:-translate-y-0.5"
              >
                <span className="text-[10px] font-medium tracking-[0.06em] uppercase text-foreground/25">Bônus</span>
                <span className="text-[13px] font-medium text-foreground/80 leading-tight">{bonus.name}</span>
                <span className="text-[11px] text-foreground/35">{bonus.author}</span>
                <span className="inline-flex items-center gap-1.5 self-start mt-2 text-[10px] font-medium px-2.5 py-1 rounded-full bg-foreground text-background">
                  Na trilha Hotmart <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </a>
            ))}
          </div>
        </Section>

        {/* Tip */}
        {c.tip_text && (
          <div className="border-l-2 border-foreground/40 bg-foreground/[0.04] rounded-r-lg px-4 py-3 text-[12px] text-foreground/40 leading-relaxed">
            <span className="text-foreground/70 font-medium">{c.tip_bold || "Bônus:"}</span>{" "}
            {c.tip_text}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-foreground/[0.06]" />

        {/* ── Quadro de avisos ── */}
        <Section label={c.announcements_label || "Quadro de avisos"}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-foreground/30">{c.announcements_sub || "Próximas aulas ao vivo com Breno Mont'Alverne"}</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1">
              <span className="w-[5px] h-[5px] rounded-full bg-primary animate-pulse" />
              Ao vivo
            </span>
          </div>

          {announcements.length === 0 ? (
            <div className="mountain-card p-6 text-center">
              <div className="w-9 h-9 rounded-lg bg-foreground/[0.06] border border-foreground/[0.08] flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-4 h-4 text-foreground/30" />
              </div>
              <div className="text-[13px] font-medium text-foreground/60 mb-1">{c.no_announcements_title || "Nenhum aviso no momento"}</div>
              <div className="text-[11px] text-foreground/30 leading-relaxed max-w-xs mx-auto">
                {c.no_announcements_desc || "Quando uma aula ao vivo for agendada, a data e o horário aparecerão aqui. O link de acesso será enviado por e-mail."}
              </div>
            </div>
          ) : (
            <div className="mountain-card overflow-hidden">
              <div className="bg-foreground text-background px-4 py-2.5 flex items-center gap-2">
                <Play className="w-3.5 h-3.5 opacity-70" />
                <span className="text-[12px] font-medium">Aulas ao vivo — link enviado por e-mail</span>
              </div>
              {announcements.map((a) => {
                const { day, month } = formatDate(a.announcement_date);
                return (
                  <div key={a.id} className="flex items-start gap-3 px-4 py-3 border-b border-foreground/[0.06] last:border-b-0">
                    <div className="text-center flex-shrink-0 bg-foreground/[0.06] border border-foreground/[0.08] rounded-lg px-2.5 py-1.5 min-w-[42px]">
                      <div className="text-base font-medium text-foreground/70 leading-none">{day}</div>
                      <div className="text-[9px] font-medium text-foreground/30 uppercase tracking-wide mt-0.5">{month}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-foreground/70 mb-0.5">{a.title}</div>
                      <div className="text-[11px] text-foreground/35 leading-relaxed">{a.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Suporte ── */}
        <Section label={c.support_label || "Suporte"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {support.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mountain-card flex items-center gap-3 p-3.5 group hover:border-foreground/15 transition-all hover:-translate-y-0.5"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  s.type === "whatsapp" ? "bg-[#25D366]" : "bg-foreground/[0.06] border border-foreground/[0.08]"
                }`}>
                  {s.type === "whatsapp" ? (
                    <MessageCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Mail className="w-4 h-4 text-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground/70">{s.label}</div>
                  <div className="text-[11px] text-foreground/35">{s.contact}</div>
                </div>
                <div className="w-6 h-6 rounded-md bg-foreground/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-foreground/10 transition-colors">
                  <ArrowUpRight className="w-3 h-3 text-foreground/40" />
                </div>
              </a>
            ))}
          </div>
        </Section>

        {/* ── CTA bar ── */}
        <div className="flex flex-wrap items-center gap-3 pt-2 pb-8">
          <a
            href={c.cta_primary_url || c.main_access_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-foreground text-background rounded-lg px-5 py-3 text-[13px] font-medium hover:opacity-85 hover:-translate-y-0.5 transition-all"
          >
            {c.cta_primary_text || "Começar agora"} <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <a
            href={c.cta_secondary_url || c.wa_group_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-foreground/15 rounded-lg px-5 py-3 text-[13px] font-medium text-foreground/70 hover:border-foreground/30 hover:text-foreground hover:bg-foreground/[0.03] hover:-translate-y-0.5 transition-all"
          >
            {c.cta_secondary_text || "Entrar no grupo"}
          </a>
        </div>
      </div>
    </div>
  );
};

/* ── Helpers ── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-foreground/25 mb-2">{label}</div>
      {children}
    </div>
  );
}

function AccessCard({ icon, iconBg, label, sub, url }: { icon: React.ReactNode; iconBg: string; label: string; sub: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mountain-card flex items-center gap-3 p-3.5 group hover:border-foreground/15 transition-all hover:-translate-y-0.5"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-foreground/70">{label}</div>
        <div className="text-[11px] text-foreground/35">{sub}</div>
      </div>
      <div className="w-6 h-6 rounded-md bg-foreground/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-foreground/10 transition-colors">
        <ArrowUpRight className="w-3 h-3 text-foreground/40" />
      </div>
    </a>
  );
}

export default Onboarding;
