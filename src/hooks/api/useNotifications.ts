import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, NotificationFilters } from '@/lib/api';
import { toast } from 'sonner';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  mine: () => [...notificationKeys.all, 'mine'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: notificationKeys.list(filters || {}),
    queryFn: () => notificationService.getAll(filters),
  });
}

export function useMyNotifications(filters?: Omit<NotificationFilters, 'userId'>) {
  return useQuery({
    queryKey: notificationKeys.mine(),
    queryFn: () => notificationService.getMyNotifications(filters),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkMultipleAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => notificationService.markMultipleAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notifications marked as read');
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications marked as read');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteMultipleNotifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => notificationService.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notifications deleted');
    },
  });
}
