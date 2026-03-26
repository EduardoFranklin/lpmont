import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const obstacles = [
  {
    altitude: "Vale",
    icon: "🌫️",
    title: "A névoa da insegurança",
    desc: "Você restaura e torce para dar certo. Sem método, cada caso é uma aposta — e a confiança se perde no meio da névoa.",
  },
  {
    altitude: "Encosta",
    icon: "🪨",
    title: "Tropeçando na morfologia",
    desc: "Sem domínio de largura ótica, terços e texturas, seus dentes ficam artificiais. O paciente percebe. Você sabe que pode mais.",
  },
  {
    altitude: "Abismo",
    icon: "🌑",
    title: "No escuro com a cor",
    desc: "Matiz, croma, valor, opacidade — sem lógica óptica treinada, a escolha da resina vira tentativa e erro. E o erro custa caro.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 sm:py-32 relative">
      {/* Subtle mountain bg */}
      <div className="absolute inset-0 opacity-[0.03]">
        <img src="/images/mountain-layers.jpg" alt="" className="w-full h-full object-cover" loading="lazy" width={1920} height={512} />
      </div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-primary mb-4">O vale da estagnação</p>
          <div className="trail-divider mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight text-balance mb-6">
            Antes de subir, <br />
            <span className="italic text-muted-foreground">reconheça onde você está.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A resina composta exige consciência, método e visão treinada. A maioria dos dentistas está presa
            no vale — usando protocolos engessados que nunca vão levá-los ao topo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {obstacles.map((o, i) => (
            <motion.div
              key={o.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="mountain-card p-8 group relative overflow-hidden"
            >
              {/* Altitude label */}
              <span className="absolute top-4 right-4 text-[10px] tracking-[0.15em] uppercase font-bold text-primary/30">
                {o.altitude}
              </span>
              <span className="text-3xl mb-5 block">{o.icon}</span>
              <h3 className="font-serif text-xl font-medium text-foreground mb-3 leading-snug">{o.title}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed">{o.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-3xl mx-auto text-center"
        >
          <div className="trail-divider mb-8" />
          <p className="font-serif text-xl sm:text-2xl text-foreground/70 italic leading-relaxed">
            "A maior causa da insegurança não é falta de talento — é não ter{" "}
            <span className="not-italic font-semibold summit-text">um guia experiente</span>{" "}
            e uma trilha clara até o topo."
          </p>
          <p className="mt-6 text-sm text-muted-foreground">— Prof. Breno Mont'Alverne</p>
          <div className="trail-divider mt-8" />
        </motion.div>

        <div className="text-center mt-12">
          <a href="#preco" className="btn-summit">
            Começar a subida <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
