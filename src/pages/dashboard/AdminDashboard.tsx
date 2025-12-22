// src/pages/dashboard/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { 
  Users, ShoppingCart, Tractor, Building2, 
  GraduationCap, TrendingUp, UserCog, Package 
} from 'lucide-react';

import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductChart } from '@/components/dashboard/ProductChart';
import { TopPerformers } from '@/components/dashboard/TopPerformers';

import { useAdminDashboard, AdminStats } from '@/hooks/api/useDashboard';
import { useMechanisationJobs, useTrainings, useLocalMRs } from '@/hooks/api';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { LocalMR, MechanisationJob, Training } from '@/types';

export function AdminDashboard() {
  const { data: statsResponse, isLoading: statsLoading, error: statsError } = useAdminDashboard();
  
  // API hooks - data is already normalized by select transforms
  const { data: mechanisationJobs = [] } = useMechanisationJobs();
  const { data: trainings = [] } = useTrainings();
  const { data: localMRs = [] } = useLocalMRs();

  const [barData, setBarData] = useState<any[]>([]);
  const [topMRs, setTopMRs] = useState<LocalMR[]>([]);

  // Unwrap stats from ApiResponse
  const stats: AdminStats | undefined = statsResponse?.data;

  useEffect(() => {
    if ((localMRs as LocalMR[]).length > 0) {
      const top5 = (localMRs as LocalMR[]).slice(0, 5);
      setTopMRs(top5);

      const chartData = top5.map(mr => ({
        name: mr.name.split(' ')[0],
        farmers: mr.totalFarmers,
        tots: mr.totalTots * 10,
      }));
      setBarData(chartData);
    }
  }, [localMRs]);

  const completedJobs = (mechanisationJobs as MechanisationJob[]).filter(job => job.status === 'completed').length;
  const trainingsHeld = (trainings as Training[]).length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `KES ${(value / 1000000).toFixed(1)}M`;
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="w-16 h-16 mb-4 text-orange-500" />
        <p>Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Organisation-wide operations overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="terracotta" className="text-sm py-1 px-3">
            <Building2 className="w-4 h-4 mr-1" />
            {stats.totalMRs} Local MRs
          </Badge>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Total Farmers"
          value={stats.totalFarmers.toLocaleString()}
          subtitle="Across all Local MRs"
          icon={Users}
          trend={{ value: 25, isPositive: true }}
          variant="forest"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="This month"
          icon={TrendingUp}
          trend={{ value: 18, isPositive: true }}
          variant="wheat"
        />
        <StatCard
          title="All Sales"
          value={stats.totalSales}
          subtitle="Transactions"
          icon={ShoppingCart}
        />
        <StatCard
          title="Mechanisation"
          value={completedJobs}
          subtitle="Jobs completed"
          icon={Tractor}
          variant="earth"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold font-heading">{stats.totalMRs}</p>
            <p className="text-sm text-muted-foreground">Local MRs</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <UserCog className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold font-heading">{stats.totalTots}</p>
            <p className="text-sm text-muted-foreground">Total TOTs</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-bold font-heading">{trainingsHeld}</p>
            <p className="text-sm text-muted-foreground">Trainings</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sage flex items-center justify-center">
            <Package className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold font-heading">{stats.totalProducts || 24}</p>
            <p className="text-sm text-muted-foreground">Products</p>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          <SalesChart />

          {/* Local MR Performance Bar Chart */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Local MR Performance</CardTitle>
              <Button variant="outline" size="sm">View Details</Button>
            </CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 15%, 85%)" />
                      <XAxis dataKey="name" stroke="hsl(150, 20%, 40%)" fontSize={12} />
                      <YAxis stroke="hsl(150, 20%, 40%)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(40, 30%, 98%)',
                          border: '1px solid hsl(120, 15%, 85%)',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="farmers" fill="hsl(160, 55%, 20%)" radius={[4, 4, 0, 0]} name="Farmers" />
                      <Bar dataKey="tots" fill="hsl(42, 85%, 55%)" radius={[4, 4, 0, 0]} name="TOT Activity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No Local MR data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Local MRs Overview List */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Local MRs Overview</CardTitle>
              <Button variant="forest" size="sm">Manage MRs</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMRs.map((mr, index) => (
                  <div
                    key={mr.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {mr.code}
                      </div>
                      <div>
                        <p className="font-medium">{mr.name}</p>
                        <p className="text-sm text-muted-foreground">{mr.subcounty}, {mr.ward} • {mr.managerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-semibold text-primary">{mr.totalTots}</p>
                        <p className="text-xs text-muted-foreground">TOTs</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-accent-foreground">{mr.totalFarmers}</p>
                        <p className="text-xs text-muted-foreground">Farmers</p>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <TopPerformers type="tots" />
          <ProductChart />
          <TopPerformers type="farmers" />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
      </div>
    </div>
  );
}