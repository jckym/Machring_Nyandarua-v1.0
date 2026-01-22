import { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw, Lightbulb, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InsightsData {
  summary: string;
  trend: 'up' | 'down' | 'stable';
  insights: string[];
  recommendations: string[];
  alerts: string[];
}

interface InsightsResponse {
  success?: boolean;
  error?: string;
  fallback?: boolean;
  data: InsightsData;
  context?: {
    totalSales: number;
    totalRevenue: number;
    revenueChange: string;
  };
}

async function fetchInsights(): Promise<InsightsResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sales-insights`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok && response.status !== 429) {
    throw new Error('Failed to fetch insights');
  }

  return response.json();
}

export function AIInsights() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: fetchInsights,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Insights refreshed');
    } catch {
      toast.error('Failed to refresh insights');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-success" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      default:
        return <Minus className="w-5 h-5 text-warning" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'up':
        return <Badge variant="success">Trending Up</Badge>;
      case 'down':
        return <Badge variant="destructive">Trending Down</Badge>;
      default:
        return <Badge variant="outline">Stable</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card variant="elevated" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm text-muted-foreground">
            Unable to load AI insights. Click refresh to try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const insights = data.data;

  return (
    <Card variant="elevated" className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Sales Insights</CardTitle>
              {data.fallback && (
                <p className="text-xs text-muted-foreground">Basic analysis mode</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getTrendBadge(insights.trend)}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Summary with trend */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
          {getTrendIcon(insights.trend)}
          <p className="text-sm text-foreground leading-relaxed">{insights.summary}</p>
        </div>

        {/* Context stats if available */}
        {data.context && (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-primary">{data.context.totalSales}</p>
              <p className="text-xs text-muted-foreground">Sales</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-primary">
                {(data.context.totalRevenue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className={`text-lg font-bold ${
                parseFloat(data.context.revenueChange) > 0 ? 'text-success' : 
                parseFloat(data.context.revenueChange) < 0 ? 'text-destructive' : 'text-warning'
              }`}>
                {data.context.revenueChange}%
              </p>
              <p className="text-xs text-muted-foreground">Change</p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {insights.alerts && insights.alerts.length > 0 && (
          <div className="space-y-2">
            {insights.alerts.map((alert, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-sm"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        )}

        {/* Key Insights */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Key Insights
          </h4>
          <ul className="space-y-1.5">
            {insights.insights?.map((insight, i) => (
              <li 
                key={i}
                className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recommendations</h4>
          <ul className="space-y-1.5">
            {insights.recommendations?.map((rec, i) => (
              <li 
                key={i}
                className="flex items-start gap-2 text-sm p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 font-medium">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
