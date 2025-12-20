import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { MechanisationJob, MechanisationStatus } from '@/types';

export interface CreateMechanisationDto {
  farmerId: string;
  machineryId: string;
  serviceType: 'ploughing' | 'harrowing' | 'planting' | 'harvesting' | 'spraying';
  acreage: number;
  scheduledDate: string;
  notes?: string;
  gpsLocation?: { lat: number; lng: number };
}

export interface UpdateMechanisationDto {
  scheduledDate?: string;
  acreage?: number;
  notes?: string;
  status?: MechanisationStatus;
}

export interface CompletionReportDto {
  summary: string;
  duration: string;
  outcome: string;
}

export interface MechanisationFilters {
  farmerId?: string;
  machineryId?: string;
  localMrId?: string;
  bookedBy?: string;
  status?: MechanisationStatus;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const mechanisationService = {
  // Get all jobs with optional filters
  async getAll(filters?: MechanisationFilters): Promise<ApiResponse<MechanisationJob[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<MechanisationJob[]>>(`/mechanisations${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single job by ID
  async getById(id: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.get<ApiResponse<MechanisationJob>>(`/mechanisations/${id}`);
    return response.data;
  },

  // Create new booking (creates approval request)
  async create(data: CreateMechanisationDto): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.post<ApiResponse<MechanisationJob>>('/mechanisations', data);
    return response.data;
  },

  // Update job
  async update(id: string, data: UpdateMechanisationDto): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.put<ApiResponse<MechanisationJob>>(`/mechanisations/${id}`, data);
    return response.data;
  },

  // Approve booking (manager action)
  async approve(id: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.post<ApiResponse<MechanisationJob>>(`/mechanisations/${id}/approve`);
    return response.data;
  },

  // Reject booking (manager action)
  async reject(id: string, reason: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.post<ApiResponse<MechanisationJob>>(`/mechanisations/${id}/reject`, { reason });
    return response.data;
  },

  // Mark as in-progress
  async startJob(id: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.post<ApiResponse<MechanisationJob>>(`/mechanisations/${id}/start`);
    return response.data;
  },

  // Complete job with report
  async complete(id: string, report: CompletionReportDto): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.post<ApiResponse<MechanisationJob>>(`/mechanisations/${id}/complete`, report);
    return response.data;
  },

  // Cancel job
  async cancel(id: string, reason?: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.post<ApiResponse<MechanisationJob>>(`/mechanisations/${id}/cancel`, { reason });
    return response.data;
  },

  // Reschedule job
  async reschedule(id: string, newDate: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.post<ApiResponse<MechanisationJob>>(`/mechanisations/${id}/reschedule`, { scheduledDate: newDate });
    return response.data;
  },

  // Delete job
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/mechanisations/${id}`);
    return response.data;
  },

  // Get jobs by TOT
  async getByTot(totId: string): Promise<ApiResponse<MechanisationJob[]>> {
    return this.getAll({ bookedBy: totId });
  },

  // Get pending approvals
  async getPendingApprovals(localMrId?: string): Promise<ApiResponse<MechanisationJob[]>> {
    return this.getAll({ status: 'pending-approval', localMrId });
  },
};
