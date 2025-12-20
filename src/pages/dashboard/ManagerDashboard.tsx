import { Users, ShoppingCart, Tractor, Building2, GraduationCap, TrendingUp, UserCheck, MapPin } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductChart } from '@/components/dashboard/ProductChart';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { 
  mockTots, mockFarmers, mockSales, mockMechanisationJobs, 
  mockTrainings, mockVisits, getTOTsByLocalMR, mockLocalMRs 
} from '@/data/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export function ManagerDashboard() {
  const { user } = useAuth();
  const localMrId = user?.localMrId || 'mr-1';
  const localMr = mockLocalMRs.find(mr => mr.id === localMrId);
  
  // Get stats for the manager's Local MR
  const mrTots = mockTots.filter(t => t.localMrId === localMrId);
  const mrFarmers = mockFarmers.filter(f => f.localMrId === localMrId);
  const mrSales = mockSales.filter(s => s.localMrId === localMrId);
  const mrJobs = mockMechanisationJobs.filter(j => j.localMrId === localMrId);
  const mrTrainings = mockTrainings.filter(t => t.localMrId === localMrId);
  const mrVisits = mockVisits.filter(v => v.localMrId === localMrId);
  
  const totalRevenue = mrSales.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.total, 0);
  const completedJobs = mrJobs.filter(j => j.status === 'completed').length;
  const pendingApprovals = mrJobs.filter(j => j.status === 'pending-approval').length;
  const activeTots = mrTots.filter(t => t.status === 'active').length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `KES ${(value / 1000000).toFixed(1)}M`;
    }
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  // Get TOT performance data
  const totPerformance = getTOTsByLocalMR(localMrId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Local MR Dashboard</h1>
          <p className="text-muted-foreground">{localMr?.name || 'Local MR'} Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="forest" className="text-sm py-1 px-3">
            <Building2 className="w-4 h-4 mr-1" />
            {activeTots} TOTs Active
          </Badge>
          {pendingApprovals > 0 && (
            <Badge variant="warning" className="text-sm py-1 px-3">
              {pendingApprovals} Pending Approvals
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatCard
          title="Total Farmers"
          value={mrFarmers.length}
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
          value={mrSales.length}
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
          value={mrTrainings.length}
          subtitle="Sessions held"
          icon={GraduationCap}
          variant="earth"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          <SalesChart />
          
          {/* TOT Team Overview Card */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">TOT Team Overview</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {totPerformance.slice(0, 5).map((tot, index) => (
                  <div 
                    key={tot.totId}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {tot.totName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tot.totName}</p>
                        <p className="text-xs text-muted-foreground">{tot.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-sm text-primary">{formatCurrency(tot.totalSales)}</p>
                        <p className="text-xs text-muted-foreground">Sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-secondary">{formatCurrency(tot.totalCommission)}</p>
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
          {/* Quick Stats */}
          <Card variant="forest">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Local MR Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Manager</span>
                  <span className="font-semibold">{localMr?.managerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Subcounty</span>
                  <span className="font-semibold">{localMr?.subcounty}, {localMr?.ward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Visits This Month</span>
                  <span className="font-semibold">{mrVisits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Pending Jobs</span>
                  <span className="font-semibold text-warning">{pendingApprovals}</span>
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
