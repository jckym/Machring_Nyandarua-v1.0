import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ShoppingCart, Tractor, GraduationCap, TrendingUp, MapPin } from 'lucide-react';
import { useFarmers, useSales, useMechanisationJobs, useTrainings } from '@/hooks/api';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductChart } from '@/components/dashboard/ProductChart';

export function CoordinatorDashboard() {
  const { user } = useAuth();
  
  // Fetch data scoped to the coordinator's Local MR
  const { data: farmers = [], isLoading: farmersLoading } = useFarmers({ 
    localMrId: user?.localMrId 
  });
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: jobs = [], isLoading: jobsLoading } = useMechanisationJobs();
  const { data: trainings = [], isLoading: trainingsLoading } = useTrainings();

  const isLoading = farmersLoading || salesLoading || jobsLoading || trainingsLoading;

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  // Filter data to this coordinator's Local MR
  const localMrSales = sales.filter(s => s.localMrId === user?.localMrId);
  const localMrJobs = jobs.filter(j => j.localMrId === user?.localMrId);
  const localMrTrainings = trainings.filter(t => t.localMrId === user?.localMrId);

  const totalRevenue = localMrSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalCommission = localMrSales.reduce((acc, sale) => acc + sale.commissionAmount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Local MR Dashboard
          </h1>
          <p className="text-muted-foreground">
            Read-only overview for {user?.localMrName || 'Your Local MR'}
          </p>
        </div>
        <Badge variant="wheat" className="w-fit">Coordinator View (Read-Only)</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4" variant="forest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{farmers.length}</p>
              <p className="text-sm opacity-80">Farmers</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-primary">{localMrSales.length}</p>
              <p className="text-sm text-muted-foreground">Sales</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Tractor className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-secondary">{localMrJobs.length}</p>
              <p className="text-sm text-muted-foreground">Bookings</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-accent-foreground">{localMrTrainings.length}</p>
              <p className="text-sm text-muted-foreground">Trainings</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold font-heading text-emerald-600">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission (Read-Only)</p>
              <p className="text-xl font-bold font-heading text-amber-600">{formatCurrency(totalCommission)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductChart />
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            This is a read-only dashboard. All data modifications must be performed by the Admin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
