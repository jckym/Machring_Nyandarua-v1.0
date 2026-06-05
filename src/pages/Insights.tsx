import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingUp, Package, Users, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

type Card = {
  score: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  metrics: Record<string, number | null>;
  datasets_used: string[];
  low_stock_items?: { name: string; stock: number; min: number; unit: string }[];
};
type InsightsResp = {
  generated_at: string;
  role: string;
  farm_health_score: number;
  farm_health_rating: Card['rating'];
  cards: {
    production: Card;
    financial: Card;
    inventory: Card;
    workforce: Card;
  };
  error?: string;
};

const ratingColor: Record<Card['rating'], string> = {
  excellent: 'text-emerald-600',
  good: 'text-blue-600',
  fair: 'text-amber-600',
  poor: 'text-destructive',
};

const formatLabel = (k: string) => k.replace(/_/g, ' ').replace(/\bkes\b/i, 'KES').replace(/\bpct\b/i, '%');
const formatValue = (k: string, v: number | null) => {
  if (v === null || v === undefined) return '—';
  if (k.includes('kes')) return `KES ${Number(v).toLocaleString()}`;
  if (k.includes('pct')) return `${v}%`;
  return Number(v).toLocaleString();
};

function MetricCard({ title, icon: Icon, card }: { title: string; icon: any; card: Card }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
        <Badge variant="outline" className={ratingColor[card.rating]}>
          {card.score} · {card.rating}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={card.score} />
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(card.metrics).map(([k, v]) => (
            <div key={k} className="p-2 rounded-md bg-muted/40">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{formatLabel(k)}</div>
              <div className="font-semibold">{formatValue(k, v)}</div>
            </div>
          ))}
        </div>
        {card.low_stock_items && card.low_stock_items.length > 0 && (
          <div className="text-xs space-y-1">
            <div className="font-semibold">Low stock</div>
            <ul className="list-disc list-inside text-muted-foreground">
              {card.low_stock_items.slice(0, 5).map((p) => (
                <li key={p.name}>{p.name} — {p.stock}/{p.min} {p.unit}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="text-[10px] text-muted-foreground italic">
          Sources: {card.datasets_used.join(', ')}
        </div>
      </CardContent>
    </Card>
  );
}

export function Insights() {
  const { data, isLoading, refetch, isFetching } = useQuery<InsightsResp>({
    queryKey: ['fia-insights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fia-insights');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> AI Insights
          </h1>
          <p className="text-sm text-muted-foreground">Farm Health Score and category breakdowns powered by FIA.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-48" /><Skeleton className="h-48" /><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
      ) : data?.error ? (
        <Card><CardContent className="py-8 text-destructive">{data.error}</CardContent></Card>
      ) : data ? (
        <>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Farm Health Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-3">
                <div className="text-6xl font-bold">{data.farm_health_score}</div>
                <div className="text-xl text-muted-foreground">/ 100</div>
                <Badge className={ratingColor[data.farm_health_rating]}>{data.farm_health_rating}</Badge>
              </div>
              <Progress value={data.farm_health_score} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Snapshot: {new Date(data.generated_at).toLocaleString()} · Average of Production, Financial, Inventory, Workforce sub-scores.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Production" icon={Activity} card={data.cards.production} />
            <MetricCard title="Financial" icon={TrendingUp} card={data.cards.financial} />
            <MetricCard title="Inventory" icon={Package} card={data.cards.inventory} />
            <MetricCard title="Workforce" icon={Users} card={data.cards.workforce} />
          </div>
        </>
      ) : null}
    </div>
  );
}

export default Insights;
