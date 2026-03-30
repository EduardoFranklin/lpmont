import { motion } from "framer-motion";
import { Check, Shield, ArrowRight, Gift, Users } from "lucide-react";
import { useSection, parseJSON } from "@/hooks/useSiteContent";

const PricingSection = () => {
  const c = useSection("pricing");
  const includes = parseJSON<string[]>(c.includes, []);
  const bonuses = parseJSON<string[]>(c.bonuses, []);

  return (
    <section id="preco" className="py-16 sm:py-36 relative">
      <div className="glow-gold" style={{ width: 800, height: 600, top: "-10%", left: "50%", transform: "translateX(-50%)", opacity: 0.4 }} />
      <div className="section-container relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">{c.caption}</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-[2.1rem] sm:text-4xl lg:text-[3.25rem] font-extrabold sm:font-semibold leading-[1.12] sm:leading-[1.2] text-foreground">{c.title}</h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto mb-14">
          <img src="/images/ambiente-curso.webp" alt="Ambiente do curso — desktop e mobile" className="w-full h-auto rounded-xl" loading="lazy" decoding="async" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto">
          <div className="gradient-card">
            <div className="gradient-card-inner overflow-hidden">
              <div className="px-8 pt-10 pb-8 text-center relative">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/[0.03] to-transparent" />
                <p className="relative text-[11px] tracking-[0.15em] uppercase font-medium text-foreground/30 mb-1">{c.subtitle_label}</p>
                <p className="relative text-foreground/50 text-sm font-medium mb-1">{c.subtitle_desc}</p>
                <p className="relative text-foreground/25 text-sm line-through mb-3">{c.price_original}</p>
                <div className="relative flex items-baseline justify-center gap-1.5">
                  <span className="text-foreground/40 text-lg font-medium">{c.price_prefix}</span>
                  <span className="text-[3.5rem] sm:text-6xl font-extrabold sm:font-medium summit-text">{c.price_value}</span>
                  <span className="text-foreground/40 text-lg font-medium">{c.price_cents}</span>
                </div>
                <p className="relative text-foreground/15 text-sm mt-2">{c.price_note}</p>
              </div>

              <div className="trail-divider mb-0" />

              <div className="px-8 py-8">
                <div className="mb-6">
                  <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground/25 mb-4">Na sua mochila</p>
                  <div className="space-y-3">
                    {includes.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--brand-gold)), hsl(30 80% 45%))" }}>
                          <Check className="w-2.5 h-2.5 text-background" />
                        </div>
                        <span className="text-foreground/50 text-[14px]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8 pt-6 border-t border-foreground/[0.04]">
                  <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-primary/50 flex items-center gap-2 mb-5">
                    <Gift className="w-3.5 h-3.5" /> {c.bonus_label}
                  </p>

                  <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-5 mb-3">
                    <div>
                      <p className="text-[13px] font-medium text-foreground/60 mb-1">{c.bonus_main_title}</p>
                      <p className="text-base font-semibold summit-text flex items-center gap-2">
                        <Users className="w-4 h-4" /> {c.bonus_main_name}
                      </p>
                      <p className="text-foreground/30 text-[12px] mt-2">{c.bonus_main_desc}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {bonuses.map((b) => (
                      <div key={b} className="rounded-xl border border-primary/10 bg-primary/[0.03] px-5 py-4 flex items-center gap-3">
                        <Gift className="w-4 h-4 text-primary/50 flex-shrink-0" />
                        <p className="text-[13px] font-medium text-foreground/55">{b}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <a href="https://pay.hotmart.com/F97566234Y" target="_blank" rel="noopener noreferrer" className="btn-summit w-full justify-center text-base">
                  Comprar Agora <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#falar-equipe" className="btn-gradient w-full mt-3">
                  <div className="btn-gradient-wrapper w-full">
                    <div className="btn-gradient-inner w-full">
                      <div className="btn-gradient-bg" />
                      <span className="btn-gradient-text justify-center w-full">Falar com a Equipe <ArrowRight className="w-4 h-4" /></span>
                    </div>
                  </div>
                </a>

                <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-foreground/25">
                  <Shield className="w-4 h-4 text-primary/40" />
                  {c.guarantee}
                </div>

                <div className="mt-5 flex justify-center">
                  <img src="/images/pagamentos.svg" alt="Formas de pagamento" className="h-7 opacity-50 brightness-150" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
