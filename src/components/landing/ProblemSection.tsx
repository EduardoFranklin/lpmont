import { motion } from "framer-motion";

const painPoints = [
  {
    emoji: "😰",
    title: "Você restaura… e torce para dar certo",
    desc: "A insegurança de não saber se o resultado vai ficar natural faz cada caso virar uma aposta. A confiança clínica desaparece quando não existe método.",
  },
  {
    emoji: "🦷",
    title: "Dentes que parecem artificiais",
    desc: "Sem domínio real de morfologia — largura ótica, terços, transições, textura — seus dentes ficam largos, curtos, opacos. Falta a naturalidade que o paciente percebe.",
  },
  {
    emoji: "🎯",
    title: "Escolher cor ainda é 'tentativa e erro'",
    desc: "Matiz, croma, valor, opacidade, translucidez… sem lógica óptica, cada restauração é um tiro no escuro. O problema não é o material — é a ausência de um raciocínio treinado.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 sm:py-32">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-accent mb-4">O verdadeiro desafio</p>
          <div className="divider-elegant mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight text-balance mb-6">
            A odontologia mudou. <br />
            <span className="italic text-muted-foreground">Mas o ensino ficou para trás.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A resina composta exige consciência clínica, domínio técnico e visão treinada.
            Mas a maioria dos cursos ensina um passo a passo engessado que não prepara para a realidade do consultório.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {painPoints.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="premium-card p-8 group"
            >
              <span className="text-3xl mb-5 block">{p.emoji}</span>
              <h3 className="font-serif text-xl font-medium text-foreground mb-3 leading-snug">{p.title}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-3xl mx-auto text-center"
        >
          <div className="divider-elegant mb-8" />
          <p className="font-serif text-xl sm:text-2xl text-foreground/80 italic leading-relaxed">
            "A maior causa da insegurança não é falta de talento — é a ausência de um{" "}
            <span className="not-italic font-semibold gold-text">método estruturado</span>{" "}
            que organize o conhecimento e traga clareza do começo ao fim."
          </p>
          <p className="mt-6 text-sm text-muted-foreground font-medium">— Prof. Breno Mont'Alverne</p>
          <div className="divider-elegant mt-8" />
        </motion.blockquote>

        <div className="text-center mt-12">
          <a href="#preco" className="btn-cta">
            Quero dominar o método <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

import { ArrowRight } from "lucide-react";
export default ProblemSection;
