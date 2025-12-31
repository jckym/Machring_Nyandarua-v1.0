// src/hooks/api/useTrainings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Training {
  id: string;
  title: string;
  description: string | null;
  training_type: string;
  trainer_id: string;
  local_mr_id: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  duration_hours: number | null;
  venue: string | null;
  max_attendees: number | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  trainer_name?: string;
  local_mr_name?: string;
  attendees_count?: number;
}

export interface TrainingFilters {
  localMrId?: string;
  trainerId?: string;
  status?: string;
}

export const trainingKeys = {
  all: ['trainings'] as const,
  lists: () => [...trainingKeys.all, 'list'] as const,
  list: (filters: TrainingFilters = {}) => [...trainingKeys.lists(), filters] as const,
  details: () => [...trainingKeys.all, 'detail'] as const,
  detail: (id: string) => [...trainingKeys.details(), id] as const,
};

export function useTrainings(filters: TrainingFilters = {}) {
  return useQuery({
    queryKey: trainingKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('trainings')
        .select(`
          *,
          local_mrs!trainings_local_mr_id_fkey(name),
          training_attendees(count)
        `)
        .order('scheduled_date', { ascending: false });

      if (filters.localMrId) {
        query = query.eq('local_mr_id', filters.localMrId);
      }
      if (filters.trainerId) {
        query = query.eq('trainer_id', filters.trainerId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((t: any) => ({
        ...t,
        local_mr_name: t.local_mrs?.name || '',
        attendees_count: t.training_attendees?.[0]?.count || 0,
        trainerName: 'Trainer',
        type: t.training_type,
        location: t.venue || '',
        date: t.scheduled_date,
        duration: t.duration_hours || 0,
        attendees: Array(t.training_attendees?.[0]?.count || 0).fill({}),
        topics: t.description ? t.description.split(',').map((s: string) => s.trim()) : [],
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useTraining(id: string) {
  return useQuery({
    queryKey: trainingKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select(`
          *,
          local_mrs!trainings_local_mr_id_fkey(name),
          training_attendees(farmer_id, attended)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        local_mr_name: (data as any).local_mrs?.name || '',
        trainerName: 'Trainer',
        type: data.training_type,
        location: data.venue || '',
        date: data.scheduled_date,
        duration: data.duration_hours || 0,
        attendees: data.training_attendees || [],
        topics: data.description ? data.description.split(',').map((s: string) => s.trim()) : [],
      };
    },
    enabled: !!id,
  });
}

export interface CreateTrainingDto {
  title: string;
  description?: string;
  training_type: string;
  trainer_id: string;
  local_mr_id?: string;
  scheduled_date: string;
  scheduled_time?: string;
  duration_hours?: number;
  venue?: string;
  max_attendees?: number;
}

export function useCreateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTrainingDto) => {
      const { data: training, error } = await supabase
        .from('trainings')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return training;
    },
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTrainingDto> }) => {
      const { data: training, error } = await supabase
        .from('trainings')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return training;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
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
    mutationFn: async ({ trainingId, farmerId }: { trainingId: string; farmerId: string }) => {
      const { error } = await supabase
        .from('training_attendees')
        .insert({
          training_id: trainingId,
          farmer_id: farmerId,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(variables.trainingId) });
      toast.success('Attendee added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add attendee');
    },
  });
}
