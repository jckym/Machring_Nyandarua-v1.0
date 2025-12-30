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
import { DemoRoleSwitcher } from "@/components/dev/DemoRoleSwitcher";

// Pages
import { Login } from "@/pages/Login";
import { Auth } from "@/pages/Auth";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { Dashboard } from "@/pages/Dashboard";
import { AdminDashboard } from "@/pages/dashboard/AdminDashboard";
import { ManagerDashboard } from "@/pages/dashboard/ManagerDashboard";
import { CoordinatorDashboard } from "@/pages/dashboard/CoordinatorDashboard";
import { TotDashboard } from "@/pages/dashboard/TotDashboard";
import { Farmers } from "@/pages/Farmers";
import { FarmerProfile } from "@/pages/FarmerProfile";
import { Sales } from "@/pages/Sales";
import { Mechanisation } from "@/pages/Mechanisation";
import { Machinery } from "@/pages/Machinery";
import { Visits } from "@/pages/Visits";
import { Trainings } from "@/pages/Trainings";
import { Products } from "@/pages/Products";
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
import { ApprovalRequests } from "@/pages/ApprovalRequests";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

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
                <Route path="/login" element={<Login />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
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
                  <Route path="/dashboard/coordinator" element={
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
                  <Route path="/mechanisation" element={<Mechanisation />} />
                  <Route path="/machinery" element={<Machinery />} />
                  <Route path="/visits" element={<Visits />} />
                  <Route path="/trainings" element={<Trainings />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/commission" element={<Commission />} />
                  <Route path="/notifications" element={<Notifications />} />
                  
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
                  <Route path="/approval-requests" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ApprovalRequests />
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
              <DemoRoleSwitcher />
            </NotificationProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
