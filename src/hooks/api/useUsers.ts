// src/hooks/api/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, CreateUserDto, UpdateUserDto, UserFilters } from '@/lib/api';
import { toast } from 'sonner';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters = {}) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Fetch users list - supports filtering by role, localMrId, status
 */
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters || {}),
    queryFn: () => userService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch single user
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create user (admin creates TOT/Manager)
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.create(data),
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      const previousUsers = queryClient.getQueryData(userKeys.lists());

      // Optimistically add
      queryClient.setQueryData(userKeys.lists(), (old: any[] = []) => [
        { ...newUser, _id: 'temp-id', status: 'active', createdAt: new Date() },
        ...old,
      ]);

      return { previousUsers };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User created successfully');
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(userKeys.lists(), context.previousUsers);
      }
      toast.error(error.message || 'Failed to create user');
    },
  });
}

/**
 * Update user (name, phone, role, localMrId)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      const previousUser = queryClient.getQueryData(userKeys.detail(id));
      const previousList = queryClient.getQueryData(userKeys.lists());

      // Optimistically update detail
      queryClient.setQueryData(userKeys.detail(id), (old: any) => ({ ...old, ...data }));

      // Optimistically update list
      queryClient.setQueryData(userKeys.lists(), (old: any[] = []) =>
        old.map((u) => (u._id === id ? { ...u, ...data } : u))
      );

      return { previousUser, previousList };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      toast.success('User updated successfully');
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(variables.id), context.previousUser);
      }
      if (context?.previousList) {
        queryClient.setQueryData(userKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to update user');
    },
  });
}

/**
 * Delete user (admin only)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      const previousList = queryClient.getQueryData(userKeys.lists());

      queryClient.setQueryData(userKeys.lists(), (old: any[] = []) =>
        old.filter((u) => u._id !== id)
      );

      return { previousList };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User deleted successfully');
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(userKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to delete user');
    },
  });
}

/**
 * Toggle user status (active/inactive)
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      userService.update(id, { status }),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      const previousList = queryClient.getQueryData(userKeys.lists());
      const previousDetail = queryClient.getQueryData(userKeys.detail(id));

      // Optimistically toggle
      queryClient.setQueryData(userKeys.lists(), (old: any[] = []) =>
        old.map((u) => (u._id === id ? { ...u, status } : u))
      );
      queryClient.setQueryData(userKeys.detail(id), (old: any) => ({ ...old, status }));

      return { previousList, previousDetail };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success(`User ${variables.status === 'active' ? 'activated' : 'deactivated'}`);
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(userKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(userKeys.detail(variables.id), context.previousDetail);
      }
      toast.error(error.message || 'Failed to update status');
    },
  });
}
