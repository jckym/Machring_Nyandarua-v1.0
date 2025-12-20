// src/hooks/api/useDashboard.ts
export function useTotDashboard(totId: string) {
  return useQuery({
    queryKey: ['dashboard', 'tot', totId],
    queryFn: () => dashboardService.getTotStats(totId),
    enabled: !!totId,
    staleTime: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}
