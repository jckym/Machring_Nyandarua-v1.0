// src/lib/api/machineryService.ts
import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { Machinery, MachineryStatus } from '@/types';

/**
 * DTOs for machinery management
 */
export interface CreateMachineryDto {
  name: string;
  category: string; // e.g., "Tractor", "Combine Harvester", "Planter"
  type?: string; // e.g., "John Deere 8R", "Claas Lexion"
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

/**
 * Complete machinery management service for Machinery Ring Nyandarua
 */
export const machineryService = {
  /**
   * Get all machinery with optional filtering
   */
  async getAll(filters?: MachineryFilters): Promise<ApiResponse<Machinery[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<Machinery[]>>(
      `/machinery${query ? `?${query}` : ''}`
    );
    return response.data;
  },

  /**
   * Get single machinery item by ID
   */
  async getById(id: string): Promise<ApiResponse<Machinery>> {
    const response = await apiClient.get<ApiResponse<Machinery>>(`/machinery/${id}`);
    return response.data;
  },

  /**
   * Create new machinery (admin only)
   */
  async create(data: CreateMachineryDto): Promise<ApiResponse<Machinery>> {
    const response = await apiClient.post<ApiResponse<Machinery>>('/machinery', data);
    return response.data;
  },

  /**
   * Update machinery details (partial update)
   */
  async update(id: string, data: UpdateMachineryDto): Promise<ApiResponse<Machinery>> {
    const response = await apiClient.patch<ApiResponse<Machinery>>(`/machinery/${id}`, data);
    return response.data;
  },

  /**
   * Update machinery status only (available/booked/maintenance)
   */
  async updateStatus(id: string, status: MachineryStatus): Promise<ApiResponse<Machinery>> {
    const response = await apiClient.patch<ApiResponse<Machinery>>(
      `/machinery/${id}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * Permanently delete machinery (admin only)
   */
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/machinery/${id}`
    );
    return response.data;
  },

  /**
   * Get only available machinery (for booking form)
   */
  async getAvailable(localMrId?: string): Promise<ApiResponse<Machinery[]>> {
    return this.getAll({ status: 'available', localMrId });
  },

  /**
   * Get all machinery belonging to a specific Local MR
   */
  async getByLocalMR(localMrId: string): Promise<ApiResponse<Machinery[]>> {
    return this.getAll({ localMrId });
  },

  /**
   * Get machinery by category (e.g., "Tractor")
   */
  async getByCategory(category: string, localMrId?: string): Promise<ApiResponse<Machinery[]>> {
    return this.getAll({ category, localMrId });
  },

  /**
   * Get machinery in maintenance or booked (for admin monitoring)
   * Note: This fetches all and filters client-side since status only accepts single values
   */
  async getUnavailable(localMrId?: string): Promise<ApiResponse<Machinery[]>> {
    const response = await this.getAll({ localMrId });
    if (response.data) {
      response.data = response.data.filter(m => m.status === 'booked' || m.status === 'maintenance');
    }
    return response;
  },
};
