import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import MountainDivider from "./MountainDivider";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Mountain background */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-mountain.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
          width={1920}
          height={1080}
        />
        {/* Atmospheric overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
      </div>

      {/* Drifting fog */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] fog-overlay pointer-events-none" />

      <div className="section-container relative z-10 pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Altitude badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-2.5 mb-8"
            >
              {["⛰️ +2.000 dentistas no cume", "🏔️ Doutor pela USP", "🧗 +20 anos de escalada clínica"].map((b) => (
                <span key={b} className="text-[11px] tracking-wider uppercase font-medium px-3 py-1.5 rounded-full border border-foreground/10 text-foreground/40 bg-foreground/[0.03]">
                  {b}
                </span>
              ))}
            </motion.div>

            {/* Headline */}
            <h1 className="text-balance">
              <span className="block font-serif text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem] leading-[1.08] font-medium text-foreground/95 mb-2">
                Cada restauração é
              </span>
              <span className="block font-serif text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem] leading-[1.08] font-medium text-foreground/95 mb-2">
                uma etapa da subida.
              </span>
              <span className="block font-serif italic text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem] leading-[1.08] font-medium summit-text">
                Você já está pronto para o topo?
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-lg sm:text-xl text-foreground/40 max-w-xl leading-relaxed font-light"
            >
              O método que guia dentistas do vale da insegurança até o cume da excelência clínica. Morfologia, cor, restauração — cada módulo é um acampamento rumo ao domínio total da resina composta.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a href="#preco" className="btn-summit text-base">
                Começar a escalada <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#modulos" className="btn-ridge">
                <Play className="w-3.5 h-3.5" /> Ver a trilha completa
              </a>
            </motion.div>

            {/* Micro social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-10 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {["B", "R", "C", "L"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground/50">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-xs text-foreground/30">
                <span className="text-primary font-semibold">4.9 ★</span> · Avaliação dos alunos
              </p>
            </motion.div>
          </motion.div>

          {/* Prof image */}
          <motion.div
            className="lg:col-span-5 relative hidden lg:flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <div className="relative">
              <div className="absolute -inset-8 bg-primary/5 rounded-[3rem] blur-[60px]" />
              <img
                src="/images/breno.png"
                alt="Prof. Breno Montalverne"
                className="relative w-full max-w-[340px] rounded-3xl"
                loading="eager"
              />
              {/* Floating card */}
              <motion.div
                className="absolute -bottom-4 -left-6 mountain-card px-5 py-4"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-1">Seu guia</p>
                <p className="text-sm font-semibold text-foreground/90">Dr. Breno Mont'Alverne</p>
                <p className="text-[11px] text-foreground/35 mt-0.5">Doutor FOB-USP · Prof. UFMA</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mountain silhouette transition */}
      <div className="absolute bottom-0 left-0 right-0 z-20 text-background">
        <MountainDivider />
      </div>
    </section>
  );
};

export default HeroSection;
