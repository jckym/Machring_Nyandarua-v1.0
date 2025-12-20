import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Embedded fallback data
const productPerformance = [
  { name: 'Maize Seeds', value: 35 },
  { name: 'DAP Fertilizer', value: 25 },
  { name: 'Tractor Services', value: 20 },
  { name: 'Herbicide', value: 12 },
  { name: 'Dairy Meal', value: 8 },
];

const COLORS = [
  'hsl(160, 55%, 20%)',
  'hsl(42, 85%, 55%)',
  'hsl(30, 25%, 35%)',
  'hsl(120, 20%, 75%)',
  'hsl(15, 60%, 50%)',
];

export function ProductChart() {
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
                data={productPerformance}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {productPerformance.map((entry, index) => (
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
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
