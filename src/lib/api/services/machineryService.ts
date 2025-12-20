import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { Machinery, MachineryStatus } from '@/types';

export interface CreateMachineryDto {
  name: string;
  category: string;
  type?: string;
  pricePerAcre: number;
  localMrId?: string;
  description?: string;
}

export interface UpdateMachineryDto {
  name?: string;
  category?: string;
  type?: string;
  status?: MachineryStatus;
  pricePerAcre?: number;
  localMrId?: string;
  description?: string;
}

export interface MachineryFilters {
  localMrId?: string;
  category?: string;
  status?: MachineryStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export const machineryService = {
  // Get all machinery with optional filters
  async getAll(filters?: MachineryFilters): Promise<ApiResponse<Machinery[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<Machinery[]>>(`/machinery${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single machinery by ID
  async getById(id: string): Promise<ApiResponse<Machinery>> {
    const response = await apiClient.get<ApiResponse<Machinery>>(`/machinery/${id}`);
    return response.data;
  },

  // Create new machinery
  async create(data: CreateMachineryDto): Promise<ApiResponse<Machinery>> {
    const response = await apiClient.post<ApiResponse<Machinery>>('/machinery', data);
    return response.data;
  },

  // Update machinery
  async update(id: string, data: UpdateMachineryDto): Promise<ApiResponse<Machinery>> {
    const response = await apiClient.put<ApiResponse<Machinery>>(`/machinery/${id}`, data);
    return response.data;
  },

  // Update machinery status
  async updateStatus(id: string, status: MachineryStatus): Promise<ApiResponse<Machinery>> {
    const response = await apiClient.patch<ApiResponse<Machinery>>(`/machinery/${id}/status`, { status });
    return response.data;
  },

  // Delete machinery
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/machinery/${id}`);
    return response.data;
  },

  // Get available machinery
  async getAvailable(localMrId?: string): Promise<ApiResponse<Machinery[]>> {
    return this.getAll({ status: 'available', localMrId });
  },

  // Get machinery by Local MR
  async getByLocalMR(localMrId: string): Promise<ApiResponse<Machinery[]>> {
    return this.getAll({ localMrId });
  },
};
