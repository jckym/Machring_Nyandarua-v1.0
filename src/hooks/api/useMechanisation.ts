// src/hooks/api/useMechanisation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MechanisationJob {
  id: string;
  farmer_id: string;
  machinery_id: string;
  tot_id: string;
  local_mr_id: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string | null;
  area_acres: number | null;
  duration_hours: number | null;
  total_cost: number;
  status: string;
  completion_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  farmer_name?: string;
  machinery_name?: string;
  tot_name?: string;
  local_mr_name?: string;
}

export interface MechanisationFilters {
  localMrId?: string;
  totId?: string;
  status?: string;
  machineryId?: string;
}

export const mechanisationKeys = {
  all: ['mechanisation'] as const,
  lists: () => [...mechanisationKeys.all, 'list'] as const,
  list: (filters: MechanisationFilters = {}) => [...mechanisationKeys.lists(), filters] as const,
  details: () => [...mechanisationKeys.all, 'detail'] as const,
  detail: (id: string) => [...mechanisationKeys.details(), id] as const,
};

export function useMechanisationJobs(filters: MechanisationFilters = {}) {
  return useQuery({
    queryKey: mechanisationKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('mechanisation_jobs')
        .select(`
          *,
          farmers!mechanisation_jobs_farmer_id_fkey(name),
          machinery!mechanisation_jobs_machinery_id_fkey(name, daily_rate),
          local_mrs!mechanisation_jobs_local_mr_id_fkey(name)
        `)
        .order('scheduled_date', { ascending: false });

      if (filters.localMrId) {
        query = query.eq('local_mr_id', filters.localMrId);
      }
      if (filters.totId) {
        query = query.eq('tot_id', filters.totId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.machineryId) {
        query = query.eq('machinery_id', filters.machineryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((j: any) => ({
        ...j,
        farmer_name: j.farmers?.name || '',
        machinery_name: j.machinery?.name || '',
        local_mr_name: j.local_mrs?.name || '',
        farmerName: j.farmers?.name || '',
        machineryName: j.machinery?.name || '',
        farmerId: j.farmer_id,
        machineryId: j.machinery_id,
        totId: j.tot_id,
        localMrId: j.local_mr_id,
        acreage: j.area_acres || 0,
        pricePerAcre: j.machinery?.daily_rate || 0,
        totalPrice: j.total_cost,
        serviceType: j.service_type,
        scheduledDate: j.scheduled_date,
        completionReport: j.completed_at ? {
          summary: j.completion_notes || 'Job completed',
          duration: `${j.duration_hours || 0} hours`,
          completedAt: j.completed_at,
          outcome: 'Successful',
        } : null,
      }));
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useMechanisationJob(id: string) {
  return useQuery({
    queryKey: mechanisationKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mechanisation_jobs')
        .select(`
          *,
          farmers!mechanisation_jobs_farmer_id_fkey(name),
          machinery!mechanisation_jobs_machinery_id_fkey(name, daily_rate),
          local_mrs!mechanisation_jobs_local_mr_id_fkey(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        farmerName: data.farmers?.name || '',
        machineryName: data.machinery?.name || '',
        localMrName: data.local_mrs?.name || '',
        acreage: data.area_acres || 0,
        pricePerAcre: data.machinery?.daily_rate || 0,
        totalPrice: data.total_cost,
        scheduledDate: data.scheduled_date,
      };
    },
    enabled: !!id,
  });
}

export function usePendingMechanisation(localMrId?: string) {
  return useQuery({
    queryKey: mechanisationKeys.list({ localMrId, status: 'pending' }),
    queryFn: async () => {
      let query = supabase
        .from('mechanisation_jobs')
        .select(`
          *,
          farmers!mechanisation_jobs_farmer_id_fkey(name),
          machinery!mechanisation_jobs_machinery_id_fkey(name),
          local_mrs!mechanisation_jobs_local_mr_id_fkey(name)
        `)
        .eq('status', 'pending')
        .order('scheduled_date', { ascending: true });

      if (localMrId) {
        query = query.eq('local_mr_id', localMrId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export interface CreateMechanisationDto {
  farmer_id: string;
  machinery_id: string;
  tot_id: string;
  local_mr_id: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time?: string;
  area_acres?: number;
  total_cost?: number;
}

export function useCreateMechanisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMechanisationDto) => {
      const { data: job, error } = await supabase
        .from('mechanisation_jobs')
        .insert({
          farmer_id: data.farmer_id,
          machinery_id: data.machinery_id,
          tot_id: data.tot_id,
          local_mr_id: data.local_mr_id,
          service_type: data.service_type,
          scheduled_date: data.scheduled_date,
          scheduled_time: data.scheduled_time,
          area_acres: data.area_acres,
          total_cost: data.total_cost || 0,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Mechanisation booking created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });
}

export function useUpdateMechanisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateMechanisationDto> }) => {
      const { data: job, error } = await supabase
        .from('mechanisation_jobs')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mechanisation_jobs')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
    },
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
    mutationFn: async ({ id }: { id: string; reason?: string }) => {
      const { error } = await supabase
        .from('mechanisation_jobs')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
    },
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
    mutationFn: async ({ id, report }: { id: string; report: { summary: string; duration: string; outcome: string } }) => {
      const { error } = await supabase
        .from('mechanisation_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: report.summary,
          duration_hours: parseFloat(report.duration) || 0,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Job marked as completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete job');
    },
  });
}

export function useRescheduleMechanisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newDate }: { id: string; newDate: string }) => {
      const { error } = await supabase
        .from('mechanisation_jobs')
        .update({ scheduled_date: newDate })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mechanisationKeys.all });
      toast.success('Job rescheduled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reschedule job');
    },
  });
}
