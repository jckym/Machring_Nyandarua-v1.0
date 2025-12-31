// src/hooks/api/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  // From user_roles
  role: string;
  // From tot_assignments
  local_mr_id?: string;
  local_mr_name?: string;
}

export interface UserFilters {
  role?: string;
  localMrId?: string;
  status?: string;
  search?: string;
}

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters = {}) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch TOT assignments for local_mr mapping
      const { data: assignments, error: assignmentsError } = await supabase
        .from('tot_assignments')
        .select(`
          tot_id,
          local_mr_id,
          local_mrs!tot_assignments_local_mr_id_fkey(name)
        `)
        .eq('status', 'active');

      if (assignmentsError) throw assignmentsError;

      // Build user list with roles and assignments
      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      const assignmentsMap = new Map(
        assignments?.map(a => [a.tot_id, { local_mr_id: a.local_mr_id, local_mr_name: a.local_mrs?.name }]) || []
      );

      let users = (profiles || []).map(p => ({
        ...p,
        role: rolesMap.get(p.id) || 'tot',
        local_mr_id: assignmentsMap.get(p.id)?.local_mr_id,
        local_mr_name: assignmentsMap.get(p.id)?.local_mr_name,
        localMrId: assignmentsMap.get(p.id)?.local_mr_id,
      }));

      // Apply filters
      if (filters.role) {
        users = users.filter(u => u.role === filters.role);
      }
      if (filters.localMrId) {
        users = users.filter(u => u.local_mr_id === filters.localMrId);
      }
      if (filters.status) {
        users = users.filter(u => u.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        users = users.filter(u => 
          u.name.toLowerCase().includes(search) || 
          u.email.toLowerCase().includes(search)
        );
      }

      return users;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', id)
        .single();

      const { data: assignment } = await supabase
        .from('tot_assignments')
        .select(`
          local_mr_id,
          local_mrs!tot_assignments_local_mr_id_fkey(name)
        `)
        .eq('tot_id', id)
        .eq('status', 'active')
        .single();

      return {
        ...profile,
        role: roleData?.role || 'tot',
        local_mr_id: assignment?.local_mr_id,
        local_mr_name: assignment?.local_mrs?.name,
        localMrId: assignment?.local_mr_id,
      };
    },
    enabled: !!id,
  });
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  localMrId?: string;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserDto) => {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      const userId = authData.user.id;

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: data.role as any,
        });

      if (roleError) throw roleError;

      // If TOT or coordinator, assign to local MR
      if (data.localMrId && (data.role === 'tot' || data.role === 'local_mr_coordinator')) {
        const { error: assignmentError } = await supabase
          .from('tot_assignments')
          .insert({
            tot_id: userId,
            local_mr_id: data.localMrId,
            status: 'active',
          });

        if (assignmentError) throw assignmentError;
      }

      return { id: userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  localMrId?: string;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) => {
      // Update profile
      const profileUpdate: any = {};
      if (data.name) profileUpdate.name = data.name;
      if (data.email) profileUpdate.email = data.email;
      if (data.phone !== undefined) profileUpdate.phone = data.phone;
      if (data.status) profileUpdate.status = data.status;

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', id);

        if (profileError) throw profileError;
      }

      // Update role if changed
      if (data.role) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: id,
            role: data.role as any,
          }, { onConflict: 'user_id' });

        if (roleError) throw roleError;
      }

      // Update local MR assignment if needed
      if (data.localMrId !== undefined) {
        // Remove existing active assignments
        await supabase
          .from('tot_assignments')
          .update({ status: 'inactive' })
          .eq('tot_id', id)
          .eq('status', 'active');

        // Add new assignment if localMrId is provided
        if (data.localMrId) {
          const { error: assignmentError } = await supabase
            .from('tot_assignments')
            .insert({
              tot_id: id,
              local_mr_id: data.localMrId,
              status: 'active',
            });

          if (assignmentError) throw assignmentError;
        }
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete profile (will cascade to role and assignments if FK set up)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success(`User ${variables.status === 'active' ? 'activated' : 'deactivated'}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}
