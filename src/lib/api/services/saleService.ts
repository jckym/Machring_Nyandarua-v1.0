import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { Sale, SaleStatus } from '@/types';

export interface CreateSaleDto {
  farmerId: string;
  productId: string;
  quantity: number;
  totId?: string; // Set automatically from auth if not provided
}

export interface UpdateSaleDto {
  quantity?: number;
  status?: SaleStatus;
}

export interface SaleFilters {
  totId?: string;
  farmerId?: string;
  productId?: string;
  localMrId?: string;
  status?: SaleStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const saleService = {
  // Get all sales with optional filters
  async getAll(filters?: SaleFilters): Promise<ApiResponse<Sale[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<Sale[]>>(`/sales${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single sale by ID
  async getById(id: string): Promise<ApiResponse<Sale>> {
    const response = await apiClient.get<ApiResponse<Sale>>(`/sales/${id}`);
    return response.data;
  },

  // Create new sale
  async create(data: CreateSaleDto): Promise<ApiResponse<Sale>> {
    const response = await apiClient.post<ApiResponse<Sale>>('/sales', data);
    return response.data;
  },

  // Update sale
  async update(id: string, data: UpdateSaleDto): Promise<ApiResponse<Sale>> {
    const response = await apiClient.put<ApiResponse<Sale>>(`/sales/${id}`, data);
    return response.data;
  },

  // Complete sale (manager action)
  async complete(id: string): Promise<ApiResponse<Sale>> {
    const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${id}/complete`);
    return response.data;
  },

  // Cancel sale
  async cancel(id: string, reason?: string): Promise<ApiResponse<Sale>> {
    const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${id}/cancel`, { reason });
    return response.data;
  },

  // Delete sale
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/sales/${id}`);
    return response.data;
  },

  // Get sales by TOT
  async getByTot(totId: string): Promise<ApiResponse<Sale[]>> {
    return this.getAll({ totId });
  },

  // Get sales by farmer
  async getByFarmer(farmerId: string): Promise<ApiResponse<Sale[]>> {
    return this.getAll({ farmerId });
  },

  // Get sales statistics
  async getStats(filters?: { localMrId?: string; totId?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<{
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
    pendingCount: number;
    completedCount: number;
  }>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<{
      totalSales: number;
      totalRevenue: number;
      totalCommission: number;
      pendingCount: number;
      completedCount: number;
    }>>(`/sales/stats${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get monthly sales data for charts
  async getMonthlyData(year?: number): Promise<ApiResponse<Array<{
    month: string;
    value: number;
    count: number;
  }>>> {
    const query = year ? `?year=${year}` : '';
    const response = await apiClient.get<ApiResponse<Array<{
      month: string;
      value: number;
      count: number;
    }>>>(`/sales/monthly${query}`);
    return response.data;
  },
};
