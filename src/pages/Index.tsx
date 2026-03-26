import NavBar from "@/components/landing/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import ModulesSection from "@/components/landing/ModulesSection";
import InstructorSection from "@/components/landing/InstructorSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FooterSection from "@/components/landing/FooterSection";
import FloatingCTA from "@/components/landing/FloatingCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <HeroSection />
      <ProblemSection />
      <ModulesSection />
      <InstructorSection />
      <BenefitsSection />
      <TestimonialsSection />
      <PricingSection />
      <FooterSection />
      <FloatingCTA />
    </div>
  );
};

export default Index;
