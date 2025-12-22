// src/hooks/api/useMechanisation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mechanisationService,
  CreateMechanisationDto,
  UpdateMechanisationDto,
  MechanisationFilters,
  CompletionReportDto,
} from '@/lib/api';
import { toast } from 'sonner';
import { MechanisationJob } from '@/types';

export const mechanisationKeys = {
  all: ['mechanisation'] as const,
  lists: () => [...mechanisationKeys.all, 'list'] as const,
  list: (filters: MechanisationFilters = {}) => [...mechanisationKeys.lists(), filters] as const,
  details: () => [...mechanisationKeys.all, 'detail'] as const,
  detail: (id: string) => [...mechanisationKeys.details(), id] as const,
  pending: (localMrId?: string) => [...mechanisationKeys.all, 'pending', localMrId || 'global'] as const,
};

/**
 * All mechanisation jobs (filtered by status, localMrId, totId, etc.)
 */
export function useMechanisationJobs(filters?: MechanisationFilters) {
  return useQuery({
    queryKey: mechanisationKeys.list(filters || {}),
    queryFn: () => mechanisationService.getAll(filters),
    select: (response) => (response?.data ?? []) as MechanisationJob[],
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Single job details
 */
export function useMechanisationJob(id: string) {
  return useQuery({
    queryKey: mechanisationKeys.detail(id),
    queryFn: () => mechanisationService.getById(id),
    select: (response) => response?.data as MechanisationJob | undefined,
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Pending approvals (for manager/admin)
 */
export function usePendingMechanisation(localMrId?: string) {
  return useQuery({
    queryKey: mechanisationKeys.pending(localMrId),
    queryFn: () => mechanisationService.getPendingApprovals(localMrId),
    select: (response) => (response?.data ?? []) as MechanisationJob[],
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create new booking (TOT)
 */
export function useCreateMechanisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMechanisationDto) => mechanisationService.create(data),
    onMutate: async (newJob) => {
      await queryClient.cancelQueries({ queryKey: mechanisationKeys.all });

      const previousList = queryClient.getQueryData(mechanisationKeys.lists());

      queryClient.setQueryData(mechanisationKeys.lists(), (old: any[] = []) => [
        { ...newJob, _id: 'temp-id', status: 'pending-approval', createdAt: new Date() },
        ...old,
      ]);

      return { previousList };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Mechanisation booking submitted for approval');
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(mechanisationKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to submit booking');
    },
  });
}

/**
 * Update booking details
 */
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
  });
}

/**
 * Approve booking (manager/admin)
 */
export function useApproveMechanisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mechanisationService.approve(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: mechanisationKeys.all });

      const previousList = queryClient.getQueryData(mechanisationKeys.lists());
      const previousPending = queryClient.getQueryData(mechanisationKeys.pending());

      queryClient.setQueryData(mechanisationKeys.lists(), (old: any[] = []) =>
        old.map(job => (job._id === id ? { ...job, status: 'approved' } : job))
      );

      return { previousList, previousPending };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.pending() });
      toast.success('Mechanisation booking approved');
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(mechanisationKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to approve booking');
    },
  });
}

/**
 * Reject booking
 */
export function useRejectMechanisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      mechanisationService.reject(id, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.pending() });
      toast.success('Booking rejected');
    },
  });
}

/**
 * Complete job with report
 */
export function useCompleteMechanisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, report }: { id: string; report: CompletionReportDto }) =>
      mechanisationService.complete(id, report),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Job marked as completed');
    },
  });
}

/**
 * Reschedule job
 */
export function useRescheduleMechanisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate: string }) =>
      mechanisationService.reschedule(id, newDate),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Job rescheduled successfully');
    },
  });
}
