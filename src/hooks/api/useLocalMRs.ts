// src/hooks/api/useLocalMRs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localMrService, CreateLocalMRDto, UpdateLocalMRDto, LocalMRFilters } from '@/lib/api';
import { toast } from 'sonner';

export const localMrKeys = {
  all: ['localMrs'] as const,
  lists: () => [...localMrKeys.all, 'list'] as const,
  list: (filters: LocalMRFilters = {}) => [...localMrKeys.lists(), filters] as const,
  details: () => [...localMrKeys.all, 'detail'] as const,
  detail: (id: string) => [...localMrKeys.details(), id] as const,
  stats: () => [...localMrKeys.all, 'stats'] as const,
  statsById: (id: string) => [...localMrKeys.stats(), id] as const,
};

interface UseLocalMRsOptions {
  filters?: LocalMRFilters;
  sortBy?: 'name' | 'totalFarmers' | 'totalTots' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch all Local MRs - Used heavily in Admin Dashboard
 */
export function useLocalMRs(options: UseLocalMRsOptions = {}) {
  const { filters = {}, sortBy = 'name', sortOrder = 'asc' } = options;

  return useQuery({
    queryKey: localMrKeys.list(filters),
    queryFn: () => localMrService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes - dashboard data doesn't change frequently
    cacheTime: 1000 * 60 * 10, // 10 minutes
    select: (data) => {
      // Client-side sorting for consistent dashboard display
      const sorted = [...data].sort((a, b) => {
        let aVal: any = a[sortBy];
        let bVal: any = b[sortBy];

        if (sortBy === 'name') {
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    },
  });
}

/**
 * Fetch single Local MR
 */
export function useLocalMR(id: string) {
  return useQuery({
    queryKey: localMrKeys.detail(id),
    queryFn: () => localMrService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch stats for a specific Local MR
 */
export function useLocalMRStats(id: string) {
  return useQuery({
    queryKey: localMrKeys.statsById(id),
    queryFn: () => localMrService.getStats(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // Stats change less often
  });
}

/**
 * Create Local MR with optimistic update
 */
export function useCreateLocalMR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocalMRDto) => localMrService.create(data),
    onMutate: async (newMR) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: localMrKeys.all });

      // Snapshot previous value
      const previousMRs = queryClient.getQueryData(localMrKeys.lists());

      // Optimistically update list
      queryClient.setQueryData(localMrKeys.lists(), (old: any[] = []) => [
        { ...newMR, _id: 'temp-id', totalTots: 0, totalFarmers: 0, isActive: true },
        ...old,
      ]);

      return { previousMRs };
    },
    onSuccess: (newMR) => {
      // Replace temp item with real one
      queryClient.setQueryData(localMrKeys.lists(), (old: any[] = []) =>
        old.map((mr) => (mr._id === 'temp-id' ? newMR : mr))
      );

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: localMrKeys.all });
      queryClient.invalidateQueries({ queryKey: localMrKeys.lists() });

      toast.success('Local MR created successfully');
    },
    onError: (error: Error, _variables, context) => {
      // Revert on error
      if (context?.previousMRs) {
        queryClient.setQueryData(localMrKeys.lists(), context.previousMRs);
      }
      toast.error(error.message || 'Failed to create Local MR');
    },
  });
}

/**
 * Update Local MR with optimistic update
 */
export function useUpdateLocalMR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocalMRDto }) =>
      localMrService.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: localMrKeys.all });

      const previousMR = queryClient.getQueryData(localMrKeys.detail(id));
      const previousList = queryClient.getQueryData(localMrKeys.lists());

      // Optimistically update detail
      queryClient.setQueryData(localMrKeys.detail(id), (old: any) => ({ ...old, ...data }));

      // Optimistically update list
      queryClient.setQueryData(localMrKeys.lists(), (old: any[] = []) =>
        old.map((mr) => (mr._id === id ? { ...mr, ...data } : mr))
      );

      return { previousMR, previousList };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: localMrKeys.all });
      queryClient.invalidateQueries({ queryKey: localMrKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: localMrKeys.stats() }); // In case stats change

      toast.success('Local MR updated successfully');
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousMR) {
        queryClient.setQueryData(localMrKeys.detail(variables.id), context.previousMR);
      }
      if (context?.previousList) {
        queryClient.setQueryData(localMrKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to update Local MR');
    },
  });
}

/**
 * Delete Local MR
 */
export function useDeleteLocalMR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => localMrService.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: localMrKeys.all });

      const previousList = queryClient.getQueryData(localMrKeys.lists());

      queryClient.setQueryData(localMrKeys.lists(), (old: any[] = []) =>
        old.filter((mr) => mr._id !== id)
      );

      return { previousList };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localMrKeys.all });
      toast.success('Local MR deleted successfully');
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(localMrKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to delete Local MR');
    },
  });
}
