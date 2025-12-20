import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { FarmerApprovalRequest, ApprovalStatus, ApprovalType } from '@/types';

export interface ApprovalFilters {
  type?: ApprovalType;
  status?: ApprovalStatus;
  requestedBy?: string;
  localMrId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const approvalService = {
  // Get all approval requests with optional filters
  async getAll(filters?: ApprovalFilters): Promise<ApiResponse<FarmerApprovalRequest[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<FarmerApprovalRequest[]>>(`/approvals${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single approval request by ID
  async getById(id: string): Promise<ApiResponse<FarmerApprovalRequest>> {
    const response = await apiClient.get<ApiResponse<FarmerApprovalRequest>>(`/approvals/${id}`);
    return response.data;
  },

  // Approve request
  async approve(id: string): Promise<ApiResponse<FarmerApprovalRequest>> {
    const response = await apiClient.post<ApiResponse<FarmerApprovalRequest>>(`/approvals/${id}/approve`);
    return response.data;
  },

  // Reject request
  async reject(id: string, reason: string): Promise<ApiResponse<FarmerApprovalRequest>> {
    const response = await apiClient.post<ApiResponse<FarmerApprovalRequest>>(`/approvals/${id}/reject`, { reason });
    return response.data;
  },

  // Get pending approvals
  async getPending(localMrId?: string): Promise<ApiResponse<FarmerApprovalRequest[]>> {
    return this.getAll({ status: 'pending', localMrId });
  },

  // Get pending count
  async getPendingCount(localMrId?: string): Promise<ApiResponse<{ count: number }>> {
    const query = localMrId ? `?localMrId=${localMrId}` : '';
    const response = await apiClient.get<ApiResponse<{ count: number }>>(`/approvals/pending-count${query}`);
    return response.data;
  },
};
