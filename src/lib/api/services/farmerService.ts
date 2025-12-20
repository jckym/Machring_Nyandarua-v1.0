import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { Farmer, ValueChain, FarmerCategory, FarmerRating } from '@/types';

export interface CreateFarmerDto {
  name: string;
  phone: string;
  email?: string;
  age?: number;
  location: {
    village: string;
    ward: string;
    subcounty: string;
    county: string;
  };
  localMrId: string;
  valueChain: ValueChain;
  farmerCategory: FarmerCategory;
  registeredBy: string;
}

export interface UpdateFarmerDto {
  name?: string;
  phone?: string;
  email?: string;
  age?: number;
  location?: {
    village?: string;
    ward?: string;
    subcounty?: string;
    county?: string;
  };
  valueChain?: ValueChain;
  farmerCategory?: FarmerCategory;
  farmerRating?: FarmerRating;
}

export interface FarmerFilters {
  localMrId?: string;
  registeredBy?: string;
  valueChain?: ValueChain;
  farmerCategory?: FarmerCategory;
  farmerRating?: FarmerRating;
  subcounty?: string;
  ward?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  search?: string;
  page?: number;
  limit?: number;
}

export const farmerService = {
  // Get all farmers with optional filters
  async getAll(filters?: FarmerFilters): Promise<ApiResponse<Farmer[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<Farmer[]>>(`/farmers${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single farmer by ID
  async getById(id: string): Promise<ApiResponse<Farmer>> {
    const response = await apiClient.get<ApiResponse<Farmer>>(`/farmers/${id}`);
    return response.data;
  },

  // Create new farmer (creates approval request if TOT)
  async create(data: CreateFarmerDto): Promise<ApiResponse<Farmer>> {
    const response = await apiClient.post<ApiResponse<Farmer>>('/farmers', data);
    return response.data;
  },

  // Update farmer (creates edit approval request if TOT)
  async update(id: string, data: UpdateFarmerDto): Promise<ApiResponse<Farmer>> {
    const response = await apiClient.put<ApiResponse<Farmer>>(`/farmers/${id}`, data);
    return response.data;
  },

  // Delete farmer (admin only)
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/farmers/${id}`);
    return response.data;
  },

  // Approve farmer (for new registrations or edits)
  async approve(id: string): Promise<ApiResponse<Farmer>> {
    const response = await apiClient.post<ApiResponse<Farmer>>(`/farmers/${id}/approve`);
    return response.data;
  },

  // Reject farmer approval
  async reject(id: string, reason: string): Promise<ApiResponse<Farmer>> {
    const response = await apiClient.post<ApiResponse<Farmer>>(`/farmers/${id}/reject`, { reason });
    return response.data;
  },

  // Get farmers by Local MR
  async getByLocalMR(localMrId: string): Promise<ApiResponse<Farmer[]>> {
    return this.getAll({ localMrId });
  },

  // Get farmers registered by TOT
  async getByTot(totId: string): Promise<ApiResponse<Farmer[]>> {
    return this.getAll({ registeredBy: totId });
  },

  // Get farmer activity summary
  async getActivitySummary(farmerId: string): Promise<ApiResponse<{
    totalPurchases: number;
    totalSpent: number;
    mechanisationCount: number;
    trainingsAttended: number;
    visitsCount: number;
  }>> {
    const response = await apiClient.get<ApiResponse<{
      totalPurchases: number;
      totalSpent: number;
      mechanisationCount: number;
      trainingsAttended: number;
      visitsCount: number;
    }>>(`/farmers/${farmerId}/activity`);
    return response.data;
  },
};
