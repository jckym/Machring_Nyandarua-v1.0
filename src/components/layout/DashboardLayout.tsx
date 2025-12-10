import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatingActions } from './FloatingActions';
import { OfflineBanner } from './OfflineBanner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function DashboardLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <OfflineBanner />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-24 lg:pb-6">
          <Outlet />
        </main>
        <FloatingActions />
      </div>
    </div>
  );
}
