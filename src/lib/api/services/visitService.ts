import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { Visit } from '@/types';

export interface CreateVisitDto {
  farmerId: string;
  date: string;
  purpose: string;
  notes: string;
  gpsLocation?: { lat: number; lng: number };
  images?: string[];
}

export interface UpdateVisitDto {
  purpose?: string;
  notes?: string;
  images?: string[];
}

export interface VisitFilters {
  farmerId?: string;
  totId?: string;
  localMrId?: string;
  startDate?: string;
  endDate?: string;
  purpose?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const visitService = {
  // Get all visits with optional filters
  async getAll(filters?: VisitFilters): Promise<ApiResponse<Visit[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<Visit[]>>(`/visits${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single visit by ID
  async getById(id: string): Promise<ApiResponse<Visit>> {
    const response = await apiClient.get<ApiResponse<Visit>>(`/visits/${id}`);
    return response.data;
  },

  // Create new visit
  async create(data: CreateVisitDto): Promise<ApiResponse<Visit>> {
    const response = await apiClient.post<ApiResponse<Visit>>('/visits', data);
    return response.data;
  },

  // Update visit
  async update(id: string, data: UpdateVisitDto): Promise<ApiResponse<Visit>> {
    const response = await apiClient.put<ApiResponse<Visit>>(`/visits/${id}`, data);
    return response.data;
  },

  // Delete visit
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/visits/${id}`);
    return response.data;
  },

  // Get visits by TOT
  async getByTot(totId: string): Promise<ApiResponse<Visit[]>> {
    return this.getAll({ totId });
  },

  // Get visits by farmer
  async getByFarmer(farmerId: string): Promise<ApiResponse<Visit[]>> {
    return this.getAll({ farmerId });
  },

  // Upload visit images
  async uploadImages(visitId: string, images: File[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });
    const response = await apiClient.post<ApiResponse<string[]>>(`/visits/${visitId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
