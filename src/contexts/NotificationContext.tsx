// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/lib/api';
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

  // Fetch notifications from API - unwrap ApiResponse
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationService.getAll();
      return response.data || [];
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const response = await notificationService.create(data as any);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification added');
    },
    onError: () => {
      toast.error('Failed to add notification');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationService.markAsRead(id);
      return response.data;
    },
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
    mutationFn: async () => {
      const response = await notificationService.markAllAsRead();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationService.delete(id);
      return response.data;
    },
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
