import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, BookOpen, Radio } from "lucide-react";
import { useSection, parseJSON } from "@/hooks/useSiteContent";
import VideoEmbed from "@/components/video/VideoEmbed";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Users, BookOpen, Radio };


const HeroSection = () => {
  const c = useSection("hero");
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const toggles = parseJSON<{ label: string; icon: string }[]>(c.toggles, []);
  const reassurance = parseJSON<string[]>(c.reassurance, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/thumbs/bg-montanha-thumb.webp" alt="" className="w-full h-full object-cover object-[center_30%] will-change-transform" decoding="async" fetchPriority="high" style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.1)` }} />
      </div>
      <div className="absolute inset-0 bg-background/50 sm:bg-background/70" />
      <div className="absolute top-0 left-0 right-0 h-32 sm:h-24 z-[1] bg-gradient-to-b from-background via-background/80 to-transparent" />
      <div className="glow-gold" style={{ width: 800, height: 800, top: "-20%", left: "50%", transform: "translateX(-50%)" }} />
      <div className="glow-gold" style={{ width: 500, height: 500, bottom: "0", right: "-10%", opacity: 0.5 }} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.04] animate-spin-slow pointer-events-none">
        <svg viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="350" cy="350" r="340" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
          <circle cx="350" cy="350" r="280" stroke="currentColor" strokeWidth="0.5" className="text-foreground" strokeDasharray="4 8" />
          <circle cx="350" cy="350" r="220" stroke="currentColor" strokeWidth="0.3" className="text-foreground" strokeDasharray="2 12" />
        </svg>
      </div>

      <div className="section-container relative z-10 pt-24 pb-20 lg:pt-40 lg:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            {toggles.map((t, i) => {
              const Icon = iconMap[t.icon] || BookOpen;
              return (
                <div key={i} className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-4 sm:px-4 py-2.5 sm:py-2 rounded-xl sm:rounded-full text-[10px] sm:text-[12px] tracking-wide uppercase font-medium text-foreground/45 bg-foreground/[0.06] border border-foreground/[0.10] min-h-[48px] sm:min-h-0 justify-center">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-center leading-tight whitespace-nowrap">{t.label}</span>
                </div>
              );
            })}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-3 mb-5 sm:mb-10">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-foreground/40">{c.caption}</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-[2.1rem] sm:text-5xl lg:text-[4.25rem] font-extrabold sm:font-semibold leading-[1.12] text-foreground/95 text-balance mb-4 sm:mb-6">
            {c.headline}{" "}
            <span className="summit-text font-extrabold sm:font-medium">{c.headline_highlight}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-base sm:text-xl text-foreground/35 max-w-2xl mx-auto leading-relaxed font-light mb-5 sm:mb-10">
            {c.subheadline}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="flex items-center justify-center gap-3 mb-5 sm:mb-10">
            <img src={c.author_avatar || "/images/foto-breno.png"} alt={c.author_name} className="w-14 h-14 sm:w-11 sm:h-11 rounded-full object-cover border border-foreground/[0.08]" decoding="async" />
            <div className="text-left">
              <p className="text-[13px] font-medium text-foreground/60">{c.author_name}</p>
              <p className="text-[11px] text-foreground/25">{c.author_role}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-12">
            <a href="/#preco" className="btn-gradient w-full sm:w-auto active:scale-[0.97] transition-transform">
              <div className="btn-gradient-wrapper w-full sm:w-auto">
                <div className="btn-gradient-inner w-full sm:w-auto">
                  <div className="btn-gradient-bg" />
                  <span className="btn-gradient-text text-base px-2 justify-center w-full sm:w-auto">
                    Quero Acesso Completo <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </a>
            <a href="#modulos" className="btn-secondary hidden sm:inline-flex">{c.cta_secondary}</a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="max-w-3xl mx-auto mb-12">
            <div className="gradient-card">
              <div className="gradient-card-inner overflow-hidden">
                <div className="relative aspect-video bg-background">
                  <VideoEmbed value={c.video_url} title="VSL - Método Mont'" className="w-full h-full" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-foreground/30">
            {reassurance.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="caption-dot-green" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex flex-col items-center mt-16">
            <motion.div
              animate={{ y: [0, 16, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <div className="caption-line-v h-16"><div className="caption-line-v-inner" /></div>
              <div className="caption-dot" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
