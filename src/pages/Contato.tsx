import NavBar from "@/components/landing/NavBar";
import ContactFormSection from "@/components/landing/ContactFormSection";
import FooterSection from "@/components/landing/FooterSection";

const Contato = () => (
  <div className="min-h-screen bg-background">
    <NavBar />
    <div className="pt-[72px]">
      <ContactFormSection />
      <FooterSection />
    </div>
  </div>
);

export default Contato;
