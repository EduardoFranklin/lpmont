import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (menuOpen) {
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    } else {
      root.style.overflow = "";
      body.style.overflow = "";
      body.style.touchAction = "";
    }

    return () => {
      root.style.overflow = "";
      body.style.overflow = "";
      body.style.touchAction = "";
    };
  }, [menuOpen]);

  const links = [
    { label: "A Trilha", href: "#modulos" },
    { label: "Spoiler (grátis)", href: "/quiz/aula1", external: true },
    { label: "O Guia", href: "#guia" },
    { label: "Investimento", href: "#preco" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const id = href.replace("#", "");

    window.dispatchEvent(new CustomEvent("nav-scroll-lock"));

    const scrollToTarget = (behavior: ScrollBehavior = "smooth") => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior });
    };

    requestAnimationFrame(() => scrollToTarget());
    setTimeout(() => scrollToTarget(), 80);
    setTimeout(() => scrollToTarget(), 420);
    setTimeout(() => {
      scrollToTarget("auto");
      window.dispatchEvent(new CustomEvent("nav-scroll-unlock"));
    }, 900);
  };

  return (
    <nav
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

        <div className="hidden lg:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              {...(l.external ? {} : { onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, l.href) })}
              className="text-[13px] font-medium text-foreground/40 hover:text-foreground transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <GradientButton href="#falar-equipe" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, "#falar-equipe")}>
            Falar com a Equipe <ArrowRight className="w-3.5 h-3.5" />
          </GradientButton>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((open) => !open)}
          className="lg:hidden relative z-[60] text-foreground/70 p-2 -mr-2 touch-manipulation"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <div
            className="lg:hidden fixed inset-0 top-[72px] bg-background z-40 overflow-hidden touch-none"
          >
            <div className="px-6 py-8 flex flex-col min-h-full">
              <div className="space-y-5 mb-8">
                {links.map((l) => (
                  <a key={l.href} href={l.href} {...(l.external ? { onClick: () => setMenuOpen(false) } : { onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, l.href) })} className="block text-lg text-foreground/60 hover:text-foreground transition-colors">
                    {l.label}
                  </a>
                ))}
              </div>

              <div className="space-y-3">
                <a href="https://pay.hotmart.com/F97566234Y" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="btn-summit w-full justify-center py-3 text-sm">
                  Comprar Agora <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a href="https://metodomont.com.br/#falar-equipe" onClick={() => setMenuOpen(false)} className="btn-gradient w-full">
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
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;
