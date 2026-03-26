import { motion } from "framer-motion";

const gear = [
  { icon: "🧠", title: "Consciência Clínica", desc: "O raciocínio que transforma decisões inseguras em condutas precisas — sem depender de protocolos decorados." },
  { icon: "🔬", title: "Técnica Refinada", desc: "Técnicas modernas que fazem a diferença entre uma restauração mediana e uma obra de naturalidade." },
  { icon: "📈", title: "Diferencial Competitivo", desc: "Quando você domina o método, os pacientes percebem. A qualidade se transforma em reconhecimento e retorno financeiro." },
  { icon: "🎬", title: "Imersões em Formato Online", desc: "O conteúdo dos cobiçados cursos presenciais do Instituto, agora acessível de qualquer lugar." },
  { icon: "⛺", title: "Comunidade de Expedição", desc: "Um grupo exclusivo de dentistas na mesma trilha — troca de experiências, suporte e evolução conjunta." },
  { icon: "🔄", title: "Atualizações Contínuas", desc: "O método evolui com a odontologia. Novos conteúdos e módulos são adicionados sem custo extra." },
];

const BenefitsSection = () => {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-primary mb-4">Equipamento de escalada</p>
          <div className="trail-divider mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight">
            Tudo que você leva na mochila
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gear.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="mountain-card p-7 group"
            >
              <span className="text-2xl mb-4 block">{g.icon}</span>
              <h3 className="font-serif text-lg font-medium text-foreground mb-2">{g.title}</h3>
              <p className="text-muted-foreground text-[14px] leading-relaxed">{g.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
