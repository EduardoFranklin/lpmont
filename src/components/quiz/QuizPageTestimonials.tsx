interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar?: string;
}

interface Props {
  testimonials: Testimonial[];
}

const QuizPageTestimonials = ({ testimonials }: Props) => {
  if (!testimonials.length) return null;
  const visible = testimonials.slice(0, 3);

  return (
    <div className="max-w-[860px] mx-auto px-5 sm:px-10 py-12 relative z-[1]">
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-primary mb-2.5">
          <span className="block w-7 h-px bg-primary/40" />
          Depoimentos
          <span className="block w-7 h-px bg-primary/40" />
        </div>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.8rem,4vw,2.8rem)] tracking-wide">
          Quem já fez a escalada
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {visible.map((t, i) => {
          const initials = t.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/20 transition-colors"
            >
              <div className="text-primary text-[0.75rem] tracking-[2px]">★★★★★</div>
              <p className="text-[0.81rem] text-foreground/60 leading-relaxed font-light italic flex-1">
                {t.text}
              </p>
              <div className="flex items-center gap-2.5 mt-auto">
                <div className="w-[34px] h-[34px] rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[0.7rem] font-bold text-primary font-['Bebas_Neue',sans-serif] tracking-wide overflow-hidden">
                  {t.avatar ? (
                    <img src={t.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <div className="text-[0.78rem] font-semibold text-foreground/70">{t.name}</div>
                  <div className="text-[0.68rem] text-muted-foreground font-light">{t.role}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizPageTestimonials;
