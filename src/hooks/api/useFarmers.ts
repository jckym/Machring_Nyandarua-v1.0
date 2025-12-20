import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmerService, CreateFarmerDto, UpdateFarmerDto, FarmerFilters } from '@/lib/api';
import { toast } from 'sonner';

export const farmerKeys = {
  all: ['farmers'] as const,
  lists: () => [...farmerKeys.all, 'list'] as const,
  list: (filters: FarmerFilters) => [...farmerKeys.lists(), filters] as const,
  details: () => [...farmerKeys.all, 'detail'] as const,
  detail: (id: string) => [...farmerKeys.details(), id] as const,
  activity: (id: string) => [...farmerKeys.all, 'activity', id] as const,
};

export function useFarmers(filters?: FarmerFilters) {
  return useQuery({
    queryKey: farmerKeys.list(filters || {}),
    queryFn: () => farmerService.getAll(filters),
  });
}

export function useFarmer(id: string) {
  return useQuery({
    queryKey: farmerKeys.detail(id),
    queryFn: () => farmerService.getById(id),
    enabled: !!id,
  });
}

export function useFarmerActivity(id: string) {
  return useQuery({
    queryKey: farmerKeys.activity(id),
    queryFn: () => farmerService.getActivitySummary(id),
    enabled: !!id,
  });
}

export function useCreateFarmer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFarmerDto) => farmerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success('Farmer registration submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create farmer');
    },
  });
}

export function useUpdateFarmer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFarmerDto }) => 
      farmerService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      queryClient.invalidateQueries({ queryKey: farmerKeys.detail(variables.id) });
      toast.success('Farmer update submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update farmer');
    },
  });
}

export function useDeleteFarmer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => farmerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success('Farmer deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete farmer');
    },
  });
}

export function useApproveFarmer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => farmerService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success('Farmer approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve farmer');
    },
  });
}

export function useRejectFarmer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      farmerService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success('Farmer rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject farmer');
    },
  });
}
