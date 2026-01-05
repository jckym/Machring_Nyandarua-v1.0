import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import { Auth } from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import { AdminDashboard } from "@/pages/dashboard/AdminDashboard";
import { ManagerDashboard } from "@/pages/dashboard/ManagerDashboard";
import { CoordinatorDashboard } from "@/pages/dashboard/CoordinatorDashboard";
import { TotDashboard } from "@/pages/dashboard/TotDashboard";
import { Farmers } from "@/pages/Farmers";
import { FarmerProfile } from "@/pages/FarmerProfile";
import { Sales } from "@/pages/Sales";
// Mechanisation removed - using Machinery as single source of truth
import { Machinery } from "@/pages/Machinery";
import { Products } from "@/pages/Products";
import { Visits } from "@/pages/Visits";
import { VisitDetails } from "@/pages/VisitDetails";
import { Trainings } from "@/pages/Trainings";
import { TrainingDetails } from "@/pages/TrainingDetails";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { Support } from "@/pages/Support";
import { Users } from "@/pages/admin/Users";
import { LocalMRs } from "@/pages/admin/LocalMRs";
import { AuditLog } from "@/pages/admin/AuditLog";
import { SystemLogs } from "@/pages/admin/SystemLogs";
import { Commission } from "@/pages/Commission";
import { TOTManagement } from "@/pages/TOTManagement";
import { Notifications } from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NotificationProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Role-specific dashboards */}
                  <Route path="/dashboard/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/manager" element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <ManagerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/local-mr" element={
                    <ProtectedRoute allowedRoles={['local_mr_coordinator', 'admin']}>
                      <CoordinatorDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/tot" element={
                    <ProtectedRoute allowedRoles={['tot', 'local_mr_coordinator', 'manager', 'admin']}>
                      <TotDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Shared routes */}
                  <Route path="/farmers" element={<Farmers />} />
                  <Route path="/farmers/:id" element={<FarmerProfile />} />
                  <Route path="/sales" element={<Sales />} />
                  {/* Mechanisation routes removed - machinery is the single source */}
                  <Route path="/machinery" element={<Machinery />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/visits" element={<Visits />} />
                  <Route path="/visits/:id" element={<VisitDetails />} />
                  <Route path="/trainings" element={<Trainings />} />
                  <Route path="/trainings/:id" element={<TrainingDetails />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/commission" element={<Commission />} />
                  <Route path="/notifications" element={<Notifications />} />
                  
                  {/* Reports - Admin, Manager, Coordinator only */}
                  <Route path="/reports" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'local_mr_coordinator']}>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  
                  {/* Coordinator, Manager & Admin routes */}
                  <Route path="/tots" element={
                    <ProtectedRoute allowedRoles={['local_mr_coordinator', 'manager', 'admin']}>
                      <TOTManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin & Manager routes */}
                  <Route path="/local-mrs" element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <LocalMRs />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin-only routes */}
                  <Route path="/users" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Users />
                    </ProtectedRoute>
                  } />
                  <Route path="/audit" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AuditLog />
                    </ProtectedRoute>
                  } />
                  <Route path="/system-logs" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <SystemLogs />
                    </ProtectedRoute>
                  } />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </NotificationProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
