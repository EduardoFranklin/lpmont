import NavBar from "@/components/landing/NavBar";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";
import { useLeadTracking } from "@/hooks/useLeadTracking";

const Checkout = () => {
  useLeadTracking("checkout_started");
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <PricingSection />
      <FooterSection />
    </div>
  );
};

export default Checkout;
