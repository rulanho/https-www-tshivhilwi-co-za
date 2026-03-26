import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Households from "@/pages/Households";
import Payments from "@/pages/Payments";
import BurialCases from "@/pages/BurialCases";
import Payouts from "@/pages/Payouts";
import SettingsPage from "@/pages/Settings";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Requests from "@/pages/Requests";
import SpecialContributions from "@/pages/SpecialContributions";
import SectionLeaders from "@/pages/SectionLeaders";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <DataProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/households" element={<Households />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/burial-cases" element={<BurialCases />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/special-contributions" element={<SpecialContributions />} />
          <Route path="/section-leaders" element={<SectionLeaders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </DataProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ProtectedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
