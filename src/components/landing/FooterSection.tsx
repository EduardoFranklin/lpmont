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
        <p className="text-foreground/10 text-xs">
          © {new Date().getFullYear()} Método Mont'. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
