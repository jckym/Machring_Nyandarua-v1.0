import { apiClient, ApiResponse, buildQueryParams } from '../client';

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface LogFilters {
  level?: 'info' | 'warning' | 'error';
  source?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogFilters {
  action?: string;
  entity?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const logService = {
  // Get system logs
  async getSystemLogs(filters?: LogFilters): Promise<ApiResponse<SystemLog[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<SystemLog[]>>(`/logs/system${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get audit logs
  async getAuditLogs(filters?: AuditLogFilters): Promise<ApiResponse<AuditLog[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<AuditLog[]>>(`/logs/audit${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Export system logs
  async exportSystemLogs(format: 'excel' | 'pdf', filters?: LogFilters): Promise<Blob> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get(`/logs/system/export?format=${format}${query ? `&${query}` : ''}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export audit logs
  async exportAuditLogs(format: 'excel' | 'pdf', filters?: AuditLogFilters): Promise<Blob> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get(`/logs/audit/export?format=${format}${query ? `&${query}` : ''}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
