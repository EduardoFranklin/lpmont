import { Mountain } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="py-16 border-t border-foreground/5">
      <div className="section-container text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mountain className="w-4 h-4 text-primary/40" />
          <img src="/images/logo.png" alt="Método Mont" className="h-8 opacity-40" loading="lazy" />
        </div>
        <p className="text-muted-foreground/60 text-sm mb-1">
          Método Mont' — A expedição até o topo da odontologia
        </p>
        <p className="text-muted-foreground/30 text-xs">
          © {new Date().getFullYear()} Método Mont'. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
