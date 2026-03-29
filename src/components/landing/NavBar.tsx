import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Instagram } from "lucide-react";
import { useSection, parseJSON } from "@/hooks/useSiteContent";

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
  const footerContent = useSection("footer");
  const instagramLinks = parseJSON<{ label: string; url: string }[]>(footerContent.instagram_links, []);

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 top-[72px] bg-background/98 backdrop-blur-2xl z-40 overflow-y-auto"
          >
            <div className="px-6 py-8 flex flex-col min-h-full">
              <div className="space-y-5 mb-8">
                {links.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block text-lg text-foreground/60 hover:text-foreground transition-colors">
                    {l.label}
                  </a>
                ))}
              </div>

              <div className="space-y-3">
                <a href="https://pay.hotmart.com/F97566234Y" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="btn-summit w-full justify-center py-3 text-sm">
                  Comprar Agora <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a href="/#falar-equipe" onClick={() => setMenuOpen(false)} className="btn-gradient w-full">
                  <div className="btn-gradient-wrapper w-full">
                    <div className="btn-gradient-inner w-full">
                      <div className="btn-gradient-bg" />
                      <span className="btn-gradient-text justify-center w-full">Falar com a Equipe</span>
                    </div>
                  </div>
                </a>
              </div>

              {instagramLinks.length > 0 && (
                <div className="flex items-center justify-center gap-5 mt-10">
                  {instagramLinks.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-foreground/25 hover:text-primary transition-colors text-xs">
                      <Instagram className="w-4 h-4" />
                      <span>{l.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
