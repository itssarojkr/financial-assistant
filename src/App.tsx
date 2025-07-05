import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MobileService } from "@/services/mobileService";
import { useEffect } from "react";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import Help from "./pages/Help";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize mobile services
    MobileService.initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/calculator" element={<Index />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/help" element={<Help />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
