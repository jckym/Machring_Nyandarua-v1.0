import { useEffect, useState } from 'react';
import { UseQueryResult } from '@tanstack/react-query';

/**
 * Hook that provides API data with graceful fallback to mock data when API is unavailable.
 * 
 * @param query - The React Query result from an API hook
 * @param mockData - Fallback mock data to use when API fails
 * @param options - Additional options
 * @returns Object with data, loading state, error, and whether using fallback
 */
export function useApiWithFallback<TData, TMock>(
  query: UseQueryResult<{ data: TData }, Error>,
  mockData: TMock,
  options?: {
    transformApiData?: (data: TData) => TMock;
    onFallback?: () => void;
  }
) {
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [hasNotifiedFallback, setHasNotifiedFallback] = useState(false);

  useEffect(() => {
    // If query failed or has network error, switch to fallback
    if (query.isError && !hasNotifiedFallback) {
      setIsUsingFallback(true);
      setHasNotifiedFallback(true);
      options?.onFallback?.();
    }
  }, [query.isError, hasNotifiedFallback, options]);

  // Reset fallback state on successful query
  useEffect(() => {
    if (query.isSuccess && query.data) {
      setIsUsingFallback(false);
      setHasNotifiedFallback(false);
    }
  }, [query.isSuccess, query.data]);

  // Determine the data to return
  let data: TMock;
  
  if (query.isSuccess && query.data?.data) {
    // API data available - transform if needed
    data = options?.transformApiData 
      ? options.transformApiData(query.data.data)
      : (query.data.data as unknown as TMock);
  } else {
    // Use mock data as fallback
    data = mockData;
  }

  return {
    data,
    isLoading: query.isLoading && !isUsingFallback,
    isError: query.isError,
    error: query.error,
    isUsingFallback,
    refetch: query.refetch,
  };
}

/**
 * Simple wrapper to check if API is available
 */
export function useApiStatus() {
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/health`,
        { method: 'GET', signal: AbortSignal.timeout(5000) }
      );
      setIsApiAvailable(response.ok);
    } catch {
      setIsApiAvailable(false);
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkApiStatus();
    // Re-check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isApiAvailable, lastChecked, recheckStatus: checkApiStatus };
}
