import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const badges = [
  "Mais de 2.000 dentistas formados",
  "Doutor pela USP",
  "+20 anos de clínica",
];

const HeroSection = () => {
  return (
    <section className="hero-dark relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* Warm glow accents */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/3 blur-[100px]" />

      <div className="section-container relative z-10 pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Content — 7 cols */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              {badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase font-medium px-3 py-1.5 rounded-full border border-white/10 text-white/50"
                >
                  {b}
                </span>
              ))}
            </motion.div>

            {/* Headline */}
            <h1 className="text-balance">
              <span className="block font-serif text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.1] font-medium text-white/95 mb-3">
                O sorriso perfeito começa
              </span>
              <span className="block font-serif italic text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.1] font-medium gold-text mb-3">
                nas mãos de quem domina
              </span>
              <span className="block font-serif text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.1] font-medium text-white/95">
                cada detalhe.
              </span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-lg sm:text-xl text-white/50 max-w-xl leading-relaxed font-light"
            >
              Pare de improvisar com resina composta. Domine o método que já transformou mais de 2.000 dentistas em profissionais que entregam resultados <em className="text-white/70 not-italic font-medium">previsíveis, naturais e admirados</em> — caso após caso.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a href="#preco" className="btn-cta text-base">
                Garantir minha vaga <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#modulos" className="inline-flex items-center gap-2.5 px-6 py-4 rounded-full text-sm font-medium text-white/60 hover:text-white/90 border border-white/10 hover:border-white/20 transition-all duration-300">
                <Play className="w-4 h-4" /> Ver conteúdo completo
              </a>
            </motion.div>

            {/* Social proof micro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-10 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-deep-navy bg-accent/20 flex items-center justify-center text-[10px] font-bold text-white/60">
                    {["B", "R", "C", "L"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/40 leading-tight">
                <span className="text-white/60 font-medium">4.9 ★</span> — Avaliação dos alunos no Google
              </p>
            </motion.div>
          </motion.div>

          {/* Image — 5 cols */}
          <motion.div
            className="lg:col-span-5 relative hidden lg:flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative">
              {/* Soft glow behind image */}
              <div className="absolute -inset-8 bg-accent/8 rounded-[3rem] blur-3xl" />
              <img
                src="/images/breno.png"
                alt="Prof. Breno Montalverne — referência em odontologia restauradora"
                className="relative w-full max-w-sm rounded-3xl"
                loading="eager"
              />
              {/* Floating credential card */}
              <motion.div
                className="absolute -bottom-4 -left-8 bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/10"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Professor</p>
                <p className="text-sm font-semibold text-white/90">Dr. Breno Mont'Alverne</p>
                <p className="text-xs text-white/40 mt-0.5">Doutor FOB-USP · UFMA</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
