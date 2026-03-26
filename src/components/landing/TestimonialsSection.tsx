import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Dra. Carolina Mendes",
    text: "O Método Mont' mudou completamente a forma como eu enxergo a odontologia restauradora. Hoje consigo resultados que antes eu achava impossíveis com resina composta. O Breno é um professor generoso e absurdamente didático.",
    role: "Dentista Clínica — São Luís, MA",
    avatar: "/images/testimonials/avatar-1.jpg",
  },
  {
    name: "Dr. Rafael Oliveira",
    text: "Eu já tinha feito outros cursos de resina, mas nenhum me deu a segurança que o Método Mont' me deu. A lógica da morfologia anterior e posterior finalmente fez sentido. Meus pacientes perceberam a diferença.",
    role: "Especialista em Dentística — Teresina, PI",
    avatar: "/images/testimonials/avatar-2.jpg",
  },
  {
    name: "Dra. Fernanda Rocha",
    text: "O módulo de propriedades ópticas foi um divisor de águas na minha carreira. Parei de 'decorar cores' e comecei a entender a lógica. Meus casos de faceta em resina hoje são incomparáveis com o que eu fazia antes.",
    role: "Clínica Geral — Fortaleza, CE",
    avatar: "/images/testimonials/avatar-3.jpg",
  },
  {
    name: "Dr. Lucas Barros",
    text: "Recém-formado, eu tinha medo de pegar qualquer caso anterior. Depois do Método Mont', fiz minha primeira faceta em resina com confiança total. O passo a passo do Breno elimina completamente a insegurança.",
    role: "Recém-formado — São Luís, MA",
    avatar: "/images/testimonials/avatar-4.jpg",
  },
  {
    name: "Dra. Isabela Santos",
    text: "A comunidade do curso é um diferencial absurdo. O nível das discussões, os feedbacks do Breno nos encontros ao vivo, a troca com outros dentistas… tudo isso acelera a evolução de um jeito que nenhum curso gravado faz sozinho.",
    role: "Dentista Clínica — Belém, PA",
    avatar: "/images/testimonials/avatar-5.jpg",
  },
  {
    name: "Dr. Marcos Almeida",
    text: "Tenho 18 anos de clínica e achava que sabia restaurar. O Breno me mostrou que eu estava cometendo erros que eu nem percebia — sobrecontorno, bisel errado, fotoativação mal feita. Hoje meus resultados duram muito mais.",
    role: "Dentista Clínico — Imperatriz, MA",
    avatar: "/images/testimonials/avatar-6.jpg",
  },
  {
    name: "Dra. Amanda Costa",
    text: "Os Hands-On são incríveis. Ver o Breno executando casos reais do Instituto, com todas as dificuldades e decisões do consultório, é muito mais valioso do que qualquer aula teórica. Isso é ensino de verdade.",
    role: "Especialista em Prótese — Recife, PE",
    avatar: "/images/testimonials/avatar-7.jpg",
  },
  {
    name: "Dr. Thiago Nascimento",
    text: "O módulo de Classe I e II transformou meu consultório. Minha taxa de refação caiu drasticamente e meus posteriores hoje duram anos. O conceito de análise estrutural antes de restaurar é genial e simples ao mesmo tempo.",
    role: "Clínico Geral — Salvador, BA",
    avatar: "/images/testimonials/avatar-8.jpg",
  },
  {
    name: "Dra. Juliana Farias",
    text: "Eu já indicava o Breno antes mesmo de ele lançar o curso online. Ele é, sem exagero, o melhor professor de dentística que eu já tive. A clareza com que ele explica coisas complexas é um talento raro.",
    role: "Mestre em Dentística — São Paulo, SP",
    avatar: "/images/testimonials/avatar-9.jpg",
  },
  {
    name: "Dr. André Souza",
    text: "Depois do curso, abri minha clínica focada em estética com resina. O Método Mont' me deu a base técnica e a confiança para dar esse passo. Melhor investimento que fiz na minha carreira até hoje.",
    role: "Proprietário de Clínica — São Luís, MA",
    avatar: "/images/testimonials/avatar-10.jpg",
  },
  {
    name: "Dra. Patrícia Lima",
    text: "O módulo de facetas em casos complexos é de outro nível. Diastemas, conoides, dentes escurecidos — tudo com protocolo claro. Saí do curso sabendo resolver qualquer caso anterior que aparecesse.",
    role: "Dentista Clínica — Manaus, AM",
    avatar: "/images/testimonials/avatar-11.jpg",
  },
  {
    name: "Dr. Gabriel Moreira",
    text: "A mentoria ao vivo com o Breno vale o investimento inteiro. Poder mostrar meus casos e receber feedback direto do professor, com toda a turma aprendendo junto, é uma experiência transformadora.",
    role: "Recém-formado — Brasília, DF",
    avatar: "/images/testimonials/avatar-12.jpg",
  },
];

const ITEMS_PER_PAGE = 3;
const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);

const TestimonialCard = ({ t }: { t: typeof testimonials[0] }) => (
  <div className="gradient-card">
    <div className="gradient-card-inner p-7 h-full flex flex-col">
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, s) => (
          <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
        ))}
      </div>
      <p className="text-foreground/40 text-[14px] leading-relaxed italic mb-6 flex-1">"{t.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-foreground/[0.04]">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-10 h-10 rounded-full object-cover border border-foreground/[0.06]"
          loading="lazy"
          decoding="async"
          width={40}
          height={40}
        />
        <div>
          <p className="font-medium text-foreground/70 text-sm">{t.name}</p>
          <p className="text-[11px] text-foreground/20">{t.role}</p>
        </div>
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => {
  const [page, setPage] = useState(0);
  const touchStart = useRef(0);

  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  const currentItems = testimonials.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

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
          <h2 className="text-[2.1rem] sm:text-4xl lg:text-[3.25rem] font-extrabold sm:font-semibold leading-[1.12] sm:leading-[1.2] text-foreground mb-5">
            Quem já fez a escalada
          </h2>
          <p className="text-foreground/30 text-lg font-light">
            Centenas de dentistas já transformaram suas carreiras com o Método Mont'.
          </p>
        </motion.div>

        {/* Mobile: paginated 3 at a time */}
        <div
          className="sm:hidden max-w-6xl mx-auto"
          onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStart.current - e.changedTouches[0].clientX;
            if (diff > 50) nextPage();
            else if (diff < -50) prevPage();
          }}
        >
          <div className="space-y-4">
            {currentItems.map((t, i) => (
              <motion.div
                key={`${page}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <TestimonialCard t={t} />
              </motion.div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevPage}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-foreground/10 text-foreground/40 hover:border-primary/30 hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i === page
                      ? "linear-gradient(135deg, hsl(38 100% 55%), hsl(30 80% 45%))"
                      : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
            <button
              onClick={nextPage}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-foreground/10 text-foreground/40 hover:border-primary/30 hover:text-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop/Tablet: grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <TestimonialCard t={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
