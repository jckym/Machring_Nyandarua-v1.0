import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api';

export const dashboardKeys = {
  admin: () => ['dashboard', 'admin'] as const,
  manager: (localMrId: string) => ['dashboard', 'manager', localMrId] as const,
  tot: (totId: string) => ['dashboard', 'tot', totId] as const,
  totPerformance: (totId: string) => ['dashboard', 'tot', totId, 'performance'] as const,
  localMrPerformance: (localMrId: string) => ['dashboard', 'mr', localMrId, 'tots'] as const,
  localMrCommission: (localMrId: string) => ['dashboard', 'mr', localMrId, 'commission'] as const,
  monthlySales: (params?: { localMrId?: string; totId?: string; year?: number }) => 
    ['dashboard', 'sales', 'monthly', params] as const,
  productPerformance: (localMrId?: string) => ['dashboard', 'products', 'performance', localMrId] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: () => dashboardService.getAdminStats(),
  });
}

export function useManagerDashboard(localMrId: string) {
  return useQuery({
    queryKey: dashboardKeys.manager(localMrId),
    queryFn: () => dashboardService.getManagerStats(localMrId),
    enabled: !!localMrId,
  });
}

export function useTotDashboard(totId: string) {
  return useQuery({
    queryKey: dashboardKeys.tot(totId),
    queryFn: () => dashboardService.getTotStats(totId),
    enabled: !!totId,
  });
}

export function useTotPerformance(totId: string) {
  return useQuery({
    queryKey: dashboardKeys.totPerformance(totId),
    queryFn: () => dashboardService.getTotPerformance(totId),
    enabled: !!totId,
  });
}

export function useLocalMRTotPerformance(localMrId: string) {
  return useQuery({
    queryKey: dashboardKeys.localMrPerformance(localMrId),
    queryFn: () => dashboardService.getLocalMRPerformance(localMrId),
    enabled: !!localMrId,
  });
}

export function useLocalMRCommissionSummary(localMrId: string) {
  return useQuery({
    queryKey: dashboardKeys.localMrCommission(localMrId),
    queryFn: () => dashboardService.getLocalMRCommissionSummary(localMrId),
    enabled: !!localMrId,
  });
}

export function useMonthlySalesData(params?: { localMrId?: string; totId?: string; year?: number }) {
  return useQuery({
    queryKey: dashboardKeys.monthlySales(params),
    queryFn: () => dashboardService.getMonthlySalesData(params),
  });
}

export function useProductPerformanceData(localMrId?: string) {
  return useQuery({
    queryKey: dashboardKeys.productPerformance(localMrId),
    queryFn: () => dashboardService.getProductPerformance(localMrId),
  });
}
