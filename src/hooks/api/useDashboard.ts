// src/hooks/api/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api';

export const dashboardKeys = {
  admin: ['dashboard', 'admin'] as const,
  manager: (localMrId: string) => ['dashboard', 'manager', localMrId] as const,
  tot: (totId: string) => ['dashboard', 'tot', totId] as const,
  // Add others as needed
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin,
    queryFn: () => dashboardService.getAdminStats(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useManagerDashboard(localMrId: string) {
  return useQuery({
    queryKey: dashboardKeys.manager(localMrId),
    queryFn: () => dashboardService.getManagerStats(localMrId),
    enabled: !!localMrId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTotDashboard(totId: string) {
  return useQuery({
    queryKey: dashboardKeys.tot(totId),
    queryFn: () => dashboardService.getTotStats(totId),
    enabled: !!totId,
    staleTime: 1000 * 60 * 5,
  });
}

// Add other real hooks here as you need them...
