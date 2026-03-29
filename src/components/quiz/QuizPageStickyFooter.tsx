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
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-primary/15 px-4 sm:px-10 py-3.5 transition-transform duration-500 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <a
        href={ctaUrl}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full text-[0.82rem] font-bold tracking-wide uppercase shadow-[0_4px_20px_hsl(var(--brand-gold)/0.35)] hover:shadow-[0_6px_28px_hsl(var(--brand-gold)/0.5)] transition-all"
      >
        Quero Acesso Completo <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

export default QuizPageStickyFooter;
