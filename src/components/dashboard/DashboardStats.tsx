// src/components/DashboardStats.tsx
import { useState, useEffect } from 'react';
import { StatCard } from './StatCard';
import { Users, ShoppingCart, Tractor, DollarSign, TrendingUp } from 'lucide-react';
import api from '@/services/api';

interface DashboardStatsData {
  totalFarmers: number;
  totalSales: number;
  totalMechanisationRevenue: number;
  activeTOTs: number;
  monthlyGrowth: number; // percentage
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<DashboardStatsData>('/api/analytics/dashboard-stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-card rounded-2xl animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-4" />
            <div className="h-10 bg-muted rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Failed to load dashboard stats. Please try again later.</p>
      </div>
    );
  }

  const formatKES = (amount: number) => `KES ${(amount / 1000).toFixed(0)}K`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Farmers"
        value={stats.totalFarmers.toLocaleString()}
        subtitle="Registered to date"
        icon={Users}
        trend={{ value: 18, isPositive: true }}
        variant="default"
      />
      <StatCard
        title="Total Sales"
        value={formatKES(stats.totalSales)}
        subtitle="This month"
        icon={ShoppingCart}
        trend={{ value: 12, isPositive: true }}
        variant="forest"
      />
      <StatCard
        title="Mechanisation Revenue"
        value={formatKES(stats.totalMechanisationRevenue)}
        subtitle="This month"
        icon={Tractor}
        trend={{ value: 8, isPositive: true }}
        variant="wheat"
      />
      <StatCard
        title="Monthly Growth"
        value={`${stats.monthlyGrowth}%`}
        subtitle="vs last month"
        icon={TrendingUp}
        trend={{ value: stats.monthlyGrowth, isPositive: stats.monthlyGrowth > 0 }}
        variant="sage"
      />
    </div>
  );
}
