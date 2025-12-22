// src/hooks/api/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api';

export const dashboardKeys = {
  // Core stats
  admin: () => ['dashboard', 'admin'] as const,
  manager: (localMrId: string) => ['dashboard', 'manager', localMrId] as const,
  tot: (totId: string) => ['dashboard', 'tot', totId] as const,

  // Additional data
  monthlySales: (params?: { localMrId?: string; totId?: string; year?: number }) =>
    ['dashboard', 'sales', 'monthly', params] as const,
  productPerformance: (localMrId?: string) =>
    ['dashboard', 'products', 'performance', localMrId] as const,
  topPerformers: (type: 'tots' | 'farmers', localMrId?: string) =>
    ['dashboard', 'top-performers', type, localMrId] as const,
};

/**
 * Admin Dashboard - Organization-wide stats
 */
export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: () => dashboardService.getAdminStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes - changes slowly
    cacheTime: 1000 * 60 * 30,
  });
}

/**
 * Manager Dashboard - Local MR scoped
 */
export function useManagerDashboard(localMrId: string) {
  return useQuery({
    queryKey: dashboardKeys.manager(localMrId),
    queryFn: () => dashboardService.getManagerStats(localMrId),
    enabled: !!localMrId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * TOT Dashboard - Personal stats
 */
export function useTotDashboard(totId: string) {
  return useQuery({
    queryKey: dashboardKeys.tot(totId),
    queryFn: () => dashboardService.getTotStats(totId),
    enabled: !!totId,
    staleTime: 1000 * 60 * 3, // 3 minutes - more frequent
  });
}

/**
 * Monthly sales trend data
 */
export function useMonthlySalesData(params?: { localMrId?: string; totId?: string; year?: number }) {
  return useQuery({
    queryKey: dashboardKeys.monthlySales(params),
    queryFn: () => dashboardService.getMonthlySalesData(params),
    staleTime: 1000 * 60 * 15,
  });
}

/**
 * Product performance (top selling)
 */
export function useProductPerformance(localMrId?: string) {
  return useQuery({
    queryKey: dashboardKeys.productPerformance(localMrId),
    queryFn: () => dashboardService.getProductPerformance(localMrId),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Top performers (TOTs or Farmers)
 */
export function useTopPerformers(
  type: 'tots' | 'farmers',
  localMrId?: string
) {
  return useQuery({
    queryKey: dashboardKeys.topPerformers(type, localMrId),
    queryFn: () => dashboardService.getTopPerformers(type, localMrId),
    staleTime: 1000 * 60 * 8,
  });
}
