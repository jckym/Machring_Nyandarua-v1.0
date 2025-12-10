import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Farmers } from "@/pages/Farmers";
import { Sales } from "@/pages/Sales";
import { Mechanisation } from "@/pages/Mechanisation";
import { Products } from "@/pages/Products";
import { Trainings } from "@/pages/Trainings";
import { Reports } from "@/pages/Reports";
import { Visits } from "@/pages/Visits";
import { Login } from "@/pages/Login";
import { Support } from "@/pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/farmers" element={<Farmers />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/mechanisation" element={<Mechanisation />} />
              <Route path="/products" element={<Products />} />
              <Route path="/trainings" element={<Trainings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/visits" element={<Visits />} />
              <Route path="/support" element={<Support />} />
              {/* Manager specific routes */}
              <Route path="/tots" element={<Farmers />} />
              <Route path="/capacity-building" element={<Trainings />} />
              <Route path="/commission" element={<Reports />} />
              {/* Admin specific routes */}
              <Route path="/users" element={<Farmers />} />
              <Route path="/branches" element={<Dashboard />} />
              <Route path="/notifications" element={<Support />} />
              <Route path="/system-logs" element={<Reports />} />
              <Route path="/audit" element={<Reports />} />
              <Route path="/settings" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
