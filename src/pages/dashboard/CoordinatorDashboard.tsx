// src/pages/dashboard/CoordinatorDashboard.tsx
import React from 'react';
import { 
  Users, ShoppingCart, Tractor, Building2, 
  GraduationCap, TrendingUp, UserCheck, MapPin 
} from 'lucide-react';

import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductChart } from '@/components/dashboard/ProductChart';
import { TopPerformers } from '@/components/dashboard/TopPerformers';

import { useManagerDashboard, ManagerStats } from '@/hooks/api/useDashboard';
import { useLocalMR } from '@/hooks/api/useLocalMRs';
import { useTotsByLocalMR } from '@/hooks/api/useTotsByLocalMR';
import { useFarmers } from '@/hooks/api/useFarmers';
import { useSales } from '@/hooks/api/useSales';
import { useMechanisationJobs } from '@/hooks/api/useMechanisation';
import { useTrainings } from '@/hooks/api/useTrainings';
import { useVisits } from '@/hooks/api/useVisits';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Farmer, Sale, MechanisationJob, Training, Visit, LocalMR, TOTPerformance } from '@/types';

export function CoordinatorDashboard() {
  const { user } = useAuth();
  const localMrId = user?.localMrId;

  // Fetch core data
  const { data: managerStatsResponse, isLoading: statsLoading } = useManagerDashboard(localMrId!);
  
  // API hooks - data is already normalized by select transforms
  const { data: localMr } = useLocalMR(localMrId!);
  const { data: totPerformance = [] } = useTotsByLocalMR(localMrId!);
  const { data: farmers = [], isLoading: farmersLoading } = useFarmers({ localMrId });
  const { data: sales = [], isLoading: salesLoading } = useSales({ localMrId });
  const { data: jobs = [], isLoading: jobsLoading } = useMechanisationJobs({ localMrId });
  const { data: trainings = [], isLoading: trainingsLoading } = useTrainings({ localMrId });
  const { data: visits = [], isLoading: visitsLoading } = useVisits({ localMrId });

  // Unwrap manager stats
  const managerStats: ManagerStats | undefined = managerStatsResponse?.data;

  // Derived stats
  const totalRevenue = (sales as Sale[])
    .filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + (s.total || 0), 0);

  const completedJobs = (jobs as MechanisationJob[]).filter(j => j.status === 'completed').length;
  const pendingApprovals = (jobs as MechanisationJob[]).filter(j => j.status === 'pending-approval').length;
  const activeTots = (totPerformance as TOTPerformance[]).filter(t => t.status === 'active').length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `KES ${(value / 1000000).toFixed(1)}M`;
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  const isLoading = statsLoading || farmersLoading || salesLoading || jobsLoading || trainingsLoading || visitsLoading;

  if (!localMrId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No Local MR assigned. Contact admin.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>
        <div className="grid grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!managerStats || !localMr) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="w-16 h-16 mb-4 text-orange-500" />
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Local MR Dashboard</h1>
          <p className="text-muted-foreground">{(localMr as LocalMR).name} Overview (Read-Only)</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="wheat" className="text-sm py-1 px-3">
            Coordinator View
          </Badge>
          <Badge variant="forest" className="text-sm py-1 px-3">
            <Building2 className="w-4 h-4 mr-1" />
            {activeTots} TOTs Active
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatCard
          title="Total Farmers"
          value={(farmers as Farmer[]).length}
          subtitle="In your Local MR"
          icon={Users}
          trend={{ value: 18, isPositive: true }}
          variant="forest"
        />
        <StatCard
          title="Active TOTs"
          value={activeTots}
          subtitle="In your team"
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Sales"
          value={(sales as Sale[]).length}
          subtitle="This month"
          icon={ShoppingCart}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="Local MR revenue"
          icon={TrendingUp}
          variant="wheat"
        />
        <StatCard
          title="Mechanisation"
          value={completedJobs}
          subtitle="Jobs completed"
          icon={Tractor}
          trend={{ value: 22, isPositive: true }}
        />
        <StatCard
          title="Trainings"
          value={(trainings as Training[]).length}
          subtitle="Sessions held"
          icon={GraduationCap}
          variant="earth"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          <SalesChart />

          {/* TOT Team Overview */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">TOT Team Overview</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(totPerformance as TOTPerformance[]).slice(0, 5).map((tot, index) => (
                  <div
                    key={tot.totId}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {tot.totName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tot.totName}</p>
                        <p className="text-xs text-muted-foreground">{tot.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-sm text-primary">
                          {formatCurrency(tot.totalSales || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-secondary">
                          {formatCurrency(tot.totalCommission || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Commission</p>
                      </div>
                      <Badge variant={tot.status === 'active' ? 'success' : 'secondary'}>
                        {tot.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Local MR Summary */}
          <Card variant="forest">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-heading font-semibold flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5" />
                Local MR Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Coordinator</span>
                  <span className="font-semibold">{(localMr as LocalMR).managerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Location</span>
                  <span className="font-semibold">{(localMr as LocalMR).subcounty}, {(localMr as LocalMR).ward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Visits This Month</span>
                  <span className="font-semibold">{(visits as Visit[]).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Pending Jobs</span>
                  <span className="font-semibold text-warning-foreground">{pendingApprovals}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <TopPerformers type="tots" />
          <TopPerformers type="farmers" />
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
