import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "O Curso", href: "#modulos" },
    { label: "Professor", href: "#professor" },
    { label: "Investimento", href: "#preco" },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-popover/95 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between h-[72px]">
        <a href="#" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Método Mont" className="h-9" />
        </a>

        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium tracking-widest uppercase text-foreground/60 hover:text-foreground transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a href="#preco" className="btn-cta py-2.5 px-6 text-sm">
            Quero me inscrever <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-foreground p-1">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-popover border-b border-border overflow-hidden"
          >
            <div className="px-5 py-6 space-y-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium text-foreground/70 hover:text-foreground py-1"
                >
                  {l.label}
                </a>
              ))}
              <a href="#preco" onClick={() => setMenuOpen(false)} className="btn-cta w-full justify-center py-3 text-sm mt-2">
                Quero me inscrever
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
