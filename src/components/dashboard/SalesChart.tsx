import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMonthlyData } from '@/data/mockData';

export function SalesChart() {
  const data = getMonthlyData();

  const formatCurrency = (value: number) => {
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

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
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Mechanisation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
