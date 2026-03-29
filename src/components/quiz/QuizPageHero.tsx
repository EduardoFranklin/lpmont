import type { QuizPageData } from "@/pages/QuizPage";

interface Props {
  page: QuizPageData;
}

const QuizPageHero = ({ page }: Props) => {
  const initials = page.hero_author_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="relative max-w-[860px] mx-auto px-5 sm:px-10 pt-16 pb-12 z-[1]">
      <div className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-primary mb-5">
        <span className="block w-7 h-px bg-primary/50" />
        {page.hero_label}
        <span className="block w-7 h-px bg-primary/50" />
      </div>

      <h1
        className="font-['Bebas_Neue',sans-serif] text-[clamp(3rem,7vw,5.2rem)] leading-[0.95] tracking-wide mb-4"
        dangerouslySetInnerHTML={{
          __html: page.hero_title.replace(
            /\*(.*?)\*/g,
            '<em class="not-italic text-primary">$1</em>'
          ),
        }}
      />

      {page.hero_message && (
        <div className="flex gap-4 items-stretch mt-7 max-w-[560px]">
          <div className="w-[3px] flex-shrink-0 rounded-sm bg-gradient-to-b from-primary to-primary/20" />
          <div className="flex flex-col gap-4">
            <p className="text-[0.95rem] text-foreground/70 leading-relaxed font-light italic">
              "{page.hero_message}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-[38px] h-[38px] rounded-full bg-primary/12 border border-primary/30 flex items-center justify-center font-['Bebas_Neue',sans-serif] text-sm text-primary tracking-wide">
                {initials}
              </div>
              <div>
                <strong className="text-[0.82rem] font-semibold text-foreground leading-tight block">
                  {page.hero_author_name}
                </strong>
                <span className="text-[0.7rem] text-muted-foreground font-light">
                  {page.hero_author_role}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default QuizPageHero;
