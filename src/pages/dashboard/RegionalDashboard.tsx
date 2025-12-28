// src/pages/dashboard/RegionalDashboard.tsx
import React, { useState } from 'react';
import { 
  Users, ShoppingCart, Tractor, Building2, 
  GraduationCap, TrendingUp, UserCheck, Download,
  ChevronRight, MapPin, Activity
} from 'lucide-react';

import { StatCard } from '@/components/dashboard/StatCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductChart } from '@/components/dashboard/ProductChart';
import { LocalMRPerformanceTable } from '@/components/dashboard/LocalMRPerformanceTable';
import { TOTPerformanceOverview } from '@/components/dashboard/TOTPerformanceOverview';
import { MechanisationOverview } from '@/components/dashboard/MechanisationOverview';

import { useLocalMRs } from '@/hooks/api/useLocalMRs';
import { useFarmers } from '@/hooks/api/useFarmers';
import { useSales } from '@/hooks/api/useSales';
import { useMechanisationJobs } from '@/hooks/api/useMechanisation';
import { useUsers } from '@/hooks/api/useUsers';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Farmer, Sale, MechanisationJob, LocalMR, User } from '@/types';

export function RegionalDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch organisation-wide data
  const { data: localMRs = [], isLoading: mrsLoading } = useLocalMRs();
  const { data: farmers = [], isLoading: farmersLoading } = useFarmers({});
  const { data: sales = [], isLoading: salesLoading } = useSales({});
  const { data: jobs = [], isLoading: jobsLoading } = useMechanisationJobs({});
  const { data: users = [], isLoading: usersLoading } = useUsers({});

  // Filter TOTs
  const tots = (users as User[]).filter(u => u.role === 'tot');
  const activeTots = tots.filter(t => t.status === 'active').length;

  // Calculate stats
  const totalRevenue = (sales as Sale[])
    .filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + (s.total || 0), 0);

  const totalCommission = (sales as Sale[])
    .filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + (s.commissionAmount || 0), 0);

  const completedJobs = (jobs as MechanisationJob[]).filter(j => j.status === 'completed').length;
  const pendingApprovals = (jobs as MechanisationJob[]).filter(j => j.status === 'pending-approval').length;

  const activeFarmers = (farmers as Farmer[]).filter(f => f.farmerRating === 'Active').length;
  const dormantFarmers = (farmers as Farmer[]).filter(f => f.farmerRating === 'Dormant').length;

  // Find top performing Local MR
  const localMRWithSales = (localMRs as LocalMR[]).map(mr => {
    const mrSales = (sales as Sale[]).filter(s => s.localMrId === mr.id);
    const mrRevenue = mrSales.reduce((acc, s) => acc + (s.total || 0), 0);
    return { ...mr, revenue: mrRevenue };
  });
  const topMR = localMRWithSales.sort((a, b) => b.revenue - a.revenue)[0];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `KES ${(value / 1000000).toFixed(1)}M`;
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  const isLoading = mrsLoading || farmersLoading || salesLoading || jobsLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Regional Dashboard
          </h1>
          <p className="text-muted-foreground">
            Organisation-wide overview • {(localMRs as LocalMR[]).length} Local MRs
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="forest" className="text-sm py-1 px-3">
            <Building2 className="w-4 h-4 mr-1" />
            {(localMRs as LocalMR[]).length} Local MRs
          </Badge>
          <Badge className="text-sm py-1 px-3 bg-purple-500 text-white">
            <UserCheck className="w-4 h-4 mr-1" />
            {activeTots} Active TOTs
          </Badge>
          {pendingApprovals > 0 && (
            <Badge variant="warning" className="text-sm py-1 px-3">
              {pendingApprovals} Pending Approvals
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
        <StatCard
          title="Total Farmers"
          value={(farmers as Farmer[]).length}
          subtitle={`${activeFarmers} active, ${dormantFarmers} dormant`}
          icon={Users}
          variant="forest"
        />
        <StatCard
          title="Total TOTs"
          value={tots.length}
          subtitle={`${activeTots} active`}
          icon={UserCheck}
        />
        <StatCard
          title="Total Sales"
          value={(sales as Sale[]).length}
          subtitle="Organisation-wide"
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="From all sales"
          icon={TrendingUp}
          variant="wheat"
        />
        <StatCard
          title="Mechanisation"
          value={completedJobs}
          subtitle="Jobs completed"
          icon={Tractor}
        />
        <StatCard
          title="Top Local MR"
          value={topMR?.name || 'N/A'}
          subtitle={topMR ? formatCurrency(topMR.revenue) : 'No data'}
          icon={Building2}
          variant="earth"
        />
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="local-mrs">Local MRs</TabsTrigger>
          <TabsTrigger value="tots">TOT Performance</TabsTrigger>
          <TabsTrigger value="mechanisation">Mechanisation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts Column */}
            <div className="lg:col-span-2 space-y-6">
              <SalesChart />

              {/* Quick Local MR Summary */}
              <Card variant="elevated">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Local MR Performance</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('local-mrs')}
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {localMRWithSales.slice(0, 5).map((mr, index) => (
                      <div
                        key={mr.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{mr.name}</p>
                            <p className="text-xs text-muted-foreground">{mr.managerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-sm">{mr.totalTots} TOTs</p>
                            <p className="text-xs text-muted-foreground">{mr.totalFarmers} farmers</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-primary">
                              {formatCurrency(mr.revenue)}
                            </p>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              {/* Organisation Summary */}
              <Card variant="forest">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-heading font-semibold flex items-center gap-2 text-foreground">
                    <Activity className="w-5 h-5" />
                    Organisation Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-80">Total Local MRs</span>
                      <span className="font-semibold">{(localMRs as LocalMR[]).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Active TOTs</span>
                      <span className="font-semibold">{activeTots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Total Farmers</span>
                      <span className="font-semibold">{(farmers as Farmer[]).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Total Commission</span>
                      <span className="font-semibold">{formatCurrency(totalCommission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Pending Approvals</span>
                      <span className="font-semibold text-warning-foreground">{pendingApprovals}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ProductChart />

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Organisation Report (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    All Local MRs (Excel)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    TOT Performance (CSV)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Local MRs Tab */}
        <TabsContent value="local-mrs" className="mt-6">
          <LocalMRPerformanceTable 
            localMRs={localMRs as LocalMR[]} 
            sales={sales as Sale[]}
            jobs={jobs as MechanisationJob[]}
            farmers={farmers as Farmer[]}
          />
        </TabsContent>

        {/* TOTs Tab */}
        <TabsContent value="tots" className="mt-6">
          <TOTPerformanceOverview 
            tots={tots}
            localMRs={localMRs as LocalMR[]}
            sales={sales as Sale[]}
          />
        </TabsContent>

        {/* Mechanisation Tab */}
        <TabsContent value="mechanisation" className="mt-6">
          <MechanisationOverview jobs={jobs as MechanisationJob[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
