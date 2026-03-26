import { motion } from "framer-motion";
import { GraduationCap, Users, Award, Stethoscope } from "lucide-react";

const stats = [
  { icon: GraduationCap, value: "20+", label: "Anos de experiência" },
  { icon: Users, value: "2.000+", label: "Alunos formados" },
  { icon: Award, value: "Doutor", label: "pela FOB-USP" },
  { icon: Stethoscope, value: "Clínico", label: "ativo diariamente" },
];

const InstructorSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-transparent" />
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-primary/5 rounded-3xl blur-2xl" />
            <img
              src="/images/breno.png"
              alt="Prof. Breno Montalverne"
              className="relative rounded-2xl w-full max-w-md mx-auto"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-2">
              Seu guia nesta escalada
            </p>
            <h2 className="font-display text-4xl sm:text-5xl mb-6">
              <span className="text-foreground">PROF. BRENO </span>
              <span className="gold-text">MONT'ALVERNE</span>
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                Sou dentista há mais de 20 anos e, ao longo dessa caminhada, vivi intensamente a odontologia em todas as suas fases — da graduação até a docência e a prática clínica diária.
              </p>
              <p>
                <strong className="text-foreground">Doutor em Ciências Odontológicas</strong> (Materiais Dentários) pela FOB-USP, <strong className="text-foreground">Mestre em Dentística</strong> pela FOB-USP. Professor da UFMA e Coordenador do Instituto Mont'Alverne.
              </p>
              <p>
                Meu objetivo é compartilhar o que aprendi em mais de 20 anos de carreira — unindo ciência, prática clínica e experiência como professor — para que você cresça com segurança e confiança.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;
