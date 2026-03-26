import NavBar from "@/components/landing/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import ModulesSection from "@/components/landing/ModulesSection";
import MethodSection from "@/components/landing/MethodSection";
import InstructorSection from "@/components/landing/InstructorSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FooterSection from "@/components/landing/FooterSection";
import WhatsAppButton from "@/components/landing/WhatsAppButton";
import useTrackingScripts from "@/hooks/useTrackingScripts";

const Index = () => {
  useTrackingScripts();
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <HeroSection />
      <ProblemSection />
      <ModulesSection />
      <MethodSection />
      <InstructorSection />
      <BenefitsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FooterSection />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
