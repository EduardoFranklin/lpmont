import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/cover.jpg"
          alt="Método Mont"
          className="w-full h-full object-cover opacity-20"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/60" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{ left: `${20 + i * 15}%`, top: `${30 + i * 10}%` }}
            animate={{ y: [-20, 20], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="section-container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Curso Online Inédito</span>
            </motion.div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-none mb-6">
              <span className="block text-foreground">EXPEDIÇÃO</span>
              <span className="block text-foreground">ATÉ O</span>
              <span className="block gold-text">TOPO DA</span>
              <span className="block gold-text">ODONTOLOGIA</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mb-4 font-body leading-relaxed">
              A rota segura para dominar morfologia, restauração e resinas compostas com precisão e confiança clínica.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              {["Técnica moderna e refinada", "Resultados previsíveis e naturais", "Diferencial competitivo"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="#preco" className="btn-cta">
                Quero o curso completo <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#modulos" className="btn-outline-gold">
                <Play className="w-4 h-4" /> Aula grátis
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl" />
              <img
                src="/images/breno.png"
                alt="Prof. Breno Montalverne"
                className="relative w-full max-w-md mx-auto rounded-2xl"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 glow-line" />
    </section>
  );
};

export default HeroSection;
