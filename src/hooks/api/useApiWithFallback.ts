// src/hooks/api/useApiWithFallback.ts
import { UseQueryResult } from '@tanstack/react-query';
import { ApiResponse } from '@/lib/api/client';

/**
 * Helper hook to unwrap ApiResponse and provide fallback data
 * Handles the transition from raw API responses to usable data
 */
export function useApiWithFallback<T>(
  queryResult: UseQueryResult<ApiResponse<T> | T[] | T | any, Error>,
  fallbackData: T
): {
  data: T;
  isLoading: boolean;
  isError: boolean;
  isUsingFallback: boolean;
  error: Error | null;
} {
  const { data, isLoading, isError, error } = queryResult;

  // Unwrap ApiResponse if needed
  let unwrappedData: T;
  let isUsingFallback = false;

  if (data === undefined || data === null) {
    unwrappedData = fallbackData;
    isUsingFallback = true;
  } else if (typeof data === 'object' && 'data' in data && !Array.isArray(data)) {
    // It's an ApiResponse wrapper
    unwrappedData = (data as ApiResponse<T>).data ?? fallbackData;
    isUsingFallback = unwrappedData === fallbackData;
  } else {
    // Direct data
    unwrappedData = data as T;
  }

  return {
    data: unwrappedData,
    isLoading,
    isError,
    isUsingFallback: isUsingFallback || isError,
    error: error ?? null,
  };
}
