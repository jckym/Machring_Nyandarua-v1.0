// src/layouts/DashboardLayout.tsx
import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatingActions } from './FloatingActions';
import { OfflineBanner } from './OfflineBanner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Leaf, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================
// DEV MODE BANNER COMPONENT
// ============================================================
function DevModeBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-yellow-950 text-center py-1 px-4 text-sm font-semibold flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4" />
      <span>⚠️ DEV MODE: Authentication is disabled. All access granted as mock admin.</span>
      <AlertTriangle className="w-4 h-4" />
    </div>
  );
}

export function DashboardLayout() {
  const { user, isLoading, isAuthenticated, isDevMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Full-screen branded loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full w-32 h-32 animate-pulse" />
            <Leaf className="w-16 h-16 text-primary animate-spin relative z-10" />
          </div>
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Welcome back to Farm Society KE</p>
            <p className="text-sm text-muted-foreground mt-2">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based redirects on dashboard root access
  useEffect(() => {
    if (!user) return;

    const currentPath = location.pathname;
    const isAtRootDashboard = currentPath === '/dashboard' || currentPath === '/dashboard/';

    if (isAtRootDashboard) {
      let redirectPath = '/dashboard';

      switch (user.role) {
        case 'tot':
          redirectPath = '/dashboard/tot';
          break;
        case 'manager':
          redirectPath = '/dashboard/manager';
          break;
        case 'admin':
          redirectPath = '/dashboard/admin';
          break;
        default:
          redirectPath = '/dashboard/tot'; // fallback
      }

      navigate(redirectPath, { replace: true });
    }
  }, [user, location.pathname, navigate]);


  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* DEV MODE: Show warning banner when auth is disabled */}
      {isDevMode && <DevModeBanner />}
      
      <OfflineBanner />
      <Sidebar />

      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden lg:ml-0 ${isDevMode ? 'pt-8' : ''}`}>
        <Header />

        <main
          className="flex-1 overflow-y-auto bg-muted/20"
          role="main"
          aria-label="Main content"
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        <FloatingActions />
      </div>
    </div>
  );
}
