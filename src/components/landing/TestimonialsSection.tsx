import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Gabriely Da Rosa", text: "Adoro a Dra Luiza Rosa!! Fora que o ambiente é super agradável e limpo!", date: "Jul 2025" },
  { name: "Luiz Vieira de Araújo Neto", text: "É muito bom saber que existe um lugar que alia ótimo atendimento e serviço de primeiríssima qualidade em São Luís!", date: "Jul 2025" },
  { name: "Aluna do Instituto", text: "O Método Mont mudou completamente minha forma de enxergar a odontologia restauradora. Hoje tenho segurança e resultados previsíveis.", date: "2025" },
  { name: "Dentista Clínico", text: "Depois do curso, minha confiança clínica mudou. Os conceitos de morfologia e propriedades ópticas fizeram uma diferença absurda.", date: "2025" },
];

const TestimonialsSection = () => {
  return (
    <section className="py-28 sm:py-36 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="caption-line-h"><div className="caption-line-h-inner" /></div>
            <span className="text-[12px] tracking-[0.2em] uppercase font-medium text-primary/60">Depoimentos</span>
            <div className="caption-line-h" style={{ transform: "scaleX(-1)" }}><div className="caption-line-h-inner" /></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-semibold leading-[1.2] text-foreground mb-5">
            Quem já fez a escalada
          </h2>
          <p className="text-foreground/30 text-lg font-light">
            Centenas de dentistas já transformaram suas carreiras com o Método Mont'.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="gradient-card"
            >
              <div className="gradient-card-inner p-7 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground/40 text-[15px] leading-relaxed italic mb-6 flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-foreground/[0.04]">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {t.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-foreground/70 text-sm">{t.name}</p>
                    <p className="text-[12px] text-foreground/20">{t.date}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
