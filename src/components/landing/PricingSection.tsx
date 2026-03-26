import { motion } from "framer-motion";
import { Check, Shield, Clock, ArrowRight, Gift } from "lucide-react";

const includes = [
  "13 módulos completos de teoria e prática",
  "5 Hands-On com casos clínicos reais",
  "Técnica moderna e refinada",
  "Aulas objetivas e materiais exclusivos",
  "Suporte próximo da equipe",
  "Atualizações contínuas incluídas",
];

const bonuses = [
  "Bônus 1: Curso de Clareamento Dental",
  "Bônus 2: Curso de Fotografia Odontológica",
  "Super Bônus: Comunidade Exclusiva",
];

const PricingSection = () => {
  return (
    <section id="preco" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-4">
            <span className="text-foreground">GARANTA SUA </span>
            <span className="gold-text">VAGA</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card p-8 sm:p-12 border-primary/30 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground font-medium mb-1">O Método Mont' — Treinamento Completo</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-lg text-muted-foreground line-through">De R$ 1.790</span>
              </div>
              <p className="text-sm text-primary font-semibold mb-2">POR APENAS</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl font-bold text-foreground">12x de</span>
                <span className="font-display text-6xl sm:text-7xl gold-text">R$79</span>
                <span className="text-2xl font-bold text-foreground">,90</span>
              </div>
              <p className="text-muted-foreground mt-2">sem juros — ou à vista por R$ 958,80</p>
            </div>

            <div className="glow-line mb-8" />

            <div className="mb-6">
              <p className="text-sm font-semibold text-foreground mb-4">O que você vai receber:</p>
              <div className="space-y-3">
                {includes.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4" /> Bônus Exclusivos:
              </p>
              <div className="space-y-3">
                {bonuses.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="https://metodomont.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta w-full justify-center text-xl animate-pulse-glow"
            >
              Quero Acesso Imediato <ArrowRight className="w-6 h-6" />
            </a>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Compra 100% segura</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Oferta por tempo limitado</span>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-sm font-semibold text-primary">Garantia de 15 Dias</p>
              <p className="text-xs text-muted-foreground mt-1">Se não ficar satisfeito, devolvemos 100% do seu investimento</p>
            </div>

            <div className="mt-6 flex justify-center">
              <img src="/images/pagamentos.svg" alt="Formas de pagamento" className="h-8 opacity-60" loading="lazy" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
