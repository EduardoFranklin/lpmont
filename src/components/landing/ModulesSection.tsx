import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronDown, ChevronLeft, ChevronRight, Printer, BookOpen } from "lucide-react";
import SynopsisModal from "./SynopsisModal";

const clinicalImages = [
  { src: "/images/thumbs/clinicas-1-thumb.webp", caption: "Classe I — Visão oclusal isolada" },
  { src: "/images/thumbs/clinicas-2-thumb.webp", caption: "Classe I e II — Comparativo clínico" },
  { src: "/images/thumbs/clinicas-3-thumb.webp", caption: "Classe II — Identificação de margens" },
  { src: "/images/thumbs/clinicas-4-thumb.webp", caption: "Classe I e II — Diagnóstico de lesões" },
  { src: "/images/thumbs/clinicas-5-thumb.webp", caption: "Reconstrução Coronária — Planejamento" },
  { src: "/images/thumbs/clinicas-6-thumb.webp", caption: "Reconstrução Coronária — Visão aproximada" },
  { src: "/images/thumbs/clinicas-7-thumb.webp", caption: "Reconstrução Coronária — Análise de estrutura" },
  { src: "/images/thumbs/clinicas-8-thumb.webp", caption: "Reconstrução Coronária — Caso clínico complexo" },
];

const camps = [
  { num: "01", altitude: "1.200m", title: "Início da Expedição", desc: "Boas-vindas e mapeamento da jornada. Entenda cada etapa que vai te levar do chão ao cume da odontologia restauradora.", phase: "Base", img: "/images/thumbs/freepik_1-thumb.webp" },
  { num: "02", altitude: "1.800m", title: "Princípios do Método Mont'", desc: "20+ anos de experiência clínica condensados em um método progressivo e estratégico.", phase: "Base", img: "/images/thumbs/freepik_2-thumb.webp" },
  { num: "03", altitude: "2.400m", title: "Morfologia — Dentes Anteriores", desc: "A fundação do Método. Textura, sulcos, transições, largura ótica. Aprenda a enxergar como um clínico de excelência.", phase: "Ascensão", img: "/images/thumbs/freepik_3-thumb.webp" },
  { num: "04", altitude: "3.000m", title: "Morfologia — Dentes Posteriores", desc: "Os 5 pilares da morfologia oclusal: fossas, sulcos, lóbulos, vertentes e arestas.", phase: "Ascensão", img: "/images/thumbs/freepik_4-thumb.webp" },
  { num: "05", altitude: "3.600m", title: "Propriedades Ópticas", desc: "Matiz, croma, valor, opacidade, translucidez — a lógica óptica que transforma restaurações em dentes vivos.", phase: "Ascensão", img: "/images/thumbs/freepik_5-thumb.webp" },
  { num: "06", altitude: "4.200m", title: "Restauração Classe I e II", desc: "Diagnóstico, matrizes, técnica restauradora e casos clínicos reais.", phase: "Altitude", img: "/images/thumbs/freepik_6-thumb.webp" },
  { num: "07", altitude: "4.800m", title: "Restauração Classe III, IV e V", desc: "Domine cor, bisel, estratificação e naturalidade nas restaurações 'simples' que mais derrubam dentistas.", phase: "Altitude", img: "/images/thumbs/freepik_7-thumb.webp" },
  { num: "08", altitude: "5.400m", title: "Dentes Extensamente Destruídos", desc: "Procedimentos rotineiros transformados em resultados impecáveis e previsíveis.", phase: "Altitude", img: "/images/thumbs/freepik_8-thumb.webp" },
  { num: "09", altitude: "6.000m", title: "Adesão e Fotoativação", desc: "A base da longevidade. Substratos, adesivos e a ciência real por trás da fotoativação.", phase: "Crista", img: "/images/thumbs/freepik_9-thumb.webp" },
  { num: "10", altitude: "6.600m", title: "Facetas — Conóides e Diastemas", desc: "Facetas em resina com naturalidade e previsibilidade. Do planejamento ao polimento.", phase: "Crista", img: "/images/thumbs/freepik_10-thumb.webp" },
  { num: "11", altitude: "7.200m", title: "Facetas — Casos Complexos", desc: "O trecho mais desafiador da escalada. Resolva qualquer caso anterior com segurança total.", phase: "Crista", img: "/images/thumbs/freepik_11-thumb.webp" },
  { num: "12", altitude: "7.800m", title: "Finalização e Polimento", desc: "Acabamento, texturização e polimento — o que separa clínicos comuns de clínicos de excelência.", phase: "Cume", img: "/images/thumbs/freepik_11-thumb.webp" },
  { num: "13", altitude: "8.848m", title: "Reabilitação Oral — O CUME", desc: "O topo da montanha. Reabilite sorrisos completos com resina composta.", phase: "Cume", img: "/images/thumbs/freepik_12-thumb.webp" },
];

