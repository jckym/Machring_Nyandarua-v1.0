import React, { Suspense, lazy } from 'react';
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

// Lazy load pages for code splitting
const Auth = lazy(() => import("@/pages/Auth").then(m => ({ default: m.Auth })));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("@/pages/ResetPassword").then(m => ({ default: m.ResetPassword })));
const Dashboard = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.Dashboard })));
const AdminDashboard = lazy(() => import("@/pages/dashboard/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ManagerDashboard = lazy(() => import("@/pages/dashboard/ManagerDashboard").then(m => ({ default: m.ManagerDashboard })));
const CoordinatorDashboard = lazy(() => import("@/pages/dashboard/CoordinatorDashboard").then(m => ({ default: m.CoordinatorDashboard })));
const TotDashboard = lazy(() => import("@/pages/dashboard/TotDashboard").then(m => ({ default: m.TotDashboard })));
const Farmers = lazy(() => import("@/pages/Farmers").then(m => ({ default: m.Farmers })));
const FarmerProfile = lazy(() => import("@/pages/FarmerProfile").then(m => ({ default: m.FarmerProfile })));
const Sales = lazy(() => import("@/pages/Sales").then(m => ({ default: m.Sales })));
const Machinery = lazy(() => import("@/pages/Machinery").then(m => ({ default: m.Machinery })));
const Products = lazy(() => import("@/pages/Products").then(m => ({ default: m.Products })));
const Visits = lazy(() => import("@/pages/Visits").then(m => ({ default: m.Visits })));
const VisitDetails = lazy(() => import("@/pages/VisitDetails").then(m => ({ default: m.VisitDetails })));
const Trainings = lazy(() => import("@/pages/Trainings").then(m => ({ default: m.Trainings })));
const TrainingDetails = lazy(() => import("@/pages/TrainingDetails").then(m => ({ default: m.TrainingDetails })));
const Reports = lazy(() => import("@/pages/Reports").then(m => ({ default: m.Reports })));
const Settings = lazy(() => import("@/pages/Settings").then(m => ({ default: m.Settings })));
const Support = lazy(() => import("@/pages/Support").then(m => ({ default: m.Support })));
const Users = lazy(() => import("@/pages/admin/Users").then(m => ({ default: m.Users })));
const LocalMRs = lazy(() => import("@/pages/admin/LocalMRs").then(m => ({ default: m.LocalMRs })));
const LocalMRDetails = lazy(() => import("@/pages/admin/LocalMRDetails").then(m => ({ default: m.LocalMRDetails })));
const AuditLog = lazy(() => import("@/pages/admin/AuditLog").then(m => ({ default: m.AuditLog })));
const SystemLogs = lazy(() => import("@/pages/admin/SystemLogs").then(m => ({ default: m.SystemLogs })));

const Commission = lazy(() => import("@/pages/Commission").then(m => ({ default: m.Commission })));
const TOTManagement = lazy(() => import("@/pages/TOTManagement").then(m => ({ default: m.TOTManagement })));
const Notifications = lazy(() => import("@/pages/Notifications").then(m => ({ default: m.Notifications })));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Install = lazy(() => import("@/pages/Install"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/install" element={<Install />} />
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
                    <Route path="/local-mrs/:id" element={
                      <ProtectedRoute allowedRoles={['manager', 'admin']}>
                        <LocalMRDetails />
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
              </Suspense>
            </NotificationProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
