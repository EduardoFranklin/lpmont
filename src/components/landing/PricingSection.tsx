import { motion } from "framer-motion";
import { Check, Shield, ArrowRight, Gift } from "lucide-react";

const includes = [
  "13 módulos completos de teoria e prática clínica",
  "5 Hands-On com casos reais do Instituto",
  "Aulas objetivas e materiais exclusivos",
  "Suporte próximo da equipe",
  "Atualizações contínuas incluídas",
];

const bonuses = [
  "Curso completo de Clareamento Dental",
  "Curso de Fotografia Odontológica com Prof. Caio Calisto",
  "Acesso à Comunidade Exclusiva de alunos",
];

const PricingSection = () => {
  return (
    <section id="preco" className="py-24 sm:py-32" style={{ background: "var(--gradient-section)" }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-accent mb-4">Investimento</p>
          <div className="divider-elegant mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight">
            Comece sua escalada hoje
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="premium-card overflow-hidden border-accent/20">
            {/* Header */}
            <div className="hero-dark px-8 py-8 text-center">
              <p className="text-white/50 text-sm mb-1">O Método Mont' — Treinamento Completo</p>
              <p className="text-white/40 text-sm line-through mb-3">De R$ 1.790,00</p>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-white/60 text-lg font-medium">12x de</span>
                <span className="font-serif text-5xl sm:text-6xl font-medium text-white">R$ 79</span>
                <span className="text-white/60 text-lg font-medium">,90</span>
              </div>
              <p className="text-white/30 text-sm mt-2">sem juros · ou R$ 958,80 à vista</p>
            </div>

            {/* Body */}
            <div className="px-8 py-8">
              <div className="mb-6">
                <p className="text-[12px] font-semibold tracking-widest uppercase text-foreground/60 mb-4">Incluso</p>
                <div className="space-y-3">
                  {includes.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/70 text-[14px]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8 pt-6 border-t border-border">
                <p className="text-[12px] font-semibold tracking-widest uppercase text-accent flex items-center gap-2 mb-4">
                  <Gift className="w-3.5 h-3.5" /> Bônus exclusivos
                </p>
                <div className="space-y-3">
                  {bonuses.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/70 text-[14px]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="https://metodomont.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta w-full justify-center text-base"
              >
                Garantir minha vaga <ArrowRight className="w-4 h-4" />
              </a>

              <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
                <Shield className="w-4 h-4 text-accent/60" />
                Compra 100% segura · Garantia de 15 dias
              </div>

              <div className="mt-5 flex justify-center">
                <img src="/images/pagamentos.svg" alt="Formas de pagamento aceitas" className="h-7 opacity-40" loading="lazy" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
