export function TotDashboard() {
  const stats = getTotStats();

  const formatCurrency = (value: number) => {
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">TOT Dashboard</h1>
          <p className="text-muted-foreground">Track your field operations and performance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatCard
          title="My Farmers"
          value={stats.totalFarmers}
          subtitle="Registered farmers"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="forest"
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          subtitle="This month"
          icon={ShoppingCart}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Sales revenue"
          icon={TrendingUp}
          variant="wheat"
        />
        <StatCard
          title="Mechanisation"
          value={stats.mechanisationJobs}
          subtitle="Jobs booked"
          icon={Tractor}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Farm Visits"
          value={stats.visitsCompleted}
          subtitle="Completed"
          icon={MapPin}
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
        </div>

        {/* Side Column */}
        <div className="flex flex-col space-y-6">
          {/* QuickActions and ProductChart will now stretch */}
          <div className="w-full">
            <QuickActions />
          </div>
          <div className="w-full">
            <ProductChart />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
      </div>
    </div>
  );
}
