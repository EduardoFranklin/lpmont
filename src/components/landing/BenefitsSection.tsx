import { motion } from "framer-motion";

const benefits = [
  { emoji: "🧠", title: "Consciência Clínica", desc: "Desenvolva o raciocínio necessário para tomar decisões seguras — sem depender de protocolos engessados." },
  { emoji: "✨", title: "Técnica Refinada", desc: "Aprenda técnicas modernas que transformam estética e durabilidade em cada restauração." },
  { emoji: "📈", title: "Diferencial Competitivo", desc: "Transforme qualidade clínica em reconhecimento profissional e crescimento financeiro." },
  { emoji: "🎬", title: "Conteúdo das Imersões", desc: "A teoria e prática dos cobiçados cursos presenciais, agora em formato online inédito." },
  { emoji: "👥", title: "Comunidade Exclusiva", desc: "Suporte próximo da equipe e acesso direto a uma rede de dentistas dedicados." },
  { emoji: "🔄", title: "Atualizações Incluídas", desc: "O curso evolui com a odontologia. Conteúdos novos são adicionados continuamente." },
];

const BenefitsSection = () => {
  return (
    <section className="py-24 sm:py-32" style={{ background: "var(--gradient-section)" }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-accent mb-4">Por que escolher</p>
          <div className="divider-elegant mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight">
            O Método Mont'
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="premium-card p-8 group"
            >
              <span className="text-2xl mb-4 block">{b.emoji}</span>
              <h3 className="font-serif text-lg font-medium text-foreground mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-[14px] leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
