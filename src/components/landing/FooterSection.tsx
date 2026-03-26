const FooterSection = () => {
  return (
    <footer className="py-16 border-t border-foreground/[0.04]">
      <div className="section-container text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-lg">⛰️</span>
          <span className="text-sm font-medium text-foreground/30">Método Mont'</span>
        </div>
        <p className="text-foreground/20 text-sm mb-1">
          A expedição até o topo da odontologia restauradora.
        </p>
        <p className="text-foreground/10 text-xs">
          © {new Date().getFullYear()} Método Mont'. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
