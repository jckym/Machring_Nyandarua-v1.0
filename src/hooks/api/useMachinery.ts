import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineryService, CreateMachineryDto, UpdateMachineryDto, MachineryFilters } from '@/lib/api';
import { toast } from 'sonner';

export const machineryKeys = {
  all: ['machinery'] as const,
  lists: () => [...machineryKeys.all, 'list'] as const,
  list: (filters: MachineryFilters) => [...machineryKeys.lists(), filters] as const,
  details: () => [...machineryKeys.all, 'detail'] as const,
  detail: (id: string) => [...machineryKeys.details(), id] as const,
};

export function useMachinery(filters?: MachineryFilters) {
  return useQuery({
    queryKey: machineryKeys.list(filters || {}),
    queryFn: () => machineryService.getAll(filters),
  });
}

export function useMachineryItem(id: string) {
  return useQuery({
    queryKey: machineryKeys.detail(id),
    queryFn: () => machineryService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMachinery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMachineryDto) => machineryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machineryKeys.all });
      toast.success('Machinery added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add machinery');
    },
  });
}

export function useUpdateMachinery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMachineryDto }) => 
      machineryService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: machineryKeys.all });
      queryClient.invalidateQueries({ queryKey: machineryKeys.detail(variables.id) });
      toast.success('Machinery updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update machinery');
    },
  });
}

export function useDeleteMachinery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => machineryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machineryKeys.all });
      toast.success('Machinery deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete machinery');
    },
  });
}

export function useUpdateMachineryStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'available' | 'booked' | 'maintenance' }) => 
      machineryService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machineryKeys.all });
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}
