import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mechanisationService, CreateMechanisationDto, UpdateMechanisationDto, MechanisationFilters, CompletionReportDto } from '@/lib/api';
import { toast } from 'sonner';

export const mechanisationKeys = {
  all: ['mechanisation'] as const,
  lists: () => [...mechanisationKeys.all, 'list'] as const,
  list: (filters: MechanisationFilters) => [...mechanisationKeys.lists(), filters] as const,
  details: () => [...mechanisationKeys.all, 'detail'] as const,
  detail: (id: string) => [...mechanisationKeys.details(), id] as const,
  pending: (localMrId?: string) => [...mechanisationKeys.all, 'pending', localMrId] as const,
};

export function useMechanisationJobs(filters?: MechanisationFilters) {
  return useQuery({
    queryKey: mechanisationKeys.list(filters || {}),
    queryFn: () => mechanisationService.getAll(filters),
  });
}

export function useMechanisationJob(id: string) {
  return useQuery({
    queryKey: mechanisationKeys.detail(id),
    queryFn: () => mechanisationService.getById(id),
    enabled: !!id,
  });
}

export function usePendingMechanisation(localMrId?: string) {
  return useQuery({
    queryKey: mechanisationKeys.pending(localMrId),
    queryFn: () => mechanisationService.getPendingApprovals(localMrId),
  });
}

export function useCreateMechanisation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMechanisationDto) => mechanisationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Mechanisation booking submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });
}

export function useUpdateMechanisation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMechanisationDto }) => 
      mechanisationService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.detail(variables.id) });
      toast.success('Booking updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update booking');
    },
  });
}

export function useApproveMechanisation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mechanisationService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Booking approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve booking');
    },
  });
}

export function useRejectMechanisation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      mechanisationService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Booking rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject booking');
    },
  });
}

export function useCompleteMechanisation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, report }: { id: string; report: CompletionReportDto }) => 
      mechanisationService.complete(id, report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Job completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete job');
    },
  });
}

export function useRescheduleMechanisation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate: string }) => 
      mechanisationService.reschedule(id, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Job rescheduled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reschedule job');
    },
  });
}
