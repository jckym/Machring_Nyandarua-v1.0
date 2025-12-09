import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';

interface Performer {
  id: string;
  name: string;
  metric: string;
  value: string;
  rank: number;
}

const topTots: Performer[] = [
  { id: '1', name: 'John Kamau', metric: 'Sales', value: 'KES 485K', rank: 1 },
  { id: '2', name: 'Mary Njeri', metric: 'Farmers', value: '42 registered', rank: 2 },
  { id: '3', name: 'Peter Mwangi', metric: 'Visits', value: '58 completed', rank: 3 },
];

const topFarmers: Performer[] = [
  { id: '1', name: 'Elizabeth Chebet', metric: 'Purchases', value: 'KES 125K', rank: 1 },
  { id: '2', name: 'James Kiprotich', metric: 'Services', value: '8 bookings', rank: 2 },
  { id: '3', name: 'Agnes Wanjiru', metric: 'Training', value: '6 sessions', rank: 3 },
];

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-amber-100 text-amber-700';
    case 2:
      return 'bg-slate-100 text-slate-700';
    case 3:
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function TopPerformers({ type = 'tots' }: { type?: 'tots' | 'farmers' }) {
  const performers = type === 'tots' ? topTots : topFarmers;
  const title = type === 'tots' ? 'Top TOTs This Month' : 'Most Active Farmers';

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader className="flex flex-row items-center gap-2">
        <Trophy className="w-5 h-5 text-accent" />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performers.map((performer, index) => (
            <div 
              key={performer.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${getRankColor(performer.rank)}`}>
                {performer.rank}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{performer.name}</p>
                <p className="text-xs text-muted-foreground">{performer.metric}</p>
              </div>
              <Badge variant="forest" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {performer.value}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
