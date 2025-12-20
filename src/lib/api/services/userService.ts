import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { User, UserRole } from '@/types';

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  localMrId?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  localMrId?: string;
  status?: 'active' | 'inactive';
  avatar?: string;
}

export interface UserFilters {
  role?: UserRole;
  localMrId?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  // Get all users with optional filters
  async getAll(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<User[]>>(`/users${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single user by ID
  async getById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // Create new user
  async create(data: CreateUserDto): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  // Update user
  async update(id: string, data: UpdateUserDto): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/users/${id}`);
    return response.data;
  },

  // Get users by role
  async getByRole(role: UserRole): Promise<ApiResponse<User[]>> {
    return this.getAll({ role });
  },

  // Get TOTs by Local MR
  async getTotsByLocalMR(localMrId: string): Promise<ApiResponse<User[]>> {
    return this.getAll({ role: 'tot', localMrId });
  },
};
