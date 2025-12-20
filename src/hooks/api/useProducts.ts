// src/hooks/api/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, CreateProductDto, UpdateProductDto, ProductFilters } from '@/lib/api';
import { toast } from 'sonner';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters = {}) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  performance: () => [...productKeys.all, 'performance'] as const,
};

/**
 * Fetch products list - supports filtering (e.g., category, inStock)
 */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters || {}),
    queryFn: () => productService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch single product
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch product performance (for charts/dashboard)
 */
export function useProductPerformance() {
  return useQuery({
    queryKey: productKeys.performance(),
    queryFn: () => productService.getPerformance(),
    staleTime: 1000 * 60 * 15, // Performance changes less frequently
    cacheTime: 1000 * 60 * 30,
  });
}

/**
 * Create product (admin only)
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productService.create(data),
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousProducts = queryClient.getQueryData(productKeys.lists());

      // Optimistically add
      queryClient.setQueryData(productKeys.lists(), (old: any[] = []) => [
        { ...newProduct, _id: 'temp-id', inStock: 0 },
        ...old,
      ]);

      return { previousProducts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.performance() });
      toast.success('Product created successfully');
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts);
      }
      toast.error(error.message || 'Failed to create product');
    },
  });
}

/**
 * Update product (price, commission, name, etc.)
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productService.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousProduct = queryClient.getQueryData(productKeys.detail(id));
      const previousList = queryClient.getQueryData(productKeys.lists());

      // Optimistically update detail
      queryClient.setQueryData(productKeys.detail(id), (old: any) => ({ ...old, ...data }));

      // Optimistically update list
      queryClient.setQueryData(productKeys.lists(), (old: any[] = []) =>
        old.map((p) => (p._id === id ? { ...p, ...data } : p))
      );

      return { previousProduct, previousList };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.performance() }); // Commission/price changes affect charts
      toast.success('Product updated successfully');
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(variables.id), context.previousProduct);
      }
      if (context?.previousList) {
        queryClient.setQueryData(productKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to update product');
    },
  });
}

/**
 * Update product stock (frequent operation)
 */
export function useUpdateProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      productService.updateStock(id, stock),

    onMutate: async ({ id, stock }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousList = queryClient.getQueryData(productKeys.lists());
      const previousDetail = queryClient.getQueryData(productKeys.detail(id));

      // Optimistically update stock
      queryClient.setQueryData(productKeys.lists(), (old: any[] = []) =>
        old.map((p) => (p._id === id ? { ...p, inStock: stock } : p))
      );
      queryClient.setQueryData(productKeys.detail(id), (old: any) => ({ ...old, inStock: stock }));

      return { previousList, previousDetail };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Stock updated successfully');
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(productKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(productKeys.detail(variables.id), context.previousDetail);
      }
      toast.error(error.message || 'Failed to update stock');
    },
  });
}

/**
 * Delete product (admin only)
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousList = queryClient.getQueryData(productKeys.lists());

      queryClient.setQueryData(productKeys.lists(), (old: any[] = []) =>
        old.filter((p) => p._id !== id)
      );

      return { previousList };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.performance() });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(productKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to delete product');
    },
  });
}
