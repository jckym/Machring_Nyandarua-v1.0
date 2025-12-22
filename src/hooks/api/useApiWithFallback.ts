// src/hooks/api/useApiWithFallback.ts
import { UseQueryResult } from '@tanstack/react-query';

/**
 * Helper hook to safely extract data from API responses with a fallback value.
 * Handles both array responses and wrapped API responses.
 */
export function useApiWithFallback<T>(
  query: UseQueryResult<any, unknown>,
  fallback: T
): { data: T; isLoading: boolean; isError: boolean; error: unknown; isUsingFallback: boolean } {
  const { data: rawData, isLoading, isError, error } = query;

  // Handle different response formats
  let data: T = fallback;
  let isUsingFallback = false;
  
  if (rawData !== undefined && rawData !== null) {
    // If rawData is already an array, use it directly
    if (Array.isArray(rawData)) {
      data = rawData as unknown as T;
    } 
    // If rawData has a data property (ApiResponse format), extract it
    else if (rawData && typeof rawData === 'object' && 'data' in rawData) {
      data = (rawData as any).data ?? fallback;
    }
    // Otherwise use rawData directly
    else {
      data = rawData as T;
    }
  } else {
    isUsingFallback = true;
  }

  return { data, isLoading, isError, error, isUsingFallback };
}
