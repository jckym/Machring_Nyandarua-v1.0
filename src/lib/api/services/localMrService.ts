import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { LocalMR } from '@/types';

export interface CreateLocalMRDto {
  name: string;
  code: string;
  subcounty: string;
  ward: string;
  managerId: string;
}

export interface UpdateLocalMRDto {
  name?: string;
  code?: string;
  subcounty?: string;
  ward?: string;
  managerId?: string;
}

export interface LocalMRFilters {
  subcounty?: string;
  ward?: string;
  managerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LocalMRStats {
  totalTots: number;
  totalFarmers: number;
  totalSales: number;
  totalRevenue: number;
  totalMechanisationJobs: number;
  totalTrainings: number;
  totalVisits: number;
}

export const localMrService = {
  // Get all Local MRs with optional filters
  async getAll(filters?: LocalMRFilters): Promise<ApiResponse<LocalMR[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<LocalMR[]>>(`/mrs${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single Local MR by ID
  async getById(id: string): Promise<ApiResponse<LocalMR>> {
    const response = await apiClient.get<ApiResponse<LocalMR>>(`/mrs/${id}`);
    return response.data;
  },

  // Create new Local MR
  async create(data: CreateLocalMRDto): Promise<ApiResponse<LocalMR>> {
    const response = await apiClient.post<ApiResponse<LocalMR>>('/mrs', data);
    return response.data;
  },

  // Update Local MR
  async update(id: string, data: UpdateLocalMRDto): Promise<ApiResponse<LocalMR>> {
    const response = await apiClient.put<ApiResponse<LocalMR>>(`/mrs/${id}`, data);
    return response.data;
  },

  // Delete Local MR
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/mrs/${id}`);
    return response.data;
  },

  // Get Local MR statistics
  async getStats(id: string): Promise<ApiResponse<LocalMRStats>> {
    const response = await apiClient.get<ApiResponse<LocalMRStats>>(`/mrs/${id}/stats`);
    return response.data;
  },

  // Get commission summary for Local MR
  async getCommissionSummary(id: string): Promise<ApiResponse<{
    localMrId: string;
    localMrName: string;
    totalSales: number;
    totalCommission: number;
    totPerformance: Array<{
      totId: string;
      totName: string;
      sales: number;
      commission: number;
    }>;
  }>> {
    const response = await apiClient.get<ApiResponse<{
      localMrId: string;
      localMrName: string;
      totalSales: number;
      totalCommission: number;
      totPerformance: Array<{
        totId: string;
        totName: string;
        sales: number;
        commission: number;
      }>;
    }>>(`/mrs/${id}/commission`);
    return response.data;
  },
};
