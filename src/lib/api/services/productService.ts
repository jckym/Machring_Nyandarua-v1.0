import { apiClient, ApiResponse, buildQueryParams } from '../client';
import { Product, ProductCategory } from '@/types';

export interface CreateProductDto {
  name: string;
  sku: string;
  inStock: number;
  unitPrice: number;
  description: string;
  commission: number;
  category: ProductCategory;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  inStock?: number;
  unitPrice?: number;
  description?: string;
  commission?: number;
  category?: ProductCategory;
  imageUrl?: string;
}

export interface ProductFilters {
  category?: ProductCategory;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  // Get all products with optional filters
  async getAll(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
    const query = filters ? buildQueryParams(filters as Record<string, unknown>) : '';
    const response = await apiClient.get<ApiResponse<Product[]>>(`/products${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single product by ID
  async getById(id: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  // Create new product
  async create(data: CreateProductDto): Promise<ApiResponse<Product>> {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data;
  },

  // Update product
  async update(id: string, data: UpdateProductDto): Promise<ApiResponse<Product>> {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  // Update stock only
  async updateStock(id: string, stock: number): Promise<ApiResponse<Product>> {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/stock`, { inStock: stock });
    return response.data;
  },

  // Delete product
  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/products/${id}`);
    return response.data;
  },

  // Get products by category
  async getByCategory(category: ProductCategory): Promise<ApiResponse<Product[]>> {
    return this.getAll({ category });
  },

  // Get product performance metrics
  async getPerformance(): Promise<ApiResponse<Array<{
    productId: string;
    productName: string;
    totalSold: number;
    totalRevenue: number;
    totalCommission: number;
  }>>> {
    const response = await apiClient.get<ApiResponse<Array<{
      productId: string;
      productName: string;
      totalSold: number;
      totalRevenue: number;
      totalCommission: number;
    }>>>('/products/performance');
    return response.data;
  },
};
