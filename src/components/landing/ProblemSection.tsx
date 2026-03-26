import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const obstacles = [
  {
    num: "01",
    title: "A névoa da insegurança",
    desc: "Você restaura e torce para dar certo. Sem método, cada caso é uma aposta — e a confiança se perde no meio da névoa.",
  },
  {
    num: "02",
    title: "Tropeçando na morfologia",
    desc: "Sem domínio de largura ótica, terços e texturas, seus dentes ficam artificiais. O paciente percebe.",
  },
  {
    num: "03",
    title: "No escuro com a cor",
    desc: "Matiz, croma, valor, opacidade — sem lógica óptica treinada, a escolha da resina vira tentativa e erro.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-28 sm:py-36 relative">
      <div className="section-container relative z-10">
        {/* Section heading with caption lines */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">O vale da estagnação</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-semibold leading-[1.2] text-foreground mb-6">
            Antes de subir,{" "}
            <span className="text-foreground/40">reconheça onde você está</span>
          </h2>
          <p className="text-foreground/30 text-lg leading-relaxed font-light">
            Resina, restauração e gestão exigem consciência, método e visão treinada. A maioria dos dentistas
            está presa no vale — sem o método certo para construir reputação, lotar a agenda e fazer a clínica crescer.
          </p>
        </motion.div>

        {/* Cards with gradient borders */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {obstacles.map((o, i) => (
            <motion.div
              key={o.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="gradient-card"
            >
              <div className="gradient-card-inner p-7 sm:p-8 h-full">
                <span className="text-[11px] tracking-[0.15em] uppercase font-bold text-primary/40 block mb-5">{o.num}</span>
                <h3 className="text-lg font-medium text-foreground/90 mb-3 leading-snug">{o.title}</h3>
                <p className="text-foreground/35 text-[15px] leading-relaxed">{o.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 max-w-3xl mx-auto text-center"
        >
          <div className="trail-divider mb-8" />
          <p className="text-xl sm:text-2xl text-foreground/50 italic leading-relaxed font-light">
            "A maior causa da insegurança não é falta de talento — é não ter{" "}
            <span className="not-italic font-medium summit-text">um guia experiente</span>{" "}
            e uma trilha clara."
          </p>
          <p className="mt-6 text-sm text-foreground/25">— Prof. Breno Mont'Alverne</p>
        </motion.div>

        <div className="text-center mt-14">
          <a href="https://pay.hotmart.com/F97566234Y?off=68pkkb40&bid=1759193560368" target="_blank" rel="noopener noreferrer" className="btn-summit">
            Começar a subida <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
