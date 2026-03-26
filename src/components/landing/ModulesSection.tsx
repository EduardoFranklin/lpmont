import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, Microscope, Palette, Wrench, Sparkles, Camera, Lightbulb, Star, Layers, Award, Zap, Crown, FlaskConical } from "lucide-react";

const modules = [
  { num: "1", title: "Início da Expedição", icon: Star, desc: "Seja muito bem-vindo(a). É um prazer enorme ter você aqui iniciando essa jornada do chão ao topo da odontologia." },
  { num: "2", title: "Princípios — O que é o Método Mont?", icon: BookOpen, desc: "O Método Mont é um caminho seguro, construído a partir de mais de 20 anos de experiência clínica, pesquisa, ensino e observação real dos erros e acertos que formam um dentista de excelência." },
  { num: "3", title: "Morfologia: Dentes Anteriores", icon: Microscope, desc: "Antes de qualquer restauração anterior se tornar natural, estética e estável, você precisa dominar a lógica anatômica que a natureza criou. Este módulo é a fundação do Método Mont'." },
  { num: "4", title: "Morfologia: Dentes Posteriores", icon: Layers, desc: "Domine a função mastigatória, a oclusão e a construção perfeita dos dentes posteriores com os 5 pilares da morfologia oclusal." },
  { num: "5", title: "Propriedades Ópticas", icon: Palette, desc: "Entenda como funcionam as propriedades ópticas que transformam uma restauração comum em um dente vivo, natural e invisível." },
  { num: "6", title: "Restauração: Classe I e II", icon: Wrench, desc: "O que faz uma restauração posterior durar 5, 10, 20 e até 30 anos. Diagnóstico moderno, matrizes, técnica restauradora e casos clínicos completos." },
  { num: "7", title: "Restauração: Classe III, IV e V", icon: Zap, desc: "As restaurações consideradas 'simples' são justamente as que mais fazem dentistas errarem. Domine cor, opacidade, translucidez e técnica restauradora." },
  { num: "8", title: "Dentes Extensamente Destruídos", icon: FlaskConical, desc: "Transforme procedimentos rotineiros em resultados impecáveis, previsíveis e esteticamente superiores." },
  { num: "9", title: "Adesão e Fotoativação", icon: Lightbulb, desc: "A base da longevidade: substratos, adesivos, condicionamento ácido, fotopolimerizadores e técnica de fotoativação." },
  { num: "10", title: "Facetas: Conóides e Diastemas", icon: Sparkles, desc: "Crie facetas em resina com naturalidade, estabilidade e previsibilidade — do planejamento ao polimento final." },
  { num: "11", title: "Facetas: Restaurações Insatisfatórias", icon: Crown, desc: "O módulo mais clínico, profundo e desafiador. Resolva qualquer caso anterior — simples, médio ou extremamente complexo." },
  { num: "12", title: "Finalização e Polimento", icon: Award, desc: "Acabamento, polimento e longevidade clínica: o segredo para manter suas restaurações no topo da montanha." },
  { num: "13", title: "Reabilitação Oral", icon: Camera, desc: "No módulo final, você chega ao topo: reabilitação oral com resina composta — planejamento, diagnóstico e execução." },
];

const handsOn = [
  "Anatomização de Pino + Provisório Direto em Resina",
  "Restauração Classe IV — Concha Palatina, Estratificação e Polimento",
  "Faceta Clareada — Redução Incisal, Estratificação Completa e Polimento",
  "Morfologia Oclusal — Os 5 Pilares da Anatomia Posterior",
  "Reconstrução Anterior com Guia de Enceramento",
];

const ModulesSection = () => {
  const [openModule, setOpenModule] = useState<string | null>(null);

  return (
    <section id="modulos" className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-4">
            <span className="text-foreground">O QUE VOCÊ VAI </span>
            <span className="gold-text">DOMINAR</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Da base teórica e prática até a execução clínica de alto nível. 13 módulos + 5 Hands-On.
          </p>
        </motion.div>

        {/* Module grid */}
        <div className="space-y-3 mb-16">
          {modules.map((mod, i) => {
            const isOpen = openModule === mod.num;
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setOpenModule(isOpen ? null : mod.num)}
                  className="w-full glass-card p-5 flex items-center gap-4 text-left hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        MÓDULO {mod.num}
                      </span>
                    </div>
                    <h3 className="font-body text-lg font-bold text-foreground mt-1 truncate">
                      {mod.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 ml-16 text-muted-foreground leading-relaxed">
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-10 border-primary/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-2xl sm:text-3xl text-foreground">HANDS-ON</h3>
              <p className="text-sm text-muted-foreground">Casos clínicos reais do Instituto Mont'Alverne</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {handsOn.map((h, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {i + 1}
                </span>
                <p className="text-foreground/80 text-sm font-medium">{h}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModulesSection;
