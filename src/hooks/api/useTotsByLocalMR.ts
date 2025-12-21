// src/hooks/api/useTotsByLocalMR.ts
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/api';

export function useTotsByLocalMR(localMrId: string) {
  return useQuery({
    queryKey: ['tots', 'localMr', localMrId],
    queryFn: async () => {
      // Filter users by localMrId and role 'tot'
      const response = await userService.getAll({ localMrId, role: 'tot' });
      return response;
    },
    enabled: !!localMrId,
  });
}
