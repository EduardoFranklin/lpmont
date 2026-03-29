import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

const GradientButton = ({ href, children, className = "", ...rest }: { href: string; children: React.ReactNode; className?: string; [key: string]: any }) => (
  <a href={href} {...rest} className={`btn-gradient ${className}`}>
    <div className="btn-gradient-wrapper">
      <div className="btn-gradient-inner">
        <div className="btn-gradient-bg" />
        <span className="btn-gradient-text">{children}</span>
      </div>
    </div>
  </a>
);

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "A Trilha", href: "#modulos" },
    { label: "O Guia", href: "#guia" },
    { label: "Investimento", href: "#preco" },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-background/60 border-b border-foreground/[0.04]"
          : "bg-transparent"
      }`}
      style={scrolled ? { backgroundImage: "linear-gradient(hsl(var(--background)), hsl(var(--background) / 0.3))" } : {}}
    >
      <div className="section-container flex items-center justify-between h-[72px]">
        <a href="#" className="flex items-center gap-2">
          <img src="/images/logo-metodo-mont.svg" alt="Método Mont'" className="h-8" decoding="async" />
        </a>

        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-foreground/40 hover:text-foreground transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <GradientButton href="#falar-equipe">
            Falar com a Equipe <ArrowRight className="w-3.5 h-3.5" />
          </GradientButton>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-foreground/70 p-1">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-foreground/5 overflow-hidden"
          >
            <div className="px-5 py-6 space-y-4">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block text-sm text-foreground/60 hover:text-foreground py-1">
                  {l.label}
                </a>
              ))}
              <a href="https://pay.hotmart.com/F97566234Y" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="btn-summit w-full justify-center py-3 text-sm mt-2">
                Comprar Agora <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a href="#falar-equipe" onClick={() => setMenuOpen(false)} className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl border border-foreground/10 text-foreground/50 hover:text-foreground/70 transition-colors">
                Falar com a Equipe
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
