// src/pages/dashboard/ManagerDashboard.tsx
import React from 'react';
import { 
  Users, ShoppingCart, Tractor, Building2, 
  GraduationCap, TrendingUp, UserCheck, Eye 
} from 'lucide-react';

import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductChart } from '@/components/dashboard/ProductChart';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { LocalMRPerformanceTable } from '@/components/dashboard/LocalMRPerformanceTable';
import { TOTPerformanceOverview } from '@/components/dashboard/TOTPerformanceOverview';

import { useAdminDashboard } from '@/hooks/api/useDashboard';
import { useLocalMRs } from '@/hooks/api/useLocalMRs';
import { useFarmers } from '@/hooks/api/useFarmers';
import { useSales } from '@/hooks/api/useSales';
import { useMechanisationJobs } from '@/hooks/api/useMechanisation';
import { useTrainings } from '@/hooks/api/useTrainings';
import { useUsers } from '@/hooks/api/useUsers';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Farmer, Sale, MechanisationJob, Training, LocalMR } from '@/types';

export function ManagerDashboard() {
  // Fetch organization-wide data (no localMrId filter)
  const { data: adminStatsResponse, isLoading: statsLoading } = useAdminDashboard();
  const { data: localMRs = [], isLoading: localMRsLoading } = useLocalMRs();
  const { data: farmers = [], isLoading: farmersLoading } = useFarmers({});
  const { data: sales = [], isLoading: salesLoading } = useSales({});
  const { data: jobs = [], isLoading: jobsLoading } = useMechanisationJobs({});
  const { data: trainings = [], isLoading: trainingsLoading } = useTrainings({});
  const { data: users = [], isLoading: usersLoading } = useUsers();

  // Count TOTs from users
  const totalTots = users.filter(u => u.role === 'tot').length;
  const activeTots = users.filter(u => u.role === 'tot' && u.status === 'active').length;

  // Derived stats
  const totalRevenue = (sales as Sale[])
    .filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + (s.total || 0), 0);

  const completedJobs = (jobs as MechanisationJob[]).filter(j => j.status === 'completed').length;
  const pendingApprovals = (jobs as MechanisationJob[]).filter(j => j.status === 'pending-approval').length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `KES ${(value / 1000000).toFixed(1)}M`;
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  const isLoading = statsLoading || localMRsLoading || farmersLoading || salesLoading || jobsLoading || trainingsLoading || usersLoading;

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground">Organization-Wide Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            <Eye className="w-4 h-4 mr-1" />
            Read-Only View
          </Badge>
          <Badge variant="forest" className="text-sm py-1 px-3">
            <Building2 className="w-4 h-4 mr-1" />
            {(localMRs as LocalMR[]).length} Local MRs
          </Badge>
          {pendingApprovals > 0 && (
            <Badge variant="warning" className="text-sm py-1 px-3">
              {pendingApprovals} Pending Approvals
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid - Organization-wide KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatCard
          title="Total Farmers"
          value={(farmers as Farmer[]).length}
          subtitle="Across all Local MRs"
          icon={Users}
          trend={{ value: 18, isPositive: true }}
          variant="forest"
        />
        <StatCard
          title="Total TOTs"
          value={totalTots}
          subtitle={`${activeTots} active`}
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Sales"
          value={(sales as Sale[]).length}
          subtitle="Organization-wide"
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="All Local MRs"
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

      {/* Local MR Performance Table - Key for Manager oversight */}
      <LocalMRPerformanceTable 
        localMRs={localMRs as LocalMR[]}
        sales={sales as Sale[]}
        jobs={jobs as MechanisationJob[]}
        farmers={farmers as Farmer[]}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SalesChart />
          <TOTPerformanceOverview 
            tots={users.filter(u => u.role === 'tot')}
            localMRs={localMRs as LocalMR[]}
            sales={sales as Sale[]}
          />
        </div>

        {/* Side Column */}
        <div className="space-y-6">
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