import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Agendar from "./pages/Agendar.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import DashLogin from "./pages/DashLogin.tsx";
import Admin from "./pages/Admin.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import LeadDetail from "./pages/LeadDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import QuizPage from "./pages/QuizPage.tsx";
import Checkout from "./pages/Checkout.tsx";

/* force-publish-v3 */
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/agendar" element={<Agendar />} />
          <Route path="/dash" element={<Dashboard />} />
          <Route path="/dash/lead/:id" element={<LeadDetail />} />
          <Route path="/dash/login" element={<DashLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/lead/:id" element={<LeadDetail />} />
          <Route path="/quiz/:slug" element={<QuizPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
