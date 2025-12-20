// src/hooks/api/useSyncStatus.ts
import { useQuery } from '@tanstack/react-query';
import { syncService } from '@/lib/api';

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync', 'status'],
    queryFn: () => syncService.getPendingCount(),
    refetchInterval: (query) => {
      // Only refetch when online and there are pending items
      const isOnline = navigator.onLine;
      const pending = query.state.data ?? 0;
      return isOnline && pending > 0 ? 10000 : false; // Every 10s if syncing needed
    },
    staleTime: 5000,
    // Optional: optimistic default
    initialData: 0,
  });
}
