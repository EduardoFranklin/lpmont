import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Gabriely Da Rosa", text: "Adoro a Dra Luiza Rosa!! Fora que o ambiente é super agradável e limpo!", date: "14/07/2025" },
  { name: "Luiz Vieira", text: "É muito bom saber que existe um lugar que alia ótimo atendimento e serviço de primeiríssima qualidade em São Luís! Profissionais e estrutura próprios de grandes centros.", date: "14/07/2025" },
  { name: "Aluno do Instituto", text: "O Método Mont mudou completamente minha forma de enxergar a odontologia restauradora. Hoje tenho segurança e resultados previsíveis em cada caso.", date: "2025" },
  { name: "Dentista Clínico", text: "Depois do curso, minha confiança clínica mudou. Os conceitos de morfologia e propriedades ópticas fizeram uma diferença absurda nos meus resultados.", date: "2025" },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl mb-4">
            <span className="text-foreground">COM A PALAVRA: </span>
            <span className="gold-text">NOSSOS ALUNOS</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Por aqui já passaram centenas de dentistas que nos orgulham
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground/80 mb-4 leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
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
