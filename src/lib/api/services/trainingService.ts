import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { Training, TrainingStatus } from '@/types';

export interface CreateTrainingDto {
  title: string;
  type?: string;
  date: string;
  location: string;
  duration: number;
  topics: string[];
  attendees?: string[];
}

export interface UpdateTrainingDto {
  title?: string;
  type?: string;
  date?: string;
  location?: string;
  duration?: number;
  topics?: string[];
  status?: TrainingStatus;
  images?: string[];
}

export interface TrainingFilters {
  trainerId?: string;
  localMrId?: string;
  status?: TrainingStatus;
  startDate?: string;
  endDate?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const trainingService = {
  // Get all trainings with optional filters
  async getAll(filters?: TrainingFilters): Promise<ApiResponse<Training[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<Training[]>>(`/trainings${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single training by ID
  async getById(id: string): Promise<ApiResponse<Training>> {
    const response = await apiClient.get<ApiResponse<Training>>(`/trainings/${id}`);
    return response.data;
  },

  // Create new training
  async create(data: CreateTrainingDto): Promise<ApiResponse<Training>> {
    const response = await apiClient.post<ApiResponse<Training>>('/trainings', data);
    return response.data;
  },

  // Update training
  async update(id: string, data: UpdateTrainingDto): Promise<ApiResponse<Training>> {
    const response = await apiClient.put<ApiResponse<Training>>(`/trainings/${id}`, data);
    return response.data;
  },

  // Delete training
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/trainings/${id}`);
    return response.data;
  },

  // Add attendees to training
  async addAttendees(id: string, farmerIds: string[]): Promise<ApiResponse<Training>> {
    const response = await apiClient.post<ApiResponse<Training>>(`/trainings/${id}/attendees`, { farmerIds });
    return response.data;
  },

  // Remove attendee from training
  async removeAttendee(id: string, farmerId: string): Promise<ApiResponse<Training>> {
    const response = await apiClient.delete<ApiResponse<Training>>(`/trainings/${id}/attendees/${farmerId}`);
    return response.data;
  },

  // Mark training as completed
  async complete(id: string): Promise<ApiResponse<Training>> {
    const response = await apiClient.post<ApiResponse<Training>>(`/trainings/${id}/complete`);
    return response.data;
  },

  // Get trainings by trainer (TOT)
  async getByTrainer(trainerId: string): Promise<ApiResponse<Training[]>> {
    return this.getAll({ trainerId });
  },

  // Upload training images
  async uploadImages(trainingId: string, images: File[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });
    const response = await apiClient.post<ApiResponse<string[]>>(`/trainings/${trainingId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