const handsOn = [
  { num: "H1", title: "Dente Extensamente Destruído Anterior", desc: "Reconstrução coronária com técnica direta — do pino à estratificação final.", img: "/images/handson-cover-1.webp" },
  { num: "H2", title: "Facetas Clareadas", desc: "Estratificação completa de facetas em resina sobre dentes clareados.", img: "/images/handson-cover-2.webp" },
  { num: "H3", title: "Restaurações de Dentes Anteriores", desc: "Técnica restauradora para dentes anteriores com naturalidade e previsibilidade.", img: "/images/handson-cover-3.webp" },
  { num: "H4", title: "Caso Clínico: De Canino a Canino", desc: "Reabilitação anterior completa — planejamento, enceramento e execução.", img: "/images/handson-cover-4.webp" },
  { num: "H5", title: "Clareamento Dental — Curso Extra", desc: "Módulo bônus com Dra. Rayssa Cavaleiro sobre clareamento dental.", img: "/images/handson-cover-5.webp" },
];

const phaseColors: Record<string, string> = {
  Base: "text-emerald-400/60",
  Ascensão: "text-sky-400/60",
  Altitude: "text-amber-400/60",
  Crista: "text-orange-400/60",
  Cume: "text-primary",
};

const coverSlides = [
  "/images/capa1.webp",
  "/images/capa2.webp",
  "/images/capa3.webp",
  "/images/capa4.webp",
  "/images/capa5.webp",
  "/images/capa6.webp",
  "/images/capa7.webp",
  "/images/capa8.webp",
  "/images/capa9.webp",
  "/images/capa10.webp",
  "/images/capa11.webp",
  "/images/capa12.webp",
  "/images/capa13.webp",
];

