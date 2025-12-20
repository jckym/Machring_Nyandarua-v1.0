// src/components/ProductChart.tsx
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle } from 'lucide-react';
import api from '@/services/api'; // Your existing Axios instance

interface ProductData {
  name: string;
  value: number; // percentage or count (chart uses as % share)
}

const COLORS = [
  'hsl(160, 55%, 20%)',   // Forest green
  'hsl(42, 85%, 55%)',    // Gold/yellow
  'hsl(30, 25%, 35%)',    // Brown
  'hsl(120, 20%, 75%)',   // Light green
  'hsl(15, 60%, 50%)',    // Orange-red
  'hsl(200, 70%, 50%)',   // Blue (fallback)
  'hsl(280, 60%, 50%)',   // Purple (fallback)
];

export function ProductChart() {
  const [data, setData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductPerformance = async () => {
      try {
        setLoading(true);
        setError(null);

        // Backend endpoint: Returns top products by sales share this month
        const { data: response } = await api.get<ProductData[]>('/api/analytics/product-performance');

        // Ensure data is valid and sorted
        const sortedData = response
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 7); // Limit to top 7 for clean chart

        setData(sortedData.length > 0 ? sortedData : []);
      } catch (err: any) {
        console.error('Failed to fetch product performance:', err);
        setError('Failed to load product data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductPerformance();
  }, []);

  // Loading State
  if (loading) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
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
          <CardTitle className="text-lg">Product Performance</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500 opacity-80" />
          <p className="text-sm text-muted-foreground">
            {error || 'No sales data available yet'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Product performance will appear here once sales are recorded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Product Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Sales Share']}
                contentStyle={{
                  backgroundColor: 'hsl(40, 30%, 98%)',
                  border: '1px solid hsl(120, 15%, 85%)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
