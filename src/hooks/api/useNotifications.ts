// src/hooks/api/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, NotificationFilters } from '@/lib/api';
import { toast } from 'sonner';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationFilters = {}) => [...notificationKeys.lists(), filters] as const,
  mine: () => [...notificationKeys.all, 'mine'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

/**
 * Fetch all notifications (admin view - with filters)
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: notificationKeys.list(filters || {}),
    queryFn: () => notificationService.getAll(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch current user's notifications (TOT/Manager/Admin personal inbox)
 */
export function useMyNotifications(filters?: Omit<NotificationFilters, 'userId'>) {
  return useQuery({
    queryKey: notificationKeys.mine(),
    queryFn: () => notificationService.getMyNotifications(filters),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 60000, // Poll every minute
  });
}

/**
 * Real-time unread count for bell badge
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Every 30 seconds
    staleTime: 10000,
  });
}

/**
 * Mark single notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Optimistically update my notifications
      queryClient.setQueryData(notificationKeys.mine(), (old: any[] = []) =>
        old.map(n => (n.id === id ? { ...n, read: true } : n))
      );

      // Optimistically decrement unread count
      queryClient.setQueryData(notificationKeys.unreadCount(), (old: number = 0) =>
        old > 0 ? old - 1 : 0
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error) => {
      toast.error('Failed to mark as read');
      console.error(error);
    },
  });
}

/**
 * Mark multiple as read
 */
export function useMarkMultipleAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => notificationService.markMultipleAsRead(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousCount = queryClient.getQueryData<number>(notificationKeys.unreadCount()) || 0;

      queryClient.setQueryData(notificationKeys.mine(), (old: any[] = []) =>
        old.map(n => (ids.includes(n.id) ? { ...n, read: true } : n))
      );

      queryClient.setQueryData(notificationKeys.unreadCount(), previousCount - ids.length);

      return { previousCount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notifications marked as read');
    },
    onError: (_, __, context) => {
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(notificationKeys.unreadCount(), context.previousCount);
      }
      toast.error('Failed to update notifications');
    },
  });
}

/**
 * Mark all as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all as read');
    },
  });
}

/**
 * Delete single notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notification deleted');
    },
    onError: () => {
      toast.error('Failed to delete notification');
    },
  });
}

/**
 * Delete multiple notifications
 */
export function useDeleteMultipleNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => notificationService.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notifications deleted');
    },
    onError: () => {
      toast.error('Failed to delete notifications');
    },
  });
}
