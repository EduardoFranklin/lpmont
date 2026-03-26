import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background mountain image */}
      <div className="absolute inset-0">
        <img src="/images/bg-montanha.jpg" alt="" className="w-full h-full object-cover" />
      </div>
      {/* Dark overlay to keep text readable */}
      <div className="absolute inset-0 bg-background/70" />
      {/* Existing glows on top */}
      <div className="glow-gold" style={{ width: 800, height: 800, top: "-20%", left: "50%", transform: "translateX(-50%)" }} />
      <div className="glow-gold" style={{ width: 500, height: 500, bottom: "0", right: "-10%", opacity: 0.5 }} />

      {/* Circular rotating SVG decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.04] animate-spin-slow pointer-events-none">
        <svg viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="350" cy="350" r="340" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
          <circle cx="350" cy="350" r="280" stroke="currentColor" strokeWidth="0.5" className="text-foreground" strokeDasharray="4 8" />
          <circle cx="350" cy="350" r="220" stroke="currentColor" strokeWidth="0.3" className="text-foreground" strokeDasharray="2 12" />
        </svg>
      </div>

      <div className="section-container relative z-10 pt-32 pb-20 lg:pt-40 lg:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Caption line + tag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mb-10"
          >
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-foreground/40">
              Treinamento em Resina Composta
            </span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-[4.25rem] font-normal leading-[1.15] text-foreground/95 text-balance mb-6"
          >
            Domine cada restauração.{" "}
            <span className="summit-text font-medium">
              Chegue ao topo da odontologia.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg sm:text-xl text-foreground/35 max-w-2xl mx-auto leading-relaxed font-light mb-10"
          >
            O método que leva dentistas da insegurança à excelência clínica.
            13 módulos, 5 Hands-On e o acompanhamento de um dos maiores nomes
            da dentística restauradora do Brasil.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <a href="#preco" className="btn-gradient">
              <div className="btn-gradient-wrapper">
                <div className="btn-gradient-inner">
                  <div className="btn-gradient-bg" />
                  <span className="btn-gradient-text text-base px-2">
                    Começar a escalada <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </a>
            <a href="#modulos" className="btn-secondary">
              Ver a trilha completa
            </a>
          </motion.div>

          {/* VSL Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="gradient-card">
              <div className="gradient-card-inner overflow-hidden">
                <div className="relative aspect-video bg-background">
                  {!playing ? (
                    <button
                      onClick={() => setPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                    >
                      <div className="absolute inset-0">
                        <img
                          src="/images/hero-mountain.jpg"
                          alt=""
                          className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
                      </div>
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-foreground/10 group-hover:border-primary/40 transition-all duration-500 group-hover:scale-110"
                          style={{ background: "linear-gradient(135deg, hsl(var(--brand-gold) / 0.15), hsl(var(--brand-gold) / 0.05))" }}
                        >
                          <Play className="w-8 h-8 text-primary fill-primary ml-1" />
                        </div>
                        <span className="text-[13px] text-foreground/30 font-medium tracking-wide uppercase">
                          Assistir apresentação
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-[11px] font-medium text-foreground/30 bg-foreground/[0.05] border border-foreground/[0.06]">
                        12:34
                      </div>
                    </button>
                  ) : (
                    <iframe
                      src="about:blank"
                      title="VSL - Método Mont'"
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reassurance items */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-foreground/30"
          >
            <div className="flex items-center gap-2">
              <span className="caption-dot-green" />
              <span>+2.000 dentistas formados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="caption-dot-green" />
              <span>Garantia de 15 dias</span>
            </div>
          </motion.div>

          {/* Vertical caption line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center mt-16"
          >
            <div className="caption-line-v h-16"><div className="caption-line-v-inner" /></div>
            <div className="caption-dot" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
