import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const camps = [
  { num: "01", altitude: "1.200m", title: "Início da Expedição", desc: "Boas-vindas e mapeamento da jornada. Entenda cada etapa que vai te levar do chão ao cume da odontologia restauradora.", phase: "Base", img: "/images/freepik_1.jpg" },
  { num: "02", altitude: "1.800m", title: "Princípios do Método Mont'", desc: "20+ anos de experiência clínica condensados em um método progressivo e estratégico.", phase: "Base", img: "/images/freepik_2.jpg" },
  { num: "03", altitude: "2.400m", title: "Morfologia — Dentes Anteriores", desc: "A fundação do Método. Textura, sulcos, transições, largura ótica. Aprenda a enxergar como um clínico de excelência.", phase: "Ascensão", img: "/images/freepik_3.jpg" },
  { num: "04", altitude: "3.000m", title: "Morfologia — Dentes Posteriores", desc: "Os 5 pilares da morfologia oclusal: fossas, sulcos, lóbulos, vertentes e arestas.", phase: "Ascensão", img: "/images/freepik_4.jpg" },
  { num: "05", altitude: "3.600m", title: "Propriedades Ópticas", desc: "Matiz, croma, valor, opacidade, translucidez — a lógica óptica que transforma restaurações em dentes vivos.", phase: "Ascensão", img: "/images/freepik_5.jpg" },
  { num: "06", altitude: "4.200m", title: "Restauração Classe I e II", desc: "Diagnóstico, matrizes, técnica restauradora e casos clínicos reais.", phase: "Altitude", img: "/images/freepik_6.jpg" },
  { num: "07", altitude: "4.800m", title: "Restauração Classe III, IV e V", desc: "Domine cor, bisel, estratificação e naturalidade nas restaurações 'simples' que mais derrubam dentistas.", phase: "Altitude", img: "/images/freepik_7.jpg" },
  { num: "08", altitude: "5.400m", title: "Dentes Extensamente Destruídos", desc: "Procedimentos rotineiros transformados em resultados impecáveis e previsíveis.", phase: "Altitude", img: "/images/freepik_8.jpg" },
  { num: "09", altitude: "6.000m", title: "Adesão e Fotoativação", desc: "A base da longevidade. Substratos, adesivos e a ciência real por trás da fotoativação.", phase: "Crista", img: "/images/freepik_9.jpg" },
  { num: "10", altitude: "6.600m", title: "Facetas — Conóides e Diastemas", desc: "Facetas em resina com naturalidade e previsibilidade. Do planejamento ao polimento.", phase: "Crista", img: "/images/freepik_10.jpg" },
  { num: "11", altitude: "7.200m", title: "Facetas — Casos Complexos", desc: "O trecho mais desafiador da escalada. Resolva qualquer caso anterior com segurança total.", phase: "Crista", img: "/images/freepik_11.jpg" },
  { num: "12", altitude: "7.800m", title: "Finalização e Polimento", desc: "Acabamento, texturização e polimento — o que separa clínicos comuns de clínicos de excelência.", phase: "Cume", img: "/images/freepik_11.jpg" },
  { num: "13", altitude: "8.848m", title: "Reabilitação Oral — O CUME", desc: "O topo da montanha. Reabilite sorrisos completos com resina composta.", phase: "Cume", img: "/images/freepik_12.jpg" },
];

const handsOn = [
  "Anatomização de Pino + Provisório Direto",
  "Classe IV — Concha Palatina e Estratificação",
  "Faceta Clareada — Estratificação Completa",
  "Morfologia Oclusal — 5 Pilares",
  "Reconstrução Anterior com Guia de Enceramento",
];

const phaseColors: Record<string, string> = {
  Base: "text-emerald-400/60",
  Ascensão: "text-sky-400/60",
  Altitude: "text-amber-400/60",
  Crista: "text-orange-400/60",
  Cume: "text-primary",
};

const ModulesSection = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="modulos" className="py-28 sm:py-36 relative">
      <div className="glow-gold" style={{ width: 600, height: 400, top: "10%", left: "-15%", opacity: 0.5 }} />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">A trilha completa</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-normal leading-[1.2] text-foreground mb-5">
            13 acampamentos até o cume
          </h2>
          <p className="text-foreground/30 text-lg font-light">
            Cada módulo é uma etapa da escalada. Cada Hands-On, um treino no terreno real.
          </p>
        </motion.div>

        {/* Trail */}
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px hidden sm:block overflow-hidden">
            <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(180deg, transparent, hsl(var(--brand-gold) / 0.2), hsl(var(--brand-gold) / 0.4))" }} />
          </div>

          <div className="space-y-2">
            {camps.map((mod, i) => {
              const isOpen = openIdx === i;
              const isLast = i === camps.length - 1;
              return (
                <motion.div
                  key={mod.num}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className={`w-full rounded-2xl px-5 sm:px-6 py-5 flex items-center gap-4 sm:gap-5 text-left group transition-all duration-300
                      ${isLast ? "gradient-card" : "mountain-card"}
                      ${isOpen ? "border-primary/15" : ""}`}
                  >
                    <div className={`altitude-marker ${isLast ? "!bg-primary/20 !border-primary/40" : ""}`}>
                      <span className="text-[11px]">{mod.num}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] tracking-[0.15em] uppercase font-bold ${phaseColors[mod.phase]}`}>{mod.phase}</span>
                        <span className="text-[10px] text-foreground/15 font-mono">{mod.altitude}</span>
                      </div>
                      <h3 className={`font-medium text-[15px] truncate ${isLast ? "summit-text" : "text-foreground/80"}`}>{mod.title}</h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-foreground/20 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-5 pt-3 ml-0 sm:ml-[68px]">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32 h-32 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-foreground/[0.06]">
                              <img
                                src={mod.img}
                                alt={mod.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-foreground/30 text-[14px] leading-relaxed">
                              {mod.desc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Hands-On */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-14"
        >
          <div className="gradient-card">
            <div className="gradient-card-inner p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="faq-icon">
                  <div className="faq-icon-inner">
                    <span className="text-lg">🧗</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground">Hands-On no Terreno Real</h3>
                  <p className="text-sm text-foreground/30 mt-0.5">Treino prático com casos do Instituto</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {handsOn.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 py-3.5 px-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04]">
                    <span className="altitude-marker w-8 h-8 text-[10px]">{i + 1}</span>
                    <p className="text-foreground/50 text-[14px]">{h}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModulesSection;
