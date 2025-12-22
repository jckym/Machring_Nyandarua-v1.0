// src/hooks/api/useSystemLogs.ts
import { useQuery } from '@tanstack/react-query';
import { logService, SystemLog } from '@/lib/api';

export interface DisplaySystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  module: string;
  message: string;
  userId?: string;
  userName?: string;
}

export const systemLogKeys = {
  all: ['system-logs'] as const,
  list: () => [...systemLogKeys.all, 'list'] as const,
};

export function useSystemLogs() {
  return useQuery({
    queryKey: systemLogKeys.list(),
    queryFn: () => logService.getSystemLogs(),
    select: (response) => {
      const logs = response?.data ?? [];
      return logs.map((log: SystemLog): DisplaySystemLog => ({
        id: log.id,
        timestamp: new Date(log.createdAt).toISOString(),
        level: log.level === 'error' || log.level === 'warning' || log.level === 'info' ? log.level : 'info',
        module: log.source,
        message: log.message,
        userId: log.userId,
        userName: log.userName,
      }));
    },
  });
}
