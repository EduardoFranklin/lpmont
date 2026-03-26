import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Para quem é o Treinamento Mont'Alverne?",
    a: "Para dentistas que querem dominar restaurações em resina composta com previsibilidade, estética e segurança — independentemente do nível de experiência. Do recém-formado ao profissional experiente que quer refinar a técnica.",
  },
  {
    q: "Preciso ter experiência prévia com resina?",
    a: "Não. O método foi desenhado para ser progressivo: começa na base (morfologia e princípios ópticos) e avança até casos complexos como reabilitações completas. Cada etapa prepara para a próxima.",
  },
  {
    q: "Por quanto tempo terei acesso ao conteúdo?",
    a: "O acesso é disponível por 12 meses a partir da data da compra. Durante esse período, você também recebe todas as atualizações de conteúdo sem custo adicional.",
  },
  {
    q: "As aulas são gravadas ou ao vivo?",
    a: "O treinamento conta com aulas gravadas que você assiste no seu ritmo, além de 12 encontros ao vivo por ano com o Prof. Breno Mont'Alverne para tirar dúvidas e discutir casos clínicos.",
  },
  {
    q: "Qual a garantia de satisfação?",
    a: "Você tem 15 dias de garantia incondicional. Se por qualquer motivo sentir que o treinamento não é para você, basta solicitar o reembolso integral — sem burocracia.",
  },
  {
    q: "Como funciona o suporte?",
    a: "Você terá suporte próximo da equipe do Instituto para dúvidas sobre o conteúdo, técnicas e casos clínicos. O objetivo é que você nunca se sinta sozinho na jornada.",
  },
  {
    q: "Posso parcelar o pagamento?",
    a: "Sim! Oferecemos parcelamento em até 12x no cartão de crédito, além de opções com desconto para pagamento à vista via Pix ou boleto.",
  },
  {
    q: "Os Hands-On são presenciais?",
    a: "Os Hands-On incluídos no treinamento online são módulos em vídeo com casos reais do Instituto, onde você acompanha cada etapa do procedimento em detalhes. São projetados para simular a experiência prática o máximo possível.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-28 sm:py-36 relative">
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">
              Perguntas Frequentes
            </span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-[2.1rem] sm:text-4xl lg:text-[3.25rem] font-extrabold sm:font-semibold leading-[1.12] sm:leading-[1.2] text-foreground mb-5">
            Tire suas dúvidas
          </h2>
          <p className="text-foreground/30 text-lg font-light">
            As perguntas mais comuns sobre o treinamento respondidas de forma direta.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="gradient-card rounded-2xl overflow-hidden border-none"
              >
                <div className="gradient-card-inner rounded-2xl px-6">
                  <AccordionTrigger className="text-left text-[15px] sm:text-base font-medium text-foreground/80 hover:text-foreground py-5 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/30 text-[14px] leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
