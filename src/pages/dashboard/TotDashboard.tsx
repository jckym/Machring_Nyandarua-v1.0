// src/pages/dashboard/TotDashboard.tsx
import React from 'react';
import { 
  Users, 
  ShoppingCart, 
  Tractor, 
  MapPin, 
  GraduationCap, 
  TrendingUp 
} from 'lucide-react';

import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductChart } from '@/components/dashboard/ProductChart';

import { useTotDashboard, TotStats } from '@/hooks/api/useDashboard';
import { useAuth } from '@/contexts/AuthContext';

import { AlertCircle } from 'lucide-react';

// ============================================================
// DEV MODE MOCK DATA
// When API fails in dev mode, use this placeholder data
// ============================================================
const MOCK_TOT_STATS: TotStats = {
  totalFarmers: 24,
  totalSales: 15,
  totalRevenue: 385000,
  mechanisationJobs: 8,
  visitsCompleted: 42,
  trainingsHeld: 4,
  totalCommission: 38500,
};

export function TotDashboard() {
  const { user, isDevMode } = useAuth();
  const totId = user?.id;

  const { 
    data: statsResponse, 
    isLoading, 
    error 
  } = useTotDashboard(totId!);

  // In dev mode, use mock data if API fails
  const useMockData = isDevMode && error;
  const stats: TotStats = useMockData ? MOCK_TOT_STATS : (statsResponse?.data || MOCK_TOT_STATS);

  const formatCurrency = (value: number) => {
    if (!value) return 'KES 0K';
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  if (isLoading && !useMockData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            TOT Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'TOT'}! Track your field operations and performance
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatCard
          title="My Farmers"
          value={stats.totalFarmers || 0}
          subtitle="Registered farmers"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="forest"
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales || 0}
          subtitle="This month"
          icon={ShoppingCart}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue || 0)}
          subtitle="From sales"
          icon={TrendingUp}
          variant="wheat"
        />
        <StatCard
          title="Mechanisation"
          value={stats.mechanisationJobs || 0}
          subtitle="Jobs booked"
          icon={Tractor}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Farm Visits"
          value={stats.visitsCompleted || 0}
          subtitle="Completed"
          icon={MapPin}
        />
        <StatCard
          title="Trainings"
          value={stats.trainingsHeld || 0}
          subtitle="Sessions held"
          icon={GraduationCap}
          variant="earth"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <SalesChart />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <QuickActions />
          <ProductChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
      </div>
    </div>
  );
}
