import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Mountain } from "lucide-react";

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
    { label: "O Guia", href: "#professor" },
    { label: "Base Camp", href: "#preco" },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-foreground/5 shadow-lg shadow-background/50"
          : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between h-[72px]">
        <a href="#" className="flex items-center gap-2.5">
          <Mountain className="w-5 h-5 text-primary" />
          <img src="/images/logo.png" alt="Método Mont" className="h-7 opacity-90" />
        </a>

        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[12px] font-medium tracking-[0.15em] uppercase text-foreground/40 hover:text-primary transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a href="#preco" className="btn-summit py-2.5 px-6 text-sm">
            Iniciar Expedição <ArrowRight className="w-3.5 h-3.5" />
          </a>
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
              <a href="#preco" onClick={() => setMenuOpen(false)} className="btn-summit w-full justify-center py-3 text-sm mt-2">
                Iniciar Expedição
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
