import { motion } from "framer-motion";
import { AlertTriangle, Eye, Target } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Insegurança Constante",
    desc: "Resultados irregulares. Um dia fica bom… no outro, completamente diferente. Sem previsibilidade, a confiança desaparece.",
  },
  {
    icon: Eye,
    title: "Morfologia pobre = dentes artificiais",
    desc: "Sem domínio de largura ótica, terços, linhas de transição e textura, o dente fica largo, curto, quadrado, sem profundidade.",
  },
  {
    icon: Target,
    title: "Dependência do 'olhômetro'",
    desc: "Sem lógica óptica, você trabalha no achismo: matiz, croma, valor, opacidade, translucidez… Tudo vira tentativa e erro.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6">
            <span className="text-foreground">O VERDADEIRO </span>
            <span className="gold-text">PROBLEMA...</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            A odontologia mudou. A resina composta exige consciência clínica, domínio técnico e visão treinada.
            Mas o que a maioria dos dentistas aprende é um passo a passo engessado, que não prepara para os desafios reais do consultório.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card p-8 group hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-6 group-hover:bg-destructive/20 transition-colors">
                <p.icon className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-body text-xl font-bold mb-3 text-foreground">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass-card p-8 sm:p-12 border-l-4 border-l-primary text-center"
        >
          <p className="text-xl sm:text-2xl text-foreground/90 italic leading-relaxed font-body">
            "A maior causa da insegurança não é falta de talento… é a ausência de um{" "}
            <span className="gold-text font-bold not-italic">método estruturado</span>,
            que organize o conhecimento e traga clareza do começo ao fim."
          </p>
        </motion.blockquote>

        <div className="text-center mt-10">
          <a href="#preco" className="btn-cta">
            Quero chegar ao topo! <span className="text-2xl">⛰️</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
