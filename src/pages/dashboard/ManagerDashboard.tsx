import { Users, ShoppingCart, Tractor, Building2, GraduationCap, TrendingUp, UserCheck } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductChart } from '@/components/dashboard/ProductChart';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { getManagerStats } from '@/data/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTots } from '@/data/mockData';

export function ManagerDashboard() {
  const stats = getManagerStats();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `KES ${(value / 1000000).toFixed(1)}M`;
    }
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Branch Dashboard</h1>
          <p className="text-muted-foreground">Nakuru Central Branch Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="forest" className="text-sm py-1 px-3">
            <Building2 className="w-4 h-4 mr-1" />
            12 TOTs Active
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatCard
          title="Total Farmers"
          value={stats.totalFarmers}
          subtitle="Across all TOTs"
          icon={Users}
          trend={{ value: 18, isPositive: true }}
          variant="forest"
        />
        <StatCard
          title="Active TOTs"
          value={12}
          subtitle="In your branch"
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          subtitle="This month"
          icon={ShoppingCart}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Branch revenue"
          icon={TrendingUp}
          variant="wheat"
        />
        <StatCard
          title="Mechanisation"
          value={stats.mechanisationJobs}
          subtitle="Jobs completed"
          icon={Tractor}
          trend={{ value: 22, isPositive: true }}
        />
        <StatCard
          title="Trainings"
          value={stats.trainingsHeld}
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
          
          {/* TOT Overview Card */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">TOT Team Overview</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTots.map((tot, index) => (
                  <div 
                    key={tot.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {tot.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tot.name}</p>
                        <p className="text-xs text-muted-foreground">{tot.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-primary">28 farmers</p>
                      <p className="text-xs text-muted-foreground">12 sales this week</p>
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
