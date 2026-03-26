import { Instagram } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="py-16 border-t border-foreground/[0.04]">
      <div className="section-container text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/images/logo-metodo-mont.svg" alt="Método Mont'" className="h-6 opacity-30" loading="lazy" decoding="async" />
        </div>
        <p className="text-foreground/20 text-sm mb-1">
          A expedição até o topo da odontologia restauradora.
        </p>

        <div className="flex items-center justify-center gap-4 mt-4 mb-4">
          <a
            href="https://www.instagram.com/instituto.montalverne/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-foreground/25 hover:text-primary transition-colors text-xs"
          >
            <Instagram className="w-4 h-4" />
            <span>Instituto</span>
          </a>
          <a
            href="https://www.instagram.com/bremontalverne/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-foreground/25 hover:text-primary transition-colors text-xs"
          >
            <Instagram className="w-4 h-4" />
            <span>Dr. Breno</span>
          </a>
        </div>

        <p className="text-foreground/10 text-xs">
          © {new Date().getFullYear()} Método Mont'. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
