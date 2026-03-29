import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface Props {
  ctaUrl: string;
}

const QuizPageStickyFooter = ({ ctaUrl }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-primary/15 px-5 sm:px-10 py-3.5 flex items-center justify-between gap-4 transition-transform duration-500 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="hidden sm:block text-sm text-muted-foreground font-light">
        <strong className="text-foreground font-semibold">Treinamento Online Método Mont'</strong> — 13 módulos, 5 Hands-On, comunidade e mentoria ao vivo
      </div>
      <a
        href={ctaUrl}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-[0.78rem] font-bold tracking-wide uppercase whitespace-nowrap shadow-[0_4px_20px_hsl(var(--brand-gold)/0.35)] hover:shadow-[0_6px_28px_hsl(var(--brand-gold)/0.5)] transition-all flex-shrink-0"
      >
        Quero Acesso Completo <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

export default QuizPageStickyFooter;
