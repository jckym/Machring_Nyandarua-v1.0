import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitService, CreateVisitDto, UpdateVisitDto, VisitFilters } from '@/lib/api';
import { toast } from 'sonner';

export const visitKeys = {
  all: ['visits'] as const,
  lists: () => [...visitKeys.all, 'list'] as const,
  list: (filters: VisitFilters) => [...visitKeys.lists(), filters] as const,
  details: () => [...visitKeys.all, 'detail'] as const,
  detail: (id: string) => [...visitKeys.details(), id] as const,
};

export function useVisits(filters?: VisitFilters) {
  return useQuery({
    queryKey: visitKeys.list(filters || {}),
    queryFn: () => visitService.getAll(filters),
  });
}

export function useVisit(id: string) {
  return useQuery({
    queryKey: visitKeys.detail(id),
    queryFn: () => visitService.getById(id),
    enabled: !!id,
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateVisitDto) => visitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
      toast.success('Visit logged successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to log visit');
    },
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVisitDto }) => 
      visitService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
      queryClient.invalidateQueries({ queryKey: visitKeys.detail(variables.id) });
      toast.success('Visit updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update visit');
    },
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => visitService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
      toast.success('Visit deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete visit');
    },
  });
}
