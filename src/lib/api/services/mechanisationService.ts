// src/lib/api/mechanisationService.ts
import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { MechanisationJob, MechanisationStatus } from '@/types';

/**
 * DTOs for mechanisation operations
 */
export interface CreateMechanisationDto {
  farmerId: string;
  machineryId: string;
  serviceType: 'ploughing' | 'harrowing' | 'planting' | 'harvesting' | 'spraying';
  acreage: number;
  scheduledDate: string; // ISO date string
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
  duration: string; // e.g., "4 hours"
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

/**
 * Comprehensive mechanisation service for Machinery Ring Nyandarua
 */
export const mechanisationService = {
  /**
   * Get all mechanisation jobs with optional filtering
   */
  async getAll(filters?: MechanisationFilters): Promise<ApiResponse<MechanisationJob[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<MechanisationJob[]>>(
      `/mechanisations${query ? `?${query}` : ''}`
    );
    return response.data;
  },

  /**
   * Get a single mechanisation job by ID
   */
  async getById(id: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.get<ApiResponse<MechanisationJob>>(`/mechanisations/${id}`);
    return response.data;
  },

  /**
   * Create a new mechanisation booking (automatically creates approval request)
   */
  async create(data: CreateMechanisationDto): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.post<ApiResponse<MechanisationJob>>('/mechanisations', data);
    return response.data;
  },

  /**
   * Update job details (e.g., reschedule, change notes)
   */
  async update(id: string, data: UpdateMechanisationDto): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.patch<ApiResponse<MechanisationJob>>(`/mechanisations/${id}`, data);
    return response.data;
  },

  /**
   * Approve a pending booking (manager/admin only)
   */
  async approve(id: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.patch<ApiResponse<MechanisationJob>>(`/mechanisations/${id}/approve`);
    return response.data;
  },

  /**
   * Reject a booking with reason
   */
  async reject(id: string, reason?: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.patch<ApiResponse<MechanisationJob>>(
      `/mechanisations/${id}/reject`,
      reason ? { reason } : undefined
    );
    return response.data;
  },

  /**
   * Start a job (mark as in-progress)
   */
  async startJob(id: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.patch<ApiResponse<MechanisationJob>>(`/mechanisations/${id}/start`);
    return response.data;
  },

  /**
   * Complete job with final report
   */
  async complete(id: string, report: CompletionReportDto): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.patch<ApiResponse<MechanisationJob>>(
      `/mechanisations/${id}/complete`,
      report
    );
    return response.data;
  },

  /**
   * Cancel a job
   */
  async cancel(id: string, reason?: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.patch<ApiResponse<MechanisationJob>>(
      `/mechanisations/${id}/cancel`,
      reason ? { reason } : undefined
    );
    return response.data;
  },

  /**
   * Reschedule a job to a new date
   */
  async reschedule(id: string, newDate: string): Promise<ApiResponse<MechanisationJob>> {
    const response = await apiClient.patch<ApiResponse<MechanisationJob>>(
      `/mechanisations/${id}/reschedule`,
      { scheduledDate: newDate }
    );
    return response.data;
  },

  /**
   * Permanently delete a job (admin only)
   */
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/mechanisations/${id}`);
    return response.data;
  },

  /**
   * Get all jobs booked by a specific TOT
   */
  async getByTot(totId: string): Promise<ApiResponse<MechanisationJob[]>> {
    return this.getAll({ bookedBy: totId });
  },

  /**
   * Get all pending approvals (for manager dashboard)
   */
  async getPendingApprovals(localMrId?: string): Promise<ApiResponse<MechanisationJob[]>> {
    return this.getAll({ status: 'pending-approval', localMrId });
  },
};
