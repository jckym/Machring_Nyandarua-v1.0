// src/hooks/api/useSales.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Sale {
  id: string;
  farmer_id: string;
  product_id: string;
  tot_id: string;
  local_mr_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  commission_per_unit: number;
  commission_amount: number;
  commission_paid: boolean;
  commission_paid_at: string | null;
  payment_status: string;
  payment_method: string | null;
  notes: string | null;
  sale_date: string;
  created_at: string;
  updated_at: string;
  // Joined
  farmer_name?: string;
  product_name?: string;
  tot_name?: string;
  local_mr_name?: string;
}

export interface SaleFilters {
  localMrId?: string;
  totId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (filters: SaleFilters = {}) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
};

export function useSales(filters: SaleFilters = {}) {
  return useQuery({
    queryKey: saleKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          *,
          farmers!sales_farmer_id_fkey(name),
          products!sales_product_id_fkey(name),
          local_mrs!sales_local_mr_id_fkey(name)
        `)
        .order('sale_date', { ascending: false });

      if (filters.localMrId) {
        query = query.eq('local_mr_id', filters.localMrId);
      }
      if (filters.totId) {
        query = query.eq('tot_id', filters.totId);
      }
      if (filters.status) {
        query = query.eq('payment_status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('sale_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('sale_date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((s: any) => ({
        ...s,
        farmerName: s.farmers?.name || '',
        productName: s.products?.name || '',
        localMrName: s.local_mrs?.name || '',
        farmerId: s.farmer_id,
        productId: s.product_id,
        totId: s.tot_id,
        localMrId: s.local_mr_id,
        total: s.total_amount,
        commissionAmount: s.commission_amount,
        status: s.payment_status,
        date: s.sale_date,
      }));
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          farmers!sales_farmer_id_fkey(name),
          products!sales_product_id_fkey(name),
          local_mrs!sales_local_mr_id_fkey(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        farmerName: data.farmers?.name || '',
        productName: data.products?.name || '',
        localMrName: data.local_mrs?.name || '',
        total: data.total_amount,
        commissionAmount: data.commission_amount,
        status: data.payment_status,
        date: data.sale_date,
      };
    },
    enabled: !!id,
  });
}

export interface CreateSaleDto {
  farmer_id: string;
  product_id: string;
  tot_id: string;
  local_mr_id: string;
  quantity: number;
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSaleDto) => {
      // The database trigger handles commission calculation
      const { data: sale, error } = await supabase
        .from('sales')
        .insert({
          farmer_id: data.farmer_id,
          product_id: data.product_id,
          tot_id: data.tot_id,
          local_mr_id: data.local_mr_id,
          quantity: data.quantity,
          // These will be calculated by the trigger
          unit_price: 0,
          total_amount: 0,
          commission_per_unit: 0,
          commission_amount: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      toast.success('Sale recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create sale');
    },
  });
}

export function useCompleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .update({ payment_status: 'completed' })
        .eq('id', id);

      if (error) throw error;
    },
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
    mutationFn: async ({ id }: { id: string; reason?: string }) => {
      const { error } = await supabase
        .from('sales')
        .update({ payment_status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      toast.success('Sale cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel sale');
    },
  });
}
