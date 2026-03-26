import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Users, BookOpen, Radio } from "lucide-react";

const HeroSection = () => {
  const [playing, setPlaying] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeToggle, setActiveToggle] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  const toggles = [
    { id: 0, label: "Comunidade", icon: Users },
    { id: 1, label: "Cursos", icon: BookOpen },
    { id: 2, label: "Mentoria ao Vivo", icon: Radio },
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background mountain image with parallax */}
      <div className="absolute inset-0">
        <img
          src="/images/thumbs/bg-montanha-thumb.webp"
          alt=""
          className="w-full h-full object-cover will-change-transform"
          decoding="async"
          fetchPriority="high"
          style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.1)` }}
        />
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
              Treinamento Mont'Alverne
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
            Dentista, construa a reputação que{" "}
            <span className="summit-text font-medium">
              lota sua agenda e faz sua clínica crescer.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg sm:text-xl text-foreground/35 max-w-2xl mx-auto leading-relaxed font-light mb-10"
          >
            Reputação vira indicação. Indicação vira agenda cheia.
            Agenda cheia vira clínica. Clínica vira instituto.
            Tudo começa com o método.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <a href="https://pay.hotmart.com/F97566234Y?off=68pkkb40&bid=1759193560368" target="_blank" rel="noopener noreferrer" className="btn-gradient">
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
                          src="/images/thumbs/hero-mountain-thumb.webp"
                          alt=""
                          className="w-full h-full object-cover opacity-40"
                          loading="lazy"
                          decoding="async"
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
