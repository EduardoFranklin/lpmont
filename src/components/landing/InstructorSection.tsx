import { motion } from "framer-motion";

const stats = [
  { value: "20+", label: "anos de carreira clínica" },
  { value: "2.000+", label: "dentistas formados" },
  { value: "FOB-USP", label: "Doutor e Mestre" },
  { value: "UFMA", label: "Professor universitário" },
];

const InstructorSection = () => {
  return (
    <section id="professor" className="py-24 sm:py-32 overflow-hidden">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-accent/5 blur-2xl" />
              <img
                src="/images/breno.png"
                alt="Prof. Breno Montalverne"
                className="relative rounded-3xl w-full max-w-sm"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-accent mb-4">Seu guia nesta escalada</p>
            <div className="divider-elegant mb-6 mx-0" style={{ marginLeft: 0 }} />

            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-8 leading-tight">
              Prof. Breno <br />
              <span className="italic gold-text">Mont'Alverne</span>
            </h2>

            <div className="space-y-4 text-muted-foreground text-[15px] leading-relaxed">
              <p>
                Dentista há mais de 20 anos, vivi intensamente a odontologia em todas as suas fases — da graduação até a docência e a prática clínica diária.
              </p>
              <p>
                <span className="text-foreground font-medium">Doutor em Ciências Odontológicas</span> (Materiais Dentários) pela FOB-USP.{" "}
                <span className="text-foreground font-medium">Mestre em Dentística</span> pela FOB-USP.
                Professor da UFMA e fundador do Instituto Mont'Alverne.
              </p>
              <p>
                Ao longo da minha trajetória, formei mais de 2.000 alunos e atendi milhares de pacientes. Meu objetivo é compartilhar, de forma prática e direta, o que aprendi em mais de duas décadas — unindo ciência, clínica e ensino.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              {stats.map((s) => (
                <div key={s.label} className="premium-card p-5 text-center">
                  <p className="font-serif text-2xl font-medium gold-text">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
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
