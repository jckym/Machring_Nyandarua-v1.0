import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localMrService, CreateLocalMRDto, UpdateLocalMRDto, LocalMRFilters } from '@/lib/api';
import { toast } from 'sonner';

export const localMrKeys = {
  all: ['localMrs'] as const,
  lists: () => [...localMrKeys.all, 'list'] as const,
  list: (filters: LocalMRFilters) => [...localMrKeys.lists(), filters] as const,
  details: () => [...localMrKeys.all, 'detail'] as const,
  detail: (id: string) => [...localMrKeys.details(), id] as const,
  stats: (id: string) => [...localMrKeys.all, 'stats', id] as const,
};

export function useLocalMRs(filters?: LocalMRFilters) {
  return useQuery({
    queryKey: localMrKeys.list(filters || {}),
    queryFn: () => localMrService.getAll(filters),
  });
}

export function useLocalMR(id: string) {
  return useQuery({
    queryKey: localMrKeys.detail(id),
    queryFn: () => localMrService.getById(id),
    enabled: !!id,
  });
}

export function useLocalMRStats(id: string) {
  return useQuery({
    queryKey: localMrKeys.stats(id),
    queryFn: () => localMrService.getStats(id),
    enabled: !!id,
  });
}

export function useCreateLocalMR() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLocalMRDto) => localMrService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localMrKeys.all });
      toast.success('Local MR added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add Local MR');
    },
  });
}

export function useUpdateLocalMR() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocalMRDto }) => 
      localMrService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: localMrKeys.all });
      queryClient.invalidateQueries({ queryKey: localMrKeys.detail(variables.id) });
      toast.success('Local MR updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update Local MR');
    },
  });
}

export function useDeleteLocalMR() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => localMrService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localMrKeys.all });
      toast.success('Local MR deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete Local MR');
    },
  });
}
