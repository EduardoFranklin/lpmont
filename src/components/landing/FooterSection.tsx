const FooterSection = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="section-container text-center">
        <img src="/images/logo.png" alt="Método Mont" className="h-12 mx-auto mb-4 opacity-80" loading="lazy" />
        <p className="text-muted-foreground text-sm mb-2">
          Método Mont' — Treinamento online de odontologia restauradora
        </p>
        <p className="text-muted-foreground/60 text-xs">
          © {new Date().getFullYear()} Método Mont'. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
