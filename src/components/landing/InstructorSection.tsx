import { motion } from "framer-motion";
import MountainDivider from "./MountainDivider";

const stats = [
  { value: "20+", label: "anos de escalada clínica", icon: "⛰️" },
  { value: "2.000+", label: "dentistas guiados ao cume", icon: "🧗" },
  { value: "FOB-USP", label: "Doutor e Mestre", icon: "🎓" },
  { value: "UFMA", label: "Professor universitário", icon: "📚" },
];

const InstructorSection = () => {
  return (
    <section id="professor" className="relative overflow-hidden">
      {/* Summit background */}
      <div className="absolute inset-0">
        <img src="/images/summit-glow.jpg" alt="" className="w-full h-full object-cover opacity-15" loading="lazy" width={1200} height={800} />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="text-background relative z-10">
        <MountainDivider flip />
      </div>

      <div className="section-container relative z-10 py-24 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            <div className="relative">
              <div className="absolute -inset-10 bg-primary/5 rounded-[3rem] blur-[80px]" />
              <img
                src="/images/breno.png"
                alt="Prof. Breno Montalverne"
                className="relative rounded-3xl w-full max-w-sm"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-primary mb-4">O guia da expedição</p>
            <div className="trail-divider mb-6 mx-0" style={{ marginLeft: 0 }} />

            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-8 leading-tight">
              Prof. Breno <br />
              <span className="italic summit-text">Mont'Alverne</span>
            </h2>

            <div className="space-y-4 text-muted-foreground text-[15px] leading-relaxed">
              <p>
                Dentista há mais de 20 anos, vivi intensamente a odontologia em todas as suas fases. Cada curso que criei é fruto de milhares de horas no consultório, na pesquisa e na sala de aula.
              </p>
              <p>
                <span className="text-foreground font-medium">Doutor em Ciências Odontológicas</span> pela FOB-USP. <span className="text-foreground font-medium">Mestre em Dentística</span> pela FOB-USP. Professor da UFMA e fundador do Instituto Mont'Alverne.
              </p>
              <p>
                Já guiei mais de 2.000 dentistas nesta escalada. Agora é a sua vez de chegar ao cume.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-10">
              {stats.map((s) => (
                <div key={s.label} className="mountain-card p-5 text-center">
                  <span className="text-lg mb-1 block">{s.icon}</span>
                  <p className="font-serif text-xl font-medium summit-text">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
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
