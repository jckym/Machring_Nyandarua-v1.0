import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, ArrowRight, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

type Thresholds = {
  low_stock_buffer: number;
  revenue_drop_pct: number;
  overdue_followup_alert: number;
  min_active_farmer_ratio: number;
};

const DEFAULTS: Thresholds = {
  low_stock_buffer: 0,
  revenue_drop_pct: -10,
  overdue_followup_alert: 5,
  min_active_farmer_ratio: 0.6,
};

type Briefing = {
  briefing?: {
    greeting?: string;
    summary_bullets?: string[];
    recommended_actions?: { title: string; priority: 'high' | 'medium' | 'low'; rationale?: string; dataset?: string }[];
    datasets_cited?: string[];
  };
  snapshot?: {
    revenue_30d?: number;
    revenue_change_pct_vs_prior_30d?: number | null;
    low_stock?: { name: string }[];
    overdue_followups?: number;
    datasets_used?: string[];
  };
  generated_at?: string;
  error?: string;
};

function loadThresholds(): Thresholds {
  try {
    const raw = localStorage.getItem('fia-thresholds');
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

export function ExecutiveBriefing() {
  const [thresholds, setThresholds] = useState<Thresholds>(loadThresholds);

  const { data, isLoading, refetch, isFetching } = useQuery<Briefing>({
    queryKey: ['fia-briefing', thresholds],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fia-briefing', { body: { thresholds } });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const saveThresholds = (next: Thresholds) => {
    setThresholds(next);
    localStorage.setItem('fia-thresholds', JSON.stringify(next));
  };

  const b = data?.briefing;
  const s = data?.snapshot;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          FIA — Daily Executive Briefing
        </CardTitle>
        <div className="flex gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7"><Settings2 className="h-3.5 w-3.5" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 space-y-3">
              <div className="text-sm font-semibold">Alert thresholds</div>
              <div className="space-y-2 text-xs">
                <div>
                  <Label className="text-xs">Low-stock buffer (units above min)</Label>
                  <Input type="number" value={thresholds.low_stock_buffer}
                    onChange={(e) => saveThresholds({ ...thresholds, low_stock_buffer: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Revenue drop alert (%)</Label>
                  <Input type="number" value={thresholds.revenue_drop_pct}
                    onChange={(e) => saveThresholds({ ...thresholds, revenue_drop_pct: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Overdue follow-ups alert (count)</Label>
                  <Input type="number" value={thresholds.overdue_followup_alert}
                    onChange={(e) => saveThresholds({ ...thresholds, overdue_followup_alert: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Min active-farmer ratio (0-1)</Label>
                  <Input type="number" step="0.05" value={thresholds.min_active_farmer_ratio}
                    onChange={(e) => saveThresholds({ ...thresholds, min_active_farmer_ratio: Number(e.target.value) })} />
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => saveThresholds(DEFAULTS)}>Reset to defaults</Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/fia">Open FIA <ArrowRight className="h-3 w-3 ml-1" /></Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></>
        ) : data?.error ? (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{data.error}</span>
          </div>
        ) : (
          <>
            {b?.greeting && <p className="font-medium">{b.greeting}</p>}

            {s && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground">Revenue 30d</div>
                  <div className="font-semibold">KES {Number(s.revenue_30d ?? 0).toLocaleString()}</div>
                  {typeof s.revenue_change_pct_vs_prior_30d === 'number' && (
                    <div className={`flex items-center gap-0.5 text-[10px] ${s.revenue_change_pct_vs_prior_30d >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                      <TrendingUp className="h-2.5 w-2.5" /> {s.revenue_change_pct_vs_prior_30d.toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground">Low stock</div>
                  <div className="font-semibold">{s.low_stock?.length ?? 0} items</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground">Overdue follow-ups</div>
                  <div className="font-semibold">{s.overdue_followups ?? 0}</div>
                </div>
              </div>
            )}

            {b?.summary_bullets && b.summary_bullets.length > 0 && (
              <ul className="text-sm space-y-1.5 list-disc list-inside marker:text-primary">
                {b.summary_bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
              </ul>
            )}

            {b?.recommended_actions && b.recommended_actions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recommended actions</div>
                {b.recommended_actions.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-card border">
                    <Badge variant={a.priority === 'high' ? 'destructive' : a.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px] uppercase shrink-0">
                      {a.priority}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{a.title}</div>
                      {a.rationale && <div className="text-xs text-muted-foreground">{a.rationale}</div>}
                      {a.dataset && <div className="text-[10px] italic text-muted-foreground mt-0.5">from {a.dataset}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-2 text-[10px] text-muted-foreground space-y-0.5">
              {(b?.datasets_cited?.length ?? 0) > 0 && (
                <div><span className="font-semibold">Sources:</span> {b!.datasets_cited!.join(', ')}</div>
              )}
              {!b?.datasets_cited && s?.datasets_used && (
                <div><span className="font-semibold">Sources:</span> {s.datasets_used.join(', ')}</div>
              )}
              {data?.generated_at && <div>Snapshot: {new Date(data.generated_at).toLocaleString()}</div>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
