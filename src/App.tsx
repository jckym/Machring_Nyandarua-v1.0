import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import { Dashboard } from "@/pages/Dashboard";
import { Farmers } from "@/pages/Farmers";
import { Sales } from "@/pages/Sales";
import { Mechanisation } from "@/pages/Mechanisation";
import { Machinery } from "@/pages/Machinery";
import { Products } from "@/pages/Products";
import { Trainings } from "@/pages/Trainings";
import { Reports } from "@/pages/Reports";
import { Visits } from "@/pages/Visits";
import { FarmerProfile } from "@/pages/FarmerProfile";
import { Login } from "@/pages/Login";
import { Support } from "@/pages/Support";
import { Settings } from "@/pages/Settings";

// Form pages
import { NewFarmer } from "@/pages/farmers/NewFarmer";

// Admin pages
import { CommissionCalculator } from "@/pages/Commission";
import { Users } from "@/pages/admin/Users";
import { Branches } from "@/pages/admin/Branches";
import { SystemLogs } from "@/pages/admin/SystemLogs";
import { AuditLog } from "@/pages/admin/AuditLog";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component (Role-Based)
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Layout */}
              <Route element={<DashboardLayout />}>
                {/* Common Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/farmers" element={<Farmers />} />
                <Route path="/farmers/new" element={<NewFarmer />} />
                <Route path="/farmers/:id" element={<FarmerProfile />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/mechanisation" element={<Mechanisation />} />
                <Route path="/machinery" element={<Machinery />} />
                <Route path="/products" element={<Products />} />
                <Route path="/trainings" element={<Trainings />} />
                <Route path="/visits" element={<Visits />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/support" element={<Support />} />
                <Route path="/settings" element={<Settings />} />

                {/* Manager Routes */}
                <Route
                  path="/commission"
                  element={
                    <ProtectedRoute allowedRoles={["manager", "admin"]}>
                      <CommissionCalculator />
                    </ProtectedRoute>
                  }
                />
                <Route path="/tots" element={<Farmers />} /> {/* Or create dedicated TOTS page */}
                <Route path="/capacity-building" element={<Trainings />} />

                {/* Admin Routes */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/branches"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Branches />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Support /> {/* Or create dedicated Notifications page */}
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-logs"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <SystemLogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AuditLog />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
