// src/components/SalesChart.tsx
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import api from '@/services/api'; // Your authenticated Axios instance

interface MonthlyData {
  month: string; // e.g., "Jan", "Feb"
  sales: number; // in KES (full amount)
  mechanisation: number; // in KES
}

export function SalesChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  useEffect(() => {
    const fetchRevenueTrends = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch last 6-12 months of revenue data grouped by month
        const { data: response } = await api.get<MonthlyData[]>('/api/analytics/revenue-trends');

        // Sort by month order if needed (assuming backend returns in order)
        const sortedData = response.sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months.indexOf(a.month) - months.indexOf(b.month);
        });

        setData(sortedData.length > 0 ? sortedData : []);
      } catch (err: any) {
        console.error('Failed to fetch revenue trends:', err);
        setError('Failed to load revenue data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueTrends();
  }, []);

  // Loading State
  if (loading) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Sales & Mechanisation Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading revenue trends...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error or Empty State
  if (error || data.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Sales & Mechanisation Revenue</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500 opacity-80" />
          <p className="text-sm text-muted-foreground">
            {error || 'No revenue data available yet'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Sales and mechanisation revenue will appear here once transactions are recorded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Sales & Mechanisation Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 55%, 20%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 55%, 20%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mechGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(42, 85%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(42, 85%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 15%, 85%)" />
              <XAxis
                dataKey="month"
                stroke="hsl(150, 20%, 40%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(150, 20%, 40%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{
                  backgroundColor: 'hsl(40, 30%, 98%)',
                  border: '1px solid hsl(120, 15%, 85%)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(160, 55%, 20%)"
                strokeWidth={2}
                fill="url(#salesGradient)"
                name="Sales"
              />
              <Area
                type="monotone"
                dataKey="mechanisation"
                stroke="hsl(42, 85%, 55%)"
                strokeWidth={2}
                fill="url(#mechGradient)"
                name="Mechanisation"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(160,55%,20%)]" />
            <span className="text-sm text-muted-foreground">Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(42,85%,55%)]" />
            <span className="text-sm text-muted-foreground">Mechanisation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
