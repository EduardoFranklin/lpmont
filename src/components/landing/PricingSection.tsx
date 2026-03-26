import { motion } from "framer-motion";
import { Check, Shield, ArrowRight, Gift } from "lucide-react";
import MountainDivider from "./MountainDivider";

const includes = [
  "13 módulos — do vale ao cume",
  "5 Hands-On com casos reais do Instituto",
  "Aulas objetivas e materiais exclusivos",
  "Suporte próximo da equipe",
  "Atualizações contínuas incluídas",
];

const bonuses = [
  "Curso completo de Clareamento Dental",
  "Fotografia Odontológica com Prof. Caio Calisto",
  "Comunidade Exclusiva de expedicionários",
];

const PricingSection = () => {
  return (
    <section id="preco" className="relative">
      {/* Summit background */}
      <div className="absolute inset-0">
        <img src="/images/summit-glow.jpg" alt="" className="w-full h-full object-cover opacity-10" loading="lazy" width={1200} height={800} />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="text-background relative z-10">
        <MountainDivider flip />
      </div>

      <div className="section-container relative z-10 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-primary mb-4">Base Camp — Investimento</p>
          <div className="trail-divider mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight">
            Sua expedição começa aqui
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="mountain-card overflow-hidden border-primary/15 relative">
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

            {/* Header */}
            <div className="px-8 pt-10 pb-8 text-center relative">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/[0.04] to-transparent" />
              <p className="relative text-foreground/40 text-sm mb-1">O Método Mont' — Treinamento Completo</p>
              <p className="relative text-foreground/25 text-sm line-through mb-4">De R$ 1.790,00</p>
              <div className="relative flex items-baseline justify-center gap-1.5">
                <span className="text-foreground/50 text-lg font-medium">12x de</span>
                <span className="font-serif text-5xl sm:text-6xl font-medium summit-text">R$ 79</span>
                <span className="text-foreground/50 text-lg font-medium">,90</span>
              </div>
              <p className="relative text-foreground/20 text-sm mt-2">sem juros · ou R$ 958,80 à vista</p>
            </div>

            <div className="trail-divider mb-0" />

            {/* Body */}
            <div className="px-8 py-8">
              <div className="mb-6">
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground/30 mb-4">Na sua mochila</p>
                <div className="space-y-3">
                  {includes.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/60 text-[14px]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8 pt-6 border-t border-foreground/5">
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-primary/60 flex items-center gap-2 mb-4">
                  <Gift className="w-3.5 h-3.5" /> Bônus da expedição
                </p>
                <div className="space-y-3">
                  {bonuses.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/60 text-[14px]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="https://metodomont.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-summit w-full justify-center text-base"
              >
                Iniciar minha expedição <ArrowRight className="w-4 h-4" />
              </a>

              <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
                <Shield className="w-4 h-4 text-primary/50" />
                Compra segura · Garantia de 15 dias
              </div>

              <div className="mt-5 flex justify-center">
                <img src="/images/pagamentos.svg" alt="Formas de pagamento" className="h-7 opacity-30" loading="lazy" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
