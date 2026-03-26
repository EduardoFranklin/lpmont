const FooterSection = () => {
  return (
    <footer className="py-16 border-t border-border">
      <div className="section-container text-center">
        <img src="/images/logo.png" alt="Método Mont" className="h-10 mx-auto mb-5 opacity-60" loading="lazy" />
        <p className="text-muted-foreground text-sm mb-1">
          Método Mont' — Treinamento online de odontologia restauradora
        </p>
        <p className="text-muted-foreground/50 text-xs">
          © {new Date().getFullYear()} Método Mont'. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
