import { Users, ShoppingCart, Tractor, Building2, GraduationCap, TrendingUp, UserCog, Package } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductChart } from '@/components/dashboard/ProductChart';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { getAdminStats, mockBranches } from '@/data/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminDashboard() {
  const stats = getAdminStats();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `KES ${(value / 1000000).toFixed(1)}M`;
    }
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  const branchData = mockBranches.map(branch => ({
    name: branch.name.split(' ')[0],
    farmers: branch.totalFarmers,
    tots: branch.totalTots * 10,
  }));

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
            3 Active Branches
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Total Farmers"
          value={stats.totalFarmers.toLocaleString()}
          subtitle="Across all branches"
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
          value={stats.mechanisationJobs}
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
            <p className="text-2xl font-bold font-heading">3</p>
            <p className="text-sm text-muted-foreground">Branches</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <UserCog className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold font-heading">30</p>
            <p className="text-sm text-muted-foreground">Total TOTs</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-bold font-heading">{stats.trainingsHeld}</p>
            <p className="text-sm text-muted-foreground">Trainings</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sage flex items-center justify-center">
            <Package className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold font-heading">24</p>
            <p className="text-sm text-muted-foreground">Products</p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          <SalesChart />
          
          {/* Branch Performance */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Branch Performance</CardTitle>
              <Button variant="outline" size="sm">View Details</Button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchData}>
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
            </CardContent>
          </Card>

          {/* Branches Overview */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Branches Overview</CardTitle>
              <Button variant="forest" size="sm">Add Branch</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockBranches.map((branch, index) => (
                  <div 
                    key={branch.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {branch.name.split(' ')[0][0]}{branch.name.split(' ')[1]?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        <p className="text-sm text-muted-foreground">{branch.county} County</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-semibold text-primary">{branch.totalTots}</p>
                        <p className="text-xs text-muted-foreground">TOTs</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-accent-foreground">{branch.totalFarmers}</p>
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
