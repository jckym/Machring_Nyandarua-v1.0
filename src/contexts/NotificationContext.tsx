import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Notification } from '@/types';

// Embedded fallback notifications data
const fallbackNotifications: Notification[] = [
  { id: 'notif-1', type: 'mechanisation_pending', title: 'Mechanisation Approval Required', message: 'Grace Wangui has requested harvesting service', read: false, createdAt: new Date('2025-06-15'), localMrId: 'mr-3', localMrName: 'Eldoret Valley MR' },
  { id: 'notif-2', type: 'sale_completed', title: 'Sale Completed', message: 'Peter Kamau purchased Maize Seeds', read: false, createdAt: new Date('2025-06-15'), localMrId: 'mr-1', localMrName: 'Nakuru Central MR' },
  { id: 'notif-3', type: 'training_reminder', title: 'Training Tomorrow', message: 'Soil Health Management training scheduled', read: true, createdAt: new Date('2025-06-19'), localMrId: 'mr-1', localMrName: 'Nakuru Central MR' },
  { id: 'notif-4', type: 'support_request', title: 'Support Request', message: 'TOT Samuel Mwangi reported login issue', read: false, createdAt: new Date('2025-06-14'), reportedBy: 'tot-1', issueType: 'Technical', resolutionStatus: 'pending' },
];

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(fallbackNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
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

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
