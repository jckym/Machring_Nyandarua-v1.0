import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// API base URL - defaults to Render backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mrodashboard.onrender.com/api';

// ============================================================
// DEVELOPMENT MODE - Bypass auth checks when disabled
// Set VITE_AUTH_DISABLED=true in .env to bypass authentication
// WARNING: This is for development/testing only!
// ============================================================
const IS_AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === 'true';

// Create axios instance with defaults
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Render free tier can cold-start; allow enough time for the first request.
  timeout: 120000,
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    // DEV MODE: Add a mock token header to satisfy backend checks
    // Note: Backend must also be in dev mode for this to work
    if (IS_AUTH_DISABLED) {
      config.headers['X-Dev-Mode'] = 'true';
      // Still send token if exists (for hybrid testing)
    }
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // DEV MODE: Don't redirect on 401 errors
    if (IS_AUTH_DISABLED) {
      console.warn('⚠️ DEV MODE: Ignoring auth error:', error.response?.status);
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API error type
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Helper function for API calls
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data;
}

// Query params builder
export function buildQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}
