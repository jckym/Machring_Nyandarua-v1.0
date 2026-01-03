// src/pages/dashboard/ManagerDashboard.tsx
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

import { 
  useSupabaseAdminStats,
  useSupabaseLocalMRs,
  useSupabaseFarmers,
  useSupabaseSales,
  useSupabaseMechanisation,
  useSupabaseTrainings,
  useSupabaseUsers,
} from '@/hooks/api/useSupabaseDashboard';
import { useDashboardRealtime, useFarmersRealtime, useMechanisationRealtime } from '@/hooks/api/useDashboardRealtime';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ManagerDashboard() {
  // Enable realtime updates
  useDashboardRealtime();
  useFarmersRealtime();
  useMechanisationRealtime();

  // Fetch organization-wide data using Supabase hooks
  const { data: stats, isLoading: statsLoading } = useSupabaseAdminStats();
  const { data: localMRs = [], isLoading: localMRsLoading } = useSupabaseLocalMRs();
  const { data: farmers = [], isLoading: farmersLoading } = useSupabaseFarmers();
  const { data: sales = [], isLoading: salesLoading } = useSupabaseSales();
  const { data: jobs = [], isLoading: jobsLoading } = useSupabaseMechanisation();
  const { data: trainings = [], isLoading: trainingsLoading } = useSupabaseTrainings();
  const { data: users = [], isLoading: usersLoading } = useSupabaseUsers();

  // Count TOTs from users
  const totalTots = users.filter((u: any) => u.role === 'tot').length;
  const activeTots = users.filter((u: any) => u.role === 'tot' && u.status === 'active').length;

  // Derived stats
  const totalRevenue = sales.reduce((acc: number, s: any) => acc + (Number(s.total_amount) || 0), 0);
  const completedJobs = jobs.filter((j: any) => j.status === 'completed').length;
  const pendingApprovals = jobs.filter((j: any) => j.status === 'pending').length;

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

  // Transform data for components that expect specific shapes
  const localMRsForTable = localMRs.map((mr: any) => ({
    id: mr.id,
    name: mr.name,
    code: mr.code,
    region: mr.region,
    county: mr.county,
    subcounty: mr.sub_county,
    ward: mr.ward,
    status: mr.status,
    totalTots: mr.totalTots,
    totalFarmers: mr.totalFarmers,
    managerName: mr.coordinatorName,
  }));

  const salesForTable = sales.map((s: any) => ({
    id: s.id,
    localMrId: s.local_mr_id,
    total: Number(s.total_amount) || 0,
    status: s.payment_status,
    date: s.sale_date,
  }));

  const jobsForTable = jobs.map((j: any) => ({
    id: j.id,
    localMrId: j.local_mr_id,
    status: j.status,
    scheduledDate: j.scheduled_date,
  }));

  const farmersForTable = farmers.map((f: any) => ({
    id: f.id,
    name: f.name,
    localMrId: f.local_mr_id,
    status: f.status,
  }));

  const totsForOverview = users
    .filter((u: any) => u.role === 'tot')
    .map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      status: u.status,
      createdAt: u.created_at || new Date().toISOString(),
    }));

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
            {localMRs.length} Local MRs
          </Badge>
          {pendingApprovals > 0 && (
            <Badge variant="warning" className="text-sm py-1 px-3">
              {pendingApprovals} Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid - Organization-wide KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatCard
          title="Total Farmers"
          value={farmers.length}
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
          value={sales.length}
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
          value={trainings.length}
          subtitle="Sessions held"
          icon={GraduationCap}
          variant="earth"
        />
      </div>

      {/* Local MR Performance Table - Key for Manager oversight */}
      <LocalMRPerformanceTable 
        localMRs={localMRsForTable as any}
        sales={salesForTable as any}
        jobs={jobsForTable as any}
        farmers={farmersForTable as any}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SalesChart />
          <TOTPerformanceOverview 
            tots={totsForOverview}
            localMRs={localMRsForTable as any}
            sales={salesForTable as any}
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
