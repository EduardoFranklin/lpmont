import { motion } from "framer-motion";

const gear = [
  { title: "Consciência Clínica", desc: "O raciocínio que transforma decisões inseguras em condutas precisas.", num: "01" },
  { title: "Técnica Refinada", desc: "Técnicas modernas que fazem a diferença entre uma restauração mediana e uma obra de naturalidade.", num: "02" },
  { title: "Diferencial Competitivo", desc: "Quando você domina o método, os pacientes percebem. A qualidade se transforma em retorno financeiro.", num: "03" },
  { title: "Imersões Online", desc: "O conteúdo dos cobiçados cursos presenciais do Instituto, acessível de qualquer lugar.", num: "04" },
  { title: "Comunidade de Expedição", desc: "Um grupo exclusivo de dentistas na mesma trilha — troca de experiências e evolução conjunta.", num: "05" },
  { title: "Atualizações Contínuas", desc: "O método evolui com a odontologia. Novos conteúdos são adicionados sem custo extra.", num: "06" },
];

const BenefitsSection = () => {
  return (
    <section className="py-28 sm:py-36 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">O que você leva</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-semibold leading-[1.2] text-foreground">
            Tudo na sua mochila
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gear.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="gradient-card group"
            >
              <div className="gradient-card-inner p-7 h-full">
                <span className="text-[11px] tracking-[0.15em] uppercase font-bold text-primary/30 block mb-4">{g.num}</span>
                <h3 className="text-base font-medium text-foreground/90 mb-2">{g.title}</h3>
                <p className="text-foreground/30 text-[14px] leading-relaxed">{g.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
