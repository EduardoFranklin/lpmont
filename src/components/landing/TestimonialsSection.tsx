import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Gabriely Da Rosa", text: "Adoro a Dra Luiza Rosa!! Fora que o ambiente é super agradável e limpo!", date: "Jul 2025" },
  { name: "Luiz Vieira de Araújo Neto", text: "É muito bom saber que existe um lugar que alia ótimo atendimento e serviço de primeiríssima qualidade em São Luís! Profissionais e estrutura próprios de grandes centros.", date: "Jul 2025" },
  { name: "Aluna do Instituto", text: "O Método Mont mudou completamente minha forma de enxergar a odontologia restauradora. Hoje tenho segurança e resultados previsíveis em cada caso.", date: "2025" },
  { name: "Dentista Clínico", text: "Depois do curso, minha confiança clínica mudou. Os conceitos de morfologia e propriedades ópticas fizeram uma diferença absurda nos meus resultados.", date: "2025" },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 sm:py-32">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-accent mb-4">Depoimentos reais</p>
          <div className="divider-elegant mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight mb-4">
            A palavra dos nossos alunos
          </h2>
          <p className="text-muted-foreground">
            Centenas de dentistas já transformaram suas carreiras com o Método Mont'.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="premium-card p-7"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground/75 text-[15px] leading-relaxed italic mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                  {t.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{t.name}</p>
                  <p className="text-[12px] text-muted-foreground">{t.date}</p>
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
