// src/hooks/api/useFarmers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmerService, CreateFarmerDto, UpdateFarmerDto, FarmerFilters } from '@/lib/api';
import { toast } from 'sonner';
import { Farmer } from '@/types';

export const farmerKeys = {
  all: ['farmers'] as const,
  lists: () => [...farmerKeys.all, 'list'] as const,
  list: (filters: FarmerFilters = {}) => [...farmerKeys.lists(), filters] as const,
  details: () => [...farmerKeys.all, 'detail'] as const,
  detail: (id: string) => [...farmerKeys.details(), id] as const,
  activity: (id: string) => [...farmerKeys.all, 'activity', id] as const,
  pending: () => [...farmerKeys.all, 'pending'] as const,
};

export interface UseFarmersOptions {
  filters?: FarmerFilters;
  localMrId?: string;
  search?: string;
  status?: string;
}

/**
 * Fetch farmers list - supports filtering (e.g., by localMrId, status)
 */
export function useFarmers(options: UseFarmersOptions = {}) {
  const { filters = {}, localMrId, search, status } = options;
  
  const mergedFilters: FarmerFilters = {
    ...filters,
    ...(localMrId && { localMrId }),
    ...(search && { search }),
    ...(status && { status }),
  };

  return useQuery({
    queryKey: farmerKeys.list(mergedFilters),
    queryFn: () => farmerService.getAll(mergedFilters),
    select: (response) => (response?.data ?? []) as Farmer[],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch single farmer
 */
export function useFarmer(id: string) {
  return useQuery({
    queryKey: farmerKeys.detail(id),
    queryFn: () => farmerService.getById(id),
    select: (response) => response?.data as Farmer | undefined,
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch farmer activity summary
 */
export function useFarmerActivity(id: string) {
  return useQuery({
    queryKey: farmerKeys.activity(id),
    queryFn: () => farmerService.getActivitySummary(id),
    select: (response) => response?.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Create farmer (TOT adds new farmer)
 */
export function useCreateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFarmerDto) => farmerService.create(data),
    onMutate: async (newFarmer) => {
      await queryClient.cancelQueries({ queryKey: farmerKeys.all });
      const previousFarmers = queryClient.getQueryData(farmerKeys.lists());
      queryClient.setQueryData(farmerKeys.lists(), (old: any[] = []) => [
        { ...newFarmer, id: 'temp-id', status: 'approved' },
        ...old,
      ]);
      return { previousFarmers };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success('Farmer registered successfully');
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousFarmers) {
        queryClient.setQueryData(farmerKeys.lists(), context.previousFarmers);
      }
      toast.error(error.message || 'Failed to register farmer');
    },
  });
}

/**
 * Update farmer (TOT requests edit → pending approval)
 */
export function useUpdateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFarmerDto }) =>
      farmerService.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: farmerKeys.all });
      const previousFarmer = queryClient.getQueryData(farmerKeys.detail(id));
      const previousList = queryClient.getQueryData(farmerKeys.lists());
      queryClient.setQueryData(farmerKeys.detail(id), (old: any) => ({
        ...old,
        ...data,
        hasPendingEdit: true,
      }));
      return { previousFarmer, previousList };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success('Edit request sent for approval');
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousFarmer) {
        queryClient.setQueryData(farmerKeys.detail(variables.id), context.previousFarmer);
      }
      if (context?.previousList) {
        queryClient.setQueryData(farmerKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to submit edit request');
    },
  });
}

/**
 * Delete farmer (admin only)
 */
export function useDeleteFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => farmerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success('Farmer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete farmer');
    },
  });
}

/**
 * Approve pending farmer/edit (admin/manager)
 */
export function useApproveFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => farmerService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      queryClient.invalidateQueries({ queryKey: farmerKeys.pending() });
      toast.success('Farmer/edit approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve');
    },
  });
}

/**
 * Reject pending farmer/edit
 */
export function useRejectFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      farmerService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      queryClient.invalidateQueries({ queryKey: farmerKeys.pending() });
      toast.success('Farmer/edit rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject');
    },
  });
}