const CampsCarousel = ({ onCoverClick }: { onCoverClick: (moduleNum: number) => void }) => {
  const doubled = [...coverSlides, ...coverSlides];
  const itemWidth = 200;
  const gapWidth = 16;
  const totalWidth = coverSlides.length * (itemWidth + gapWidth);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-16 overflow-hidden"
    >
      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        
        <motion.div
          className="flex gap-4 w-max cursor-grab active:cursor-grabbing"
          animate={{ x: [0, -totalWidth] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          drag="x"
          dragConstraints={{ left: -totalWidth, right: 0 }}
          dragElastic={0.1}
          style={{ willChange: "transform" }}
        >
          {doubled.map((src, i) => {
            const moduleNum = (i % coverSlides.length) + 1;
            const camp = camps[moduleNum - 1];
            return (
              <div
                key={i}
                className="flex-shrink-0 w-[180px] sm:w-[200px] cursor-pointer group"
                onClick={() => onCoverClick(moduleNum)}
              >
                <div className="rounded-xl overflow-hidden border border-foreground/[0.06] group-hover:border-primary/20 transition-colors duration-300">
                  <img
                    src={src}
                    alt={camp?.title || `Acampamento ${moduleNum}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 text-[11px] sm:text-[12px] text-foreground/40 font-medium text-center leading-tight truncate px-1">
                  {camp?.title}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};


const ModulesSection = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const clinicalTouchStart = useRef(0);
  const [openHandsOn, setOpenHandsOn] = useState<number | null>(0);
  const [synopsisModule, setSynopsisModule] = useState<number | null>(null);
  const handsOnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [clinicalCurrent, setClinicalCurrent] = useState(0);
  const [clinicalAutoPlay, setClinicalAutoPlay] = useState(true);

  const clinicalNext = useCallback(() => {
    setClinicalCurrent((c) => (c + 1) % clinicalImages.length);
  }, []);

  const clinicalPrev = useCallback(() => {
    setClinicalCurrent((c) => (c - 1 + clinicalImages.length) % clinicalImages.length);
  }, []);

  useEffect(() => {
    if (!clinicalAutoPlay) return;
    const id = setInterval(clinicalNext, 3500);
    return () => clearInterval(id);
  }, [clinicalAutoPlay, clinicalNext]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Sequential scroll: only move ±1 at a time so no items get skipped
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    camps.forEach((_, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setOpenIdx((prev) => {
              if (prev === null) return i;
              // Only allow moving to adjacent item
              if (i === prev + 1 || i === prev - 1) return i;
              // If further away, step one closer
              if (i > (prev ?? 0)) return (prev ?? 0) + 1;
              if (i < (prev ?? 0)) return (prev ?? 0) - 1;
              return prev;
            });
          }
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    handsOn.forEach((_, i) => {
      const el = handsOnRefs.current[i];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setOpenHandsOn((prev) => {
              if (prev === null) return i;
              if (i === prev + 1 || i === prev - 1) return i;
              if (i > (prev ?? 0)) return (prev ?? 0) + 1;
              if (i < (prev ?? 0)) return (prev ?? 0) - 1;
              return prev;
            });
          }
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section id="modulos" className="py-28 sm:py-36 relative">
      <div className="glow-gold" style={{ width: 600, height: 400, top: "10%", left: "-15%", opacity: 0.5 }} />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">A trilha completa</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-[2.1rem] sm:text-4xl lg:text-[3.25rem] font-extrabold sm:font-semibold leading-[1.12] sm:leading-[1.2] text-foreground mb-5">
            13 acampamentos até o cume
          </h2>
          <p className="text-foreground/30 text-lg font-light">
            Cada módulo é uma etapa da escalada. Cada Hands-On, um treino no terreno real.
          </p>
        </motion.div>

        {/* Covers Carousel */}
        <CampsCarousel onCoverClick={(num) => setSynopsisModule(num)} />

        {/* Trail */}
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px hidden sm:block overflow-hidden">
            <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(180deg, transparent, hsl(var(--brand-gold) / 0.2), hsl(var(--brand-gold) / 0.4))" }} />
          </div>

          <div className="space-y-2">
            {camps.map((mod, i) => {
              const isOpen = openIdx === i;
              const isLast = i === camps.length - 1;
              return (
                <motion.div
                  key={mod.num}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className={`w-full rounded-2xl px-5 sm:px-6 py-5 flex items-center gap-4 sm:gap-5 text-left group transition-all duration-300
                      ${isLast ? "gradient-card" : "mountain-card"}
                      ${isOpen ? "border-primary/15" : ""}`}
                  >
                    <div className={`altitude-marker ${isLast ? "!bg-primary/20 !border-primary/40" : ""}`}>
                      <span className="text-[11px]">{mod.num}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] tracking-[0.15em] uppercase font-bold ${phaseColors[mod.phase]}`}>{mod.phase}</span>
                        <span className="text-[10px] text-foreground/15 font-mono">{mod.altitude}</span>
                      </div>
                      <h3 className={`font-medium text-[15px] truncate ${isLast ? "summit-text" : "text-foreground/80"}`}>{mod.title}</h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-foreground/20 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-5 pt-3 ml-0 sm:ml-[68px]">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32 h-32 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-foreground/[0.06]">
                              <img
                                src={mod.img}
                                alt={mod.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <p className="text-foreground/30 text-[14px] leading-relaxed">
                              {mod.desc}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSynopsisModule(i + 1); }}
                            className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-primary/70 hover:text-primary transition-colors font-medium"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Sinopse
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Situações Clínicas Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-14"
        >
          <div className="gradient-card">
            <div className="gradient-card-inner overflow-hidden">
              <div
                className="relative aspect-video bg-background overflow-hidden cursor-pointer"
                onMouseEnter={() => setClinicalAutoPlay(false)}
                onMouseLeave={() => setClinicalAutoPlay(true)}
                onTouchStart={(e) => { clinicalTouchStart.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  const diff = clinicalTouchStart.current - e.changedTouches[0].clientX;
                  if (diff > 50) clinicalNext();
                  else if (diff < -50) clinicalPrev();
                }}
              >
                {clinicalImages.map((img, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === clinicalCurrent ? 1 : 0 }}
                  >
                    <img
                      src={img.src}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                ))}

                <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 flex items-end justify-between z-10">
                  <div>
                    <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-primary/60 block mb-1">
                      Situações Clínicas · {String(clinicalCurrent + 1).padStart(2, "0")}/{String(clinicalImages.length).padStart(2, "0")}
                    </span>
                    <p className="text-foreground/80 text-sm font-medium">{clinicalImages[clinicalCurrent].caption}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={clinicalPrev}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-foreground/10 text-foreground/40 hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={clinicalNext}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-foreground/10 text-foreground/40 hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-6 pb-1.5 z-10">
                  {clinicalImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setClinicalCurrent(i)}
                      className="flex-1 h-[2px] rounded-full transition-all duration-500"
                      style={{
                        background: i === clinicalCurrent
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

        {/* Hands-On */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20 mb-10 max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">Hands-On</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold leading-[1.2] text-foreground mb-3">
            Treino prático no terreno real
          </h3>
          <p className="text-foreground/30 text-base font-light">Imersões práticas com casos reais do Instituto Mont'Alverne.</p>
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          <div className="space-y-2">
            {handsOn.map((h, i) => {
              const isOpen = openHandsOn === i;
              const isExtra = i === handsOn.length - 1;
              return (
                <motion.div
                  key={h.num}
                  ref={(el) => { handsOnRefs.current[i] = el; }}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    onClick={() => setOpenHandsOn(isOpen ? null : i)}
                    className={`w-full rounded-2xl px-5 sm:px-6 py-5 flex items-center gap-4 sm:gap-5 text-left group transition-all duration-300
                      ${isExtra ? "gradient-card" : "mountain-card"}
                      ${isOpen ? "border-primary/15" : ""}`}
                  >
                    <div className={`altitude-marker ${isExtra ? "!bg-primary/20 !border-primary/40" : ""}`}>
                      <span className="text-[11px]">{h.num}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-primary/50">
                          {isExtra ? "Bônus" : "Hands-On"}
                        </span>
                      </div>
                      <h3 className={`font-medium text-[15px] truncate ${isExtra ? "summit-text" : "text-foreground/80"}`}>{h.title}</h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-foreground/20 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-5 pt-3 ml-0 sm:ml-[68px]">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32 h-44 sm:h-40 rounded-xl overflow-hidden flex-shrink-0 border border-foreground/[0.06]">
                              <img
                                src={h.img}
                                alt={h.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <p className="text-foreground/30 text-[14px] leading-relaxed">
                              {h.desc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Modelo para Impressão */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-14"
        >
          <div className="gradient-card">
            <div className="gradient-card-inner p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Printer className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-primary/60 block">Incluso no curso</span>
                      <h3 className="text-foreground/90 font-medium text-base">Arquivo para Impressão 3D do Modelo</h3>
                    </div>
                  </div>
                  <p className="text-foreground/30 text-sm leading-relaxed sm:ml-[52px]">
                    Você receberá o arquivo digital para imprimir o mesmo modelo utilizado nas aulas práticas (Hands-On). Treine no seu próprio ritmo, com o mesmo modelo usado pelo Prof. Breno Mont'Alverne.
                  </p>
                </div>
                <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden border border-foreground/[0.06] flex-shrink-0 relative">
                  <div
                    className="flex h-full cursor-grab active:cursor-grabbing touch-pan-x"
                    style={{ transition: "transform 0.4s ease" }}
                    onPointerDown={(e) => {
                      const container = e.currentTarget;
                      const startX = e.clientX;
                      const currentTransform = container.style.transform;
                      const match = currentTransform.match(/translateX\((-?\d+(?:\.\d+)?)%\)/);
                      const startOffset = match ? parseFloat(match[1]) : 0;
                      const totalSlides = 3;
                      container.style.transition = "none";
                      container.setPointerCapture(e.pointerId);

                      const onMove = (ev: PointerEvent) => {
                        const dx = ev.clientX - startX;
                        const pct = (dx / container.parentElement!.clientWidth) * 100;
                        container.style.transform = `translateX(${startOffset + pct}%)`;
                      };

                      const onUp = (ev: PointerEvent) => {
                        container.releasePointerCapture(ev.pointerId);
                        container.removeEventListener("pointermove", onMove);
                        container.removeEventListener("pointerup", onUp);
                        const dx = ev.clientX - startX;
                        const pct = (dx / container.parentElement!.clientWidth) * 100;
                        let newSlide = Math.round(-(startOffset + pct) / 100);
                        newSlide = Math.max(0, Math.min(totalSlides - 1, newSlide));
                        container.style.transition = "transform 0.4s ease";
                        container.style.transform = `translateX(${-newSlide * 100}%)`;
                      };

                      container.addEventListener("pointermove", onMove);
                      container.addEventListener("pointerup", onUp);
                    }}
                  >
                    {["/images/modelo-handson-1.webp", "/images/modelo-handson-2.webp", "/images/modelo-handson-3.webp"].map((src, i) => (
                      <img key={i} src={src} alt={`Modelo Hands-On ${i + 1}`} className="w-full h-full object-cover flex-shrink-0 pointer-events-none" loading="lazy" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <SynopsisModal
        moduleNum={synopsisModule}
        open={synopsisModule !== null}
        onOpenChange={(open) => { if (!open) setSynopsisModule(null); }}
      />
    </section>
  );
};

export default ModulesSection;
