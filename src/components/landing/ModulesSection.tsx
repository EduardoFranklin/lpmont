import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const camps = [
  { num: "01", altitude: "1.200m", title: "Início da Expedição", desc: "Boas-vindas e mapeamento da jornada. Entenda cada etapa que vai te levar do chão ao cume da odontologia restauradora.", phase: "Base" },
  { num: "02", altitude: "1.800m", title: "Princípios do Método Mont'", desc: "20+ anos de experiência clínica condensados em um método progressivo e estratégico. Cada módulo é um acampamento.", phase: "Base" },
  { num: "03", altitude: "2.400m", title: "Morfologia — Dentes Anteriores", desc: "A fundação do Método. Textura, sulcos, transições, largura ótica. Aprenda a enxergar como um clínico de excelência.", phase: "Ascensão" },
  { num: "04", altitude: "3.000m", title: "Morfologia — Dentes Posteriores", desc: "Os 5 pilares da morfologia oclusal: fossas, sulcos, lóbulos, vertentes e arestas. A arquitetura funcional completa.", phase: "Ascensão" },
  { num: "05", altitude: "3.600m", title: "Propriedades Ópticas", desc: "Matiz, croma, valor, opacidade, translucidez — a lógica óptica que transforma restaurações comuns em dentes vivos.", phase: "Ascensão" },
  { num: "06", altitude: "4.200m", title: "Restauração Classe I e II", desc: "O que faz uma restauração durar décadas. Diagnóstico, matrizes, técnica restauradora e casos clínicos reais.", phase: "Altitude" },
  { num: "07", altitude: "4.800m", title: "Restauração Classe III, IV e V", desc: "As restaurações 'simples' que mais derrubam dentistas. Domine cor, bisel, estratificação e naturalidade.", phase: "Altitude" },
  { num: "08", altitude: "5.400m", title: "Dentes Extensamente Destruídos", desc: "Procedimentos rotineiros transformados em resultados impecáveis, previsíveis e esteticamente superiores.", phase: "Altitude" },
  { num: "09", altitude: "6.000m", title: "Adesão e Fotoativação", desc: "A base da longevidade. Substratos, adesivos, condicionamento e a ciência real por trás da fotoativação.", phase: "Crista" },
  { num: "10", altitude: "6.600m", title: "Facetas — Conóides e Diastemas", desc: "Facetas em resina com naturalidade e previsibilidade. Do planejamento ao polimento espelhado.", phase: "Crista" },
  { num: "11", altitude: "7.200m", title: "Facetas — Casos Complexos", desc: "O trecho mais desafiador da escalada. Resolva qualquer caso anterior com segurança total.", phase: "Crista" },
  { num: "12", altitude: "7.800m", title: "Finalização e Polimento", desc: "Acabamento, texturização e polimento — o que separa clínicos comuns de clínicos de excelência.", phase: "Cume" },
  { num: "13", altitude: "8.848m", title: "Reabilitação Oral — O CUME", desc: "O topo da montanha. Reabilite sorrisos completos com resina composta — planejamento, diagnóstico e execução total.", phase: "Cume" },
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
    <section id="modulos" className="py-24 sm:py-32 relative">
      {/* Subtle summit glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.03] blur-[100px] rounded-full" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-primary mb-4">A trilha completa</p>
          <div className="trail-divider mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight mb-4">
            13 acampamentos até o cume
          </h2>
          <p className="text-muted-foreground text-lg">
            Cada módulo é uma etapa da escalada. Cada Hands-On, um treino no terreno real.
          </p>
        </motion.div>

        {/* Trail with vertical line */}
        <div className="max-w-3xl mx-auto relative">
          {/* Trail line */}
          <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/5 via-primary/20 to-primary/40 hidden sm:block" />

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
                  className="relative"
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className={`w-full mountain-card px-5 sm:px-6 py-5 flex items-center gap-4 sm:gap-5 text-left group transition-all duration-300 ${isOpen ? "border-primary/20" : ""} ${isLast ? "border-primary/15 bg-primary/[0.04]" : ""}`}
                  >
                    {/* Altitude marker */}
                    <div className={`altitude-marker flex-shrink-0 ${isLast ? "!bg-primary/20 !border-primary/40" : ""}`}>
                      <span className="text-[11px]">{mod.num}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] tracking-[0.15em] uppercase font-bold ${phaseColors[mod.phase]}`}>
                          {mod.phase}
                        </span>
                        <span className="text-[10px] text-foreground/20 font-mono">{mod.altitude}</span>
                      </div>
                      <h3 className={`font-medium text-[15px] truncate ${isLast ? "summit-text" : "text-foreground/85"}`}>
                        {mod.title}
                      </h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
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
                        <div className="px-5 sm:px-6 pb-5 pt-1 ml-[60px] sm:ml-[68px] text-muted-foreground text-[14px] leading-relaxed">
                          {mod.desc}
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
          className="max-w-3xl mx-auto mt-12 mountain-card p-8 sm:p-10 border-primary/10"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl">🧗</span>
            <div>
              <h3 className="font-serif text-2xl font-medium text-foreground">Hands-On no Terreno Real</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Treino prático com casos do Instituto Mont'Alverne</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {handsOn.map((h, i) => (
              <div key={i} className="flex items-center gap-4 py-3.5 px-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04]">
                <span className="altitude-marker w-8 h-8 text-[10px]">{i + 1}</span>
                <p className="text-foreground/70 text-[14px]">{h}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModulesSection;
