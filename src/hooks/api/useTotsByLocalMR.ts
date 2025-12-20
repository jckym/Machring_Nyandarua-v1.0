// src/hooks/api/useTots.ts
import { useQuery } from '@tanstack/react-query';
import { totService } from '@/lib/api';

export function useTotsByLocalMR(localMrId: string) {
  return useQuery({
    queryKey: ['tots', 'localMr', localMrId],
    queryFn: () => totService.getByLocalMR(localMrId),
    enabled: !!localMrId,
  });
}
