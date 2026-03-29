import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  ctaUrl: string;
}

const QuizNavBar = ({ ctaUrl }: Props) => {
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { label: "A Trilha", href: "https://metodomont.com.br/#modulos" },
    { label: "O Guia", href: "https://metodomont.com.br/#guia" },
    { label: "Investimento", href: "https://metodomont.com.br/#preco" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-background/60 border-b border-foreground/[0.04]"
          : "bg-background/90 backdrop-blur-xl border-b border-border/40"
      }`}
      style={scrolled ? { backgroundImage: "linear-gradient(hsl(var(--background)), hsl(var(--background) / 0.3))" } : {}}
    >
      <div className="flex items-center justify-between h-[72px] px-5 sm:px-10">
        <a href="/" className="flex items-center gap-2">
          <img src="/images/logo-metodo-mont.svg" alt="Método Mont'" className="h-7 sm:h-8 opacity-80 hover:opacity-100 transition-opacity" decoding="async" />
        </a>

        {/* Desktop only */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-foreground/40 hover:text-foreground transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
          <a href={ctaUrl} className="btn-summit text-xs !px-5 !py-2.5">
            Quero Acesso Completo
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default QuizNavBar;
