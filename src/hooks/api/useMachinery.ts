// src/hooks/api/useMachinery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineryService, CreateMachineryDto, UpdateMachineryDto, MachineryFilters } from '@/lib/api';
import { toast } from 'sonner';
import { Machinery } from '@/types';

export const machineryKeys = {
  all: ['machinery'] as const,
  lists: () => [...machineryKeys.all, 'list'] as const,
  list: (filters: MachineryFilters = {}) => [...machineryKeys.lists(), filters] as const,
  details: () => [...machineryKeys.all, 'detail'] as const,
  detail: (id: string) => [...machineryKeys.details(), id] as const,
};

/**
 * Fetch all machinery (with optional filters: status, type, etc.)
 */
export function useMachinery(filters?: MachineryFilters) {
  return useQuery({
    queryKey: machineryKeys.list(filters || {}),
    queryFn: () => machineryService.getAll(filters),
    select: (response) => (response?.data ?? []) as Machinery[],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/**
 * Fetch single machinery item
 */
export function useMachineryItem(id: string) {
  return useQuery({
    queryKey: machineryKeys.detail(id),
    queryFn: () => machineryService.getById(id),
    select: (response) => response?.data as Machinery | undefined,
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create new machinery (admin only)
 */
export function useCreateMachinery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMachineryDto) => machineryService.create(data),
    onMutate: async (newMachinery) => {
      await queryClient.cancelQueries({ queryKey: machineryKeys.all });

      const previousList = queryClient.getQueryData(machineryKeys.lists());

      queryClient.setQueryData(machineryKeys.lists(), (old: any[] = []) => [
        { ...newMachinery, _id: 'temp-id', status: 'available' },
        ...old,
      ]);

      return { previousList };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machineryKeys.all });
      toast.success('Machinery added successfully');
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(machineryKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to add machinery');
    },
  });
}

/**
 * Update machinery details
 */
export function useUpdateMachinery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMachineryDto }) =>
      machineryService.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: machineryKeys.all });

      const previousDetail = queryClient.getQueryData(machineryKeys.detail(id));
      const previousList = queryClient.getQueryData(machineryKeys.lists());

      queryClient.setQueryData(machineryKeys.detail(id), (old: any) => ({ ...old, ...data }));
      queryClient.setQueryData(machineryKeys.lists(), (old: any[] = []) =>
        old.map(m => (m._id === id ? { ...m, ...data } : m))
      );

      return { previousDetail, previousList };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: machineryKeys.all });
      queryClient.invalidateQueries({ queryKey: machineryKeys.detail(variables.id) });
      toast.success('Machinery updated successfully');
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(machineryKeys.detail(variables.id), context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData(machineryKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to update machinery');
    },
  });
}

/**
 * Delete machinery (admin only)
 */
export function useDeleteMachinery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => machineryService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: machineryKeys.all });

      const previousList = queryClient.getQueryData(machineryKeys.lists());

      queryClient.setQueryData(machineryKeys.lists(), (old: any[] = []) =>
        old.filter(m => m._id !== id)
      );

      return { previousList };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machineryKeys.all });
      toast.success('Machinery deleted successfully');
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(machineryKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to delete machinery');
    },
  });
}

/**
 * Update machinery status (available/booked/maintenance)
 */
export function useUpdateMachineryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'available' | 'booked' | 'maintenance' }) =>
      machineryService.updateStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: machineryKeys.all });

      const previousList = queryClient.getQueryData(machineryKeys.lists());
      const previousDetail = queryClient.getQueryData(machineryKeys.detail(id));

      queryClient.setQueryData(machineryKeys.lists(), (old: any[] = []) =>
        old.map(m => (m._id === id ? { ...m, status } : m))
      );
      queryClient.setQueryData(machineryKeys.detail(id), (old: any) => ({ ...old, status }));

      return { previousList, previousDetail };
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: machineryKeys.all });
      toast.success(`Machinery marked as ${status}`);
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(machineryKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(machineryKeys.detail(variables.id), context.previousDetail);
      }
      toast.error(error.message || 'Failed to update status');
    },
  });
}
