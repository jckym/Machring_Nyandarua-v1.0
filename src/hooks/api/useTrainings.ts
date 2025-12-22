import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingService, CreateTrainingDto, UpdateTrainingDto, TrainingFilters } from '@/lib/api';
import { toast } from 'sonner';
import { Training } from '@/types';

export const trainingKeys = {
  all: ['trainings'] as const,
  lists: () => [...trainingKeys.all, 'list'] as const,
  list: (filters: TrainingFilters) => [...trainingKeys.lists(), filters] as const,
  details: () => [...trainingKeys.all, 'detail'] as const,
  detail: (id: string) => [...trainingKeys.details(), id] as const,
};

export function useTrainings(filters?: TrainingFilters) {
  return useQuery({
    queryKey: trainingKeys.list(filters || {}),
    queryFn: () => trainingService.getAll(filters),
    select: (response) => (response?.data ?? []) as Training[],
  });
}

export function useTraining(id: string) {
  return useQuery({
    queryKey: trainingKeys.detail(id),
    queryFn: () => trainingService.getById(id),
    select: (response) => response?.data as Training | undefined,
    enabled: !!id,
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTrainingDto) => trainingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
      toast.success('Training scheduled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create training');
    },
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrainingDto }) => 
      trainingService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(variables.id) });
      toast.success('Training updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update training');
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => trainingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
      toast.success('Training deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete training');
    },
  });
}

export function useAddAttendee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trainingId, farmerId }: { trainingId: string; farmerId: string }) => 
      trainingService.addAttendees(trainingId, [farmerId]),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(variables.trainingId) });
      toast.success('Attendee added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add attendee');
    },
  });
}
