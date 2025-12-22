// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/lib/api'; // Your API service
import { Notification } from '@/types';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: unknown;
  addNotification: (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch notifications from API
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) =>
      notificationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification added');
    },
    onError: () => {
      toast.error('Failed to add notification');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);

      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map(n => (n.id === id ? { ...n, read: true } : n))
      );

      return { previous };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['notifications'], context?.previous);
      toast.error('Failed to mark as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
  });

  const addNotification = (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    addMutation.mutate(data);
  };

  const markAsRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const deleteNotification = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
