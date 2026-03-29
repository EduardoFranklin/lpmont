import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LockOpen } from "lucide-react";
import type { QuizPageData } from "@/pages/QuizPage";

interface Props {
  page: QuizPageData;
}

const QuizPageHero = ({ page }: Props) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-[50vh] sm:min-h-[70vh] flex flex-col justify-center overflow-hidden">
      {/* Parallax background */}
      <div className="absolute inset-0">
        <img
          src="/images/thumbs/bg-montanha-thumb.webp"
          alt=""
          className="w-full h-full object-cover will-change-transform"
          decoding="async"
          style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.1)` }}
        />
      </div>
      <div className="absolute inset-0 bg-background/60 sm:bg-background/75" />
      <div className="absolute top-0 left-0 right-0 h-32 z-[1] bg-gradient-to-b from-background via-background/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 z-[1] bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="glow-gold" style={{ width: 600, height: 600, top: "-10%", left: "50%", transform: "translateX(-50%)" }} />

      <div className="relative z-10 max-w-[860px] mx-auto px-5 sm:px-10 pt-10 sm:pt-24 pb-12 sm:pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-['Bebas_Neue',sans-serif] text-[clamp(2.6rem,7vw,5.2rem)] leading-[0.95] tracking-wide mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4 flex-wrap"
        >
          <LockOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary" strokeWidth={1.5} />
          <span>Aula Liberada</span>
        </motion.h1>

        {page.hero_message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 items-stretch mt-7 max-w-[560px]"
          >
            <div className="w-[3px] flex-shrink-0 rounded-sm bg-gradient-to-b from-primary to-primary/20" />
            <div className="flex flex-col gap-4">
              <p className="text-[0.95rem] text-foreground/70 leading-relaxed font-light italic">
                "{page.hero_message}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                  <img
                    src="/images/avatar-breno.webp"
                    alt={page.hero_author_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <strong className="text-[0.82rem] font-semibold text-foreground leading-tight block">
                    {page.hero_author_name}
                  </strong>
                  <span className="text-[0.7rem] text-muted-foreground font-light">
                    {page.hero_author_role}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="caption-line-v h-12"><div className="caption-line-v-inner" /></div>
            <div className="caption-dot" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuizPageHero;
