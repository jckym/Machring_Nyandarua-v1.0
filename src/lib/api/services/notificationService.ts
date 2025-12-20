import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { Notification, NotificationType } from '@/types';

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;
  localMrId?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilters {
  userId?: string;
  localMrId?: string;
  type?: NotificationType;
  read?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const notificationService = {
  // Get all notifications with optional filters
  async getAll(filters?: NotificationFilters): Promise<ApiResponse<Notification[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<Notification[]>>(`/notifications${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single notification by ID
  async getById(id: string): Promise<ApiResponse<Notification>> {
    const response = await apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`);
    return response.data;
  },

  // Create new notification
  async create(data: CreateNotificationDto): Promise<ApiResponse<Notification>> {
    const response = await apiClient.post<ApiResponse<Notification>>('/notifications', data);
    return response.data;
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark multiple notifications as read
  async markMultipleAsRead(ids: string[]): Promise<ApiResponse<{ updated: number }>> {
    const response = await apiClient.patch<ApiResponse<{ updated: number }>>('/notifications/read', { ids });
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<{ updated: number }>> {
    const response = await apiClient.patch<ApiResponse<{ updated: number }>>('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/notifications/${id}`);
    return response.data;
  },

  // Delete multiple notifications
  async deleteMultiple(ids: string[]): Promise<ApiResponse<{ deleted: number }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: number }>>('/notifications', { data: { ids } });
    return response.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data;
  },

  // Get notifications for current user
  async getMyNotifications(filters?: Omit<NotificationFilters, 'userId'>): Promise<ApiResponse<Notification[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<Notification[]>>(`/notifications/me${query ? `?${query}` : ''}`);
    return response.data;
  },
};
