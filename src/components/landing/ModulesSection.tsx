import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const modules = [
  { num: "01", title: "Início da Expedição", desc: "Boas-vindas e visão geral do método. Entenda a jornada que vai do chão ao topo da odontologia restauradora." },
  { num: "02", title: "Princípios do Método Mont'", desc: "O caminho seguro construído em 20+ anos de experiência clínica, pesquisa e ensino. Cada módulo é uma etapa progressiva e estratégica." },
  { num: "03", title: "Morfologia — Dentes Anteriores", desc: "A fundação do Método. Aprenda a enxergar como um clínico de excelência: textura, sulcos, transições, largura ótica e anatomia real." },
  { num: "04", title: "Morfologia — Dentes Posteriores", desc: "Os 5 pilares da morfologia oclusal: fossas, sulcos, lóbulos, vertentes e arestas. Domine a arquitetura funcional completa." },
  { num: "05", title: "Propriedades Ópticas", desc: "Matiz, croma, valor, opacidade, translucidez. Domine a lógica óptica que transforma restaurações comuns em dentes vivos." },
  { num: "06", title: "Restauração Classe I e II", desc: "O que faz uma restauração durar décadas. Diagnóstico moderno, matrizes, técnica restauradora e 10+ casos clínicos." },
  { num: "07", title: "Restauração Classe III, IV e V", desc: "As restaurações 'simples' que mais fazem dentistas errarem. Domine cor, bisel, estratificação e naturalidade." },
  { num: "08", title: "Dentes Extensamente Destruídos", desc: "Transforme procedimentos rotineiros em resultados impecáveis e esteticamente superiores." },
  { num: "09", title: "Adesão e Fotoativação", desc: "A base da longevidade: substratos, adesivos, condicionamento ácido e a ciência real por trás da fotoativação." },
  { num: "10", title: "Facetas — Conóides e Diastemas", desc: "Crie facetas em resina com naturalidade e previsibilidade. Do planejamento ao polimento espelhado." },
  { num: "11", title: "Facetas — Casos Complexos", desc: "O módulo mais desafiador. Resolva qualquer caso anterior com segurança, estratégia e visão de planejamento." },
  { num: "12", title: "Finalização e Polimento", desc: "O segredo da longevidade: acabamento, texturização e polimento que separam clínicos comuns de excelência." },
  { num: "13", title: "Reabilitação Oral", desc: "O topo da montanha. Reabilite sorrisos completos com resina composta — planejamento, diagnóstico e execução." },
];

const handsOn = [
  "Anatomização de Pino + Provisório Direto",
  "Classe IV — Concha Palatina e Estratificação",
  "Faceta Clareada — Estratificação Completa",
  "Morfologia Oclusal — 5 Pilares",
  "Reconstrução Anterior com Guia de Enceramento",
];

const ModulesSection = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="modulos" className="py-24 sm:py-32" style={{ background: "var(--gradient-section)" }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-accent mb-4">Conteúdo completo</p>
          <div className="divider-elegant mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight mb-4">
            13 módulos. 5 Hands-On.
          </h2>
          <p className="text-muted-foreground text-lg">
            Da base teórica até a execução clínica de alto nível.
          </p>
        </motion.div>

        {/* Modules accordion */}
        <div className="max-w-3xl mx-auto space-y-2 mb-16">
          {modules.map((mod, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={mod.num}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className={`w-full premium-card px-6 py-5 flex items-center gap-5 text-left group transition-all duration-300 ${isOpen ? "border-accent/30 shadow-md" : ""}`}
                >
                  <span className="flex-shrink-0 text-[13px] font-semibold tracking-wider text-accent/70 w-8">
                    {mod.num}
                  </span>
                  <span className="flex-1 font-medium text-foreground text-[15px] group-hover:text-foreground/80 transition-colors">
                    {mod.title}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  />
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
                      <div className="px-6 pb-5 pt-1 ml-[52px] text-muted-foreground text-[14px] leading-relaxed">
                        {mod.desc}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Hands-on */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto premium-card p-8 sm:p-10 border-accent/20"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl">🔬</span>
            <div>
              <h3 className="font-serif text-2xl font-medium text-foreground">Hands-On Práticos</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Casos clínicos reais do Instituto Mont'Alverne</p>
            </div>
          </div>
          <div className="space-y-3">
            {handsOn.map((h, i) => (
              <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-xl bg-card/80">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-foreground/80 text-[14px]">{h}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModulesSection;
