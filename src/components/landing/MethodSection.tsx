import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Wrench, ChevronLeft, ChevronRight } from "lucide-react";

const handsOnImages = [
  { src: "/images/handson-1.png", caption: "Inserção de resina com espátula" },
  { src: "/images/handson-2.png", caption: "Anatomização do modelo" },
  { src: "/images/handson-3.png", caption: "Escultura e detalhamento" },
  { src: "/images/handson-4.png", caption: "Verificação de contatos proximais" },
  { src: "/images/handson-5.png", caption: "Ajuste fino da restauração" },
  { src: "/images/handson-6.png", caption: "Aplicação do adesivo" },
];

const MethodSection = () => {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % handsOnImages.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + handsOnImages.length) % handsOnImages.length);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [autoPlay, next]);

  return (
    <section className="py-28 sm:py-36 relative overflow-hidden">
      <div className="glow-gold" style={{ width: 600, height: 400, bottom: "0", right: "-10%", opacity: 0.3 }} />

      <div className="section-container relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">Teoria + Prática</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-normal leading-[1.2] text-foreground mb-5">
            Não é só teoria.{" "}
            <span className="summit-text font-medium">É mão na massa.</span>
          </h2>
          <p className="text-foreground/30 text-lg font-light max-w-2xl mx-auto">
            Cada módulo combina embasamento científico com treino prático real.
            Você aprende o porquê e pratica o como — até dominar.
          </p>
        </motion.div>

        {/* Two pillars: Teoria + Prática */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-4 mb-16 max-w-3xl mx-auto"
        >
          {/* Teoria */}
          <div className="gradient-card">
            <div className="gradient-card-inner p-7 flex flex-col items-center text-center h-full">
              <div className="faq-icon mb-5">
                <div className="faq-icon-inner">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground/90 mb-2">Fundamento Teórico</h3>
              <p className="text-foreground/30 text-[14px] leading-relaxed">
                Aulas gravadas com Prof. Breno explicando cada conceito — morfologia, óptica, adesão, estratificação. Ciência aplicada à clínica real.
              </p>
              <div className="mt-auto pt-5 flex flex-wrap items-center justify-center gap-2">
                {["Morfologia", "Óptica", "Adesão", "Estratificação"].map((t) => (
                  <span key={t} className="text-[11px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full border border-foreground/[0.06] text-foreground/25">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Prática */}
          <div className="gradient-card">
            <div className="gradient-card-inner p-7 flex flex-col items-center text-center h-full">
              <div className="faq-icon mb-5">
                <div className="faq-icon-inner">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground/90 mb-2">Hands-On Prático</h3>
              <p className="text-foreground/30 text-[14px] leading-relaxed">
                5 imersões práticas com casos reais do Instituto Mont'Alverne. Você opera, esculpe e restaura como se estivesse na bancada.
              </p>
              <div className="mt-auto pt-5 flex flex-wrap items-center justify-center gap-2">
                {["Classe IV", "Facetas", "Polimento", "Enceramento", "Pinos"].map((t) => (
                  <span key={t} className="text-[11px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full border border-primary/20 text-primary/50">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hands-On Image Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="gradient-card">
            <div className="gradient-card-inner overflow-hidden">
              {/* Slider */}
              <div
                className="relative aspect-video bg-background overflow-hidden cursor-pointer"
                onMouseEnter={() => setAutoPlay(false)}
                onMouseLeave={() => setAutoPlay(true)}
              >
                {handsOnImages.map((img, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === current ? 1 : 0 }}
                  >
                    <img
                      src={img.src}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                    {/* Bottom gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                ))}

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 flex items-end justify-between z-10">
                  <div>
                    <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-primary/60 block mb-1">
                      Hands-On · {String(current + 1).padStart(2, "0")}/{String(handsOnImages.length).padStart(2, "0")}
                    </span>
                    <p className="text-foreground/80 text-sm font-medium">{handsOnImages[current].caption}</p>
                  </div>

                  {/* Nav arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prev}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-foreground/10 text-foreground/40 hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={next}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-foreground/10 text-foreground/40 hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-6 pb-1.5 z-10">
                  {handsOnImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className="flex-1 h-[2px] rounded-full transition-all duration-500"
                      style={{
                        background: i === current
                          ? "linear-gradient(90deg, hsl(38 100% 55%), hsl(30 80% 45%))"
                          : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MethodSection;
