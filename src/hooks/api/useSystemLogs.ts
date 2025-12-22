// hooks/api/useSystemLogs.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useSystemLogs = () => {
  return useQuery({
    queryKey: ['system-logs'],
    queryFn: async () => {
      const res = await axios.get('/api/system-logs');
      return res.data;
    },
  });
};
