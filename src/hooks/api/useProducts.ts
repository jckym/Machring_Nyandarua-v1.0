// src/hooks/api/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  unit: string;
  unit_price: number;
  commission_per_unit: number;
  stock_quantity: number;
  min_stock_level: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  status?: string;
  search?: string;
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters = {}) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('name');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(p => ({
        ...p,
        // Legacy format
        sku: p.id.slice(0, 8).toUpperCase(),
        unitPrice: p.unit_price,
        commission: p.commission_per_unit,
        inStock: p.stock_quantity,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        sku: data.id.slice(0, 8).toUpperCase(),
        unitPrice: data.unit_price,
        commission: data.commission_per_unit,
        inStock: data.stock_quantity,
      };
    },
    enabled: !!id,
  });
}

export interface CreateProductDto {
  name: string;
  category: string;
  description?: string;
  unit?: string;
  unit_price: number;
  commission_per_unit?: number;
  stock_quantity?: number;
  min_stock_level?: number;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          category: data.category,
          description: data.description,
          unit: data.unit || 'kg',
          unit_price: data.unit_price,
          commission_per_unit: data.commission_per_unit || 0,
          stock_quantity: data.stock_quantity || 0,
          min_stock_level: data.min_stock_level || 10,
        })
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProductDto> }) => {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.category) updateData.category = data.category;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.unit) updateData.unit = data.unit;
      if (data.unit_price !== undefined) updateData.unit_price = data.unit_price;
      if (data.commission_per_unit !== undefined) updateData.commission_per_unit = data.commission_per_unit;
      if (data.stock_quantity !== undefined) updateData.stock_quantity = data.stock_quantity;
      if (data.min_stock_level !== undefined) updateData.min_stock_level = data.min_stock_level;

      const { data: product, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}

export function useUpdateProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: stock })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Stock updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update stock');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
}
