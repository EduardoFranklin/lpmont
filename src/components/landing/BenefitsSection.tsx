import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, BookOpen, Users, Video } from "lucide-react";

const benefits = [
  { icon: Brain, title: "Consciência Clínica", desc: "Desenvolva o raciocínio clínico necessário para tomar decisões seguras em cada caso." },
  { icon: Target, title: "Técnica Refinada", desc: "Aprenda técnicas modernas que fazem a diferença na estética e durabilidade." },
  { icon: TrendingUp, title: "Diferencial Competitivo", desc: "Transforme segurança e qualidade em reconhecimento profissional e financeiro." },
  { icon: BookOpen, title: "Aulas Objetivas", desc: "Conteúdo das cobiçadas imersões presenciais em formato online inédito." },
  { icon: Users, title: "Comunidade Exclusiva", desc: "Suporte próximo da equipe e acesso a uma comunidade de dentistas dedicados." },
  { icon: Video, title: "Casos Clínicos Reais", desc: "Treine com os mesmos modelos e casos do Instituto Mont'Alverne." },
];

const BenefitsSection = () => {
  return (
    <section className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-4">
            <span className="text-foreground">POR QUE </span>
            <span className="gold-text">MÉTODO MONT'?</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 hover:border-primary/30 transition-all duration-500 group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <b.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-body text-xl font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
