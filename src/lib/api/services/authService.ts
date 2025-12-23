import { apiClient, ApiResponse } from '../client';
import { User, UserRole } from '@/types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  localMrId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  // Login
  async login(data: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const doRequest = () => apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);

    let response;
    try {
      response = await doRequest();
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.code;
      const retriable =
        code === 'ERR_NETWORK' ||
        code === 'ECONNABORTED' ||
        status === 502 ||
        status === 503 ||
        status === 504;

      if (!retriable) throw err;

      // Wait a bit for cold-start then retry once
      await new Promise((r) => setTimeout(r, 6000));
      response = await doRequest();
    }

    if (response.data.success && response.data.data.token) {
      localStorage.setItem('auth_token', response.data.data.token);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refresh_token', response.data.data.refreshToken);
      }
    }
    return response.data;
  },

  // Register
  async register(data: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh', { refreshToken });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordDto): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>('/auth/change-password', data);
    return response.data;
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<ApiResponse<{ sent: boolean }>> {
    const response = await apiClient.post<ApiResponse<{ sent: boolean }>>('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
};
