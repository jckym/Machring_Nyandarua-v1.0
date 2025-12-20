import { apiClient, ApiResponse } from '../client';
import { DashboardStats, TOTPerformance } from '@/types';

export interface AdminStats {
  totalFarmers: number;
  totalSales: number;
  totalMRs: number;
  totalTots: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeTots: number;
  completedMechanisation: number;
}

export interface ManagerStats {
  totalFarmers: number;
  totalTots: number;
  totalSales: number;
  totalRevenue: number;
  totalVisits: number;
  totalTrainings: number;
  pendingApprovals: number;
  pendingMechanisation: number;
}

export interface TotStats {
  totalFarmers: number;
  totalSales: number;
  totalRevenue: number;
  mechanisationJobs: number;
  visitsCompleted: number;
  trainingsHeld: number;
  totalCommission: number;
  pendingSync?: number;
}

export const dashboardService = {
  // Get admin dashboard stats
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    const response = await apiClient.get<ApiResponse<AdminStats>>('/dashboard/admin');
    return response.data;
  },

  // Get manager dashboard stats
  async getManagerStats(localMrId: string): Promise<ApiResponse<ManagerStats>> {
    const response = await apiClient.get<ApiResponse<ManagerStats>>(`/dashboard/manager/${localMrId}`);
    return response.data;
  },

  // Get TOT dashboard stats
  async getTotStats(totId: string): Promise<ApiResponse<TotStats>> {
    const response = await apiClient.get<ApiResponse<TotStats>>(`/dashboard/tot/${totId}`);
    return response.data;
  },

  // Get TOT performance
  async getTotPerformance(totId: string): Promise<ApiResponse<TOTPerformance>> {
    const response = await apiClient.get<ApiResponse<TOTPerformance>>(`/dashboard/tot/${totId}/performance`);
    return response.data;
  },

  // Get all TOTs performance for a Local MR
  async getLocalMRPerformance(localMrId: string): Promise<ApiResponse<TOTPerformance[]>> {
    const response = await apiClient.get<ApiResponse<TOTPerformance[]>>(`/dashboard/mr/${localMrId}/tots`);
    return response.data;
  },

  // Get Local MR commission summary
  async getLocalMRCommissionSummary(localMrId: string): Promise<ApiResponse<{
    localMrId: string;
    localMrName: string;
    managerName: string;
    totalTots: number;
    activeTots: number;
    totalSales: number;
    totalCommission: number;
    totalMechanisationJobs: number;
    totalTrainings: number;
    totalVisits: number;
    tots: TOTPerformance[];
  }>> {
    const response = await apiClient.get<ApiResponse<{
      localMrId: string;
      localMrName: string;
      managerName: string;
      totalTots: number;
      activeTots: number;
      totalSales: number;
      totalCommission: number;
      totalMechanisationJobs: number;
      totalTrainings: number;
      totalVisits: number;
      tots: TOTPerformance[];
    }>>(`/dashboard/mr/${localMrId}/commission`);
    return response.data;
  },

  // Get monthly sales data for charts
  async getMonthlySalesData(params?: { localMrId?: string; totId?: string; year?: number }): Promise<ApiResponse<Array<{
    month: string;
    value: number;
    count: number;
  }>>> {
    const query = new URLSearchParams();
    if (params?.localMrId) query.append('localMrId', params.localMrId);
    if (params?.totId) query.append('totId', params.totId);
    if (params?.year) query.append('year', String(params.year));
    const queryStr = query.toString();
    const response = await apiClient.get<ApiResponse<Array<{
      month: string;
      value: number;
      count: number;
    }>>>(`/dashboard/sales/monthly${queryStr ? `?${queryStr}` : ''}`);
    return response.data;
  },

  // Get product performance data for charts
  async getProductPerformance(localMrId?: string): Promise<ApiResponse<Array<{
    name: string;
    value: number;
    productId: string;
  }>>> {
    const query = localMrId ? `?localMrId=${localMrId}` : '';
    const response = await apiClient.get<ApiResponse<Array<{
      name: string;
      value: number;
      productId: string;
    }>>>(`/dashboard/products/performance${query}`);
    return response.data;
  },
};
