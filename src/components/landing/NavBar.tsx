import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Módulos", href: "#modulos" },
    { label: "Professor", href: "#professor" },
    { label: "Preço", href: "#preco" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur-lg border-b border-border shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between h-16">
        <a href="#">
          <img src="/images/logo.png" alt="Método Mont" className="h-8" />
        </a>

        <div className="hidden sm:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
          <a href="#preco" className="btn-cta py-2 px-5 text-sm">
            Quero me inscrever
          </a>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden text-foreground">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:hidden bg-background border-b border-border px-4 pb-4 space-y-3"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-foreground/70 hover:text-primary py-2"
            >
              {l.label}
            </a>
          ))}
          <a href="#preco" onClick={() => setMenuOpen(false)} className="btn-cta w-full justify-center py-3 text-sm">
            Quero me inscrever
          </a>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default NavBar;
