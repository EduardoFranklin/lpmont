import { motion } from "framer-motion";
import { Mountain, Users, GraduationCap, BookOpen } from "lucide-react";

const stats = [
  { value: "20+", label: "anos de clínica", icon: Mountain },
  { value: "2.000+", label: "dentistas formados", icon: Users },
  { value: "FOB-USP", label: "Doutor e Mestre", icon: GraduationCap },
  { value: "UFMA", label: "Professor universitário", icon: BookOpen },
];

const InstructorSection = () => {
  return (
    <section id="guia" className="py-28 sm:py-36 relative overflow-hidden">
      <div className="glow-gold" style={{ width: 600, height: 600, top: "20%", right: "-20%", opacity: 0.3 }} />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-primary/5 blur-[80px]" />
              <div className="gradient-card rounded-3xl overflow-hidden">
                <img
                  src="/images/thumbs/breno-thumb.webp"
                  alt="Prof. Breno Montalverne"
                  className="relative w-full max-w-sm"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
              <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">O guia da expedição</span>
            </div>

            <h2 className="text-[2.1rem] sm:text-4xl font-extrabold sm:font-semibold text-foreground mb-8 leading-[1.12] sm:leading-tight">
              Prof. Breno{" "}
              <span className="summit-text font-medium">Mont'Alverne</span>
            </h2>

            <div className="space-y-4 text-foreground/35 text-[15px] leading-relaxed">
              <p>
                Dentista há mais de 20 anos, vivi intensamente a odontologia em todas as suas fases. Cada curso é fruto de milhares de horas no consultório, na pesquisa e na sala de aula.
              </p>
              <p>
                <span className="text-foreground/70 font-medium">Doutor em Ciências Odontológicas</span> pela FOB-USP. <span className="text-foreground/70 font-medium">Mestre em Dentística</span> pela FOB-USP. Professor da UFMA e fundador do Instituto Mont'Alverne.
              </p>
              <p>
                Já guiei mais de 2.000 dentistas nesta escalada. Agora é a sua vez.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-10">
              {stats.map((s) => (
                <div key={s.label} className="gradient-card">
                  <div className="gradient-card-inner p-5 text-center">
                    <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-lg font-medium summit-text">{s.value}</p>
                    <p className="text-[11px] text-foreground/30 mt-1">{s.label}</p>
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
