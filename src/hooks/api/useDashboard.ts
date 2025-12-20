import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api';
import { useApiWithFallback } from './useApiWithFallback';

// Mock data for fallback
const mockAdminStats = {
  totalFarmers: 1015,
  totalSales: 5,
  totalMRs: 10,
  totalTots: 10,
  totalRevenue: 80000,
};

const mockManagerStats = {
  totalFarmers: 215,
  totalSales: 2,
  totalMRs: 1,
  totalTots: 5,
  totalRevenue: 31000,
  totalVisits: 2,
  totalTrainings: 1,
  pendingApprovals: 1,
  activeTots: 4,
};

const mockTotStats = {
  totalFarmers: 2,
  totalSales: 2,
  totalRevenue: 31000,
  mechanisationJobs: 1,
  visitsCompleted: 2,
  trainingsHeld: 1,
  totalCommission: 1550,
};

const mockMonthlyData = [
  { month: 'Jan', value: 45000 },
  { month: 'Feb', value: 62000 },
  { month: 'Mar', value: 78000 },
  { month: 'Apr', value: 55000 },
  { month: 'May', value: 89000 },
  { month: 'Jun', value: 72000 },
];

const mockProductPerformance = [
  { name: 'Maize', value: 60 },
  { name: 'DAP', value: 50 },
  { name: 'Tractor', value: 40 },
  { name: 'Herbicide', value: 30 },
  { name: 'Dairy', value: 20 },
];

const mockLocalMRs = [
  { id: 'mr-1', name: 'Nakuru Central MR', code: 'NK-001', subcounty: 'Nakuru East', ward: 'Bahati', managerId: 'mgr-1', managerName: 'John Kamau', totalTots: 5, totalFarmers: 120 },
  { id: 'mr-2', name: 'Nyeri Highland MR', code: 'NY-001', subcounty: 'Nyeri Central', ward: 'Ruring\'u', managerId: 'mgr-2', managerName: 'Mary Wanjiku', totalTots: 4, totalFarmers: 95 },
  { id: 'mr-3', name: 'Eldoret Valley MR', code: 'EL-001', subcounty: 'Eldoret East', ward: 'Pioneer', managerId: 'mgr-3', managerName: 'Peter Kipkoech', totalTots: 6, totalFarmers: 150 },
  { id: 'mr-4', name: 'Meru Highlands MR', code: 'MR-001', subcounty: 'Meru Central', ward: 'Municipality', managerId: 'mgr-4', managerName: 'Grace Muthoni', totalTots: 3, totalFarmers: 80 },
  { id: 'mr-5', name: 'Kisumu Lakeside MR', code: 'KS-001', subcounty: 'Kisumu Central', ward: 'Milimani', managerId: 'mgr-5', managerName: 'James Odhiambo', totalTots: 5, totalFarmers: 110 },
];

const mockTotPerformance = [
  { totId: 'tot-1', totName: 'Samuel Mwangi', phone: '+254712345001', email: 'samuel@mr.ke', status: 'active' as const, localMrId: 'mr-1', localMrName: 'Nakuru Central MR', totalSales: 31000, totalCommission: 1550, mechanisationJobsCompleted: 1, trainingsConducted: 1, visitsLogged: 2 },
  { totId: 'tot-2', totName: 'Agnes Wairimu', phone: '+254712345002', email: 'agnes@mr.ke', status: 'active' as const, localMrId: 'mr-1', localMrName: 'Nakuru Central MR', totalSales: 17500, totalCommission: 875, mechanisationJobsCompleted: 0, trainingsConducted: 0, visitsLogged: 1 },
];

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
  localMrs: () => ['dashboard', 'localMrs'] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: () => dashboardService.getAdminStats(),
  });
}

export function useAdminDashboardWithFallback() {
  const query = useAdminDashboard();
  return useApiWithFallback(query, mockAdminStats);
}

export function useManagerDashboard(localMrId: string) {
  return useQuery({
    queryKey: dashboardKeys.manager(localMrId),
    queryFn: () => dashboardService.getManagerStats(localMrId),
    enabled: !!localMrId,
  });
}

export function useManagerDashboardWithFallback(localMrId: string) {
  const query = useManagerDashboard(localMrId);
  return useApiWithFallback(query, mockManagerStats);
}

export function useTotDashboard(totId: string) {
  return useQuery({
    queryKey: dashboardKeys.tot(totId),
    queryFn: () => dashboardService.getTotStats(totId),
    enabled: !!totId,
  });
}

export function useTotDashboardWithFallback(totId: string) {
  const query = useTotDashboard(totId);
  return useApiWithFallback(query, mockTotStats);
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

export function useLocalMRTotPerformanceWithFallback(localMrId: string) {
  const query = useLocalMRTotPerformance(localMrId);
  return useApiWithFallback(query, mockTotPerformance);
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

export function useMonthlySalesDataWithFallback(params?: { localMrId?: string; totId?: string; year?: number }) {
  const query = useMonthlySalesData(params);
  return useApiWithFallback(query, mockMonthlyData);
}

export function useProductPerformanceData(localMrId?: string) {
  return useQuery({
    queryKey: dashboardKeys.productPerformance(localMrId),
    queryFn: () => dashboardService.getProductPerformance(localMrId),
  });
}

export function useProductPerformanceWithFallback(localMrId?: string) {
  const query = useProductPerformanceData(localMrId);
  return useApiWithFallback(query, mockProductPerformance);
}

// Export mock data for direct use in components that need fallback
export { mockLocalMRs, mockTotPerformance, mockAdminStats, mockManagerStats, mockTotStats, mockMonthlyData, mockProductPerformance };
