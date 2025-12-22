import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService, CreateSaleDto, UpdateSaleDto, SaleFilters } from '@/lib/api';
import { toast } from 'sonner';
import { Sale } from '@/types';

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (filters: SaleFilters) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  stats: (filters?: Record<string, string>) => [...saleKeys.all, 'stats', filters] as const,
  monthly: (year?: number) => [...saleKeys.all, 'monthly', year] as const,
};

export function useSales(filters?: SaleFilters) {
  return useQuery({
    queryKey: saleKeys.list(filters || {}),
    queryFn: () => saleService.getAll(filters),
    select: (response) => (response?.data ?? []) as Sale[],
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => saleService.getById(id),
    select: (response) => response?.data as Sale | undefined,
    enabled: !!id,
  });
}

export function useSalesStats(filters?: { localMrId?: string; totId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: saleKeys.stats(filters),
    queryFn: () => saleService.getStats(filters),
    select: (response) => response?.data,
  });
}

export function useMonthlySales(year?: number) {
  return useQuery({
    queryKey: saleKeys.monthly(year),
    queryFn: () => saleService.getMonthlyData(year),
    select: (response) => response?.data,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSaleDto) => saleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      toast.success('Sale recorded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create sale');
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSaleDto }) => 
      saleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.id) });
      toast.success('Sale updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update sale');
    },
  });
}

export function useCompleteSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => saleService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      toast.success('Sale completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete sale');
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      saleService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      toast.success('Sale cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel sale');
    },
  });
}
