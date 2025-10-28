/**
 * Products React Query Hooks (Layer 5)
 * 
 * React Query hooks for products data fetching following the 6-Layer Type Safety Chain
 * Uses the simplified API routes from Layer 4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Products, ProductsCreate, ProductsUpdate, ProductsFilters } from '@/lib/schemas';

// ============================================================================
// QUERY KEYS FOR CACHE MANAGEMENT
// ============================================================================

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters?: ProductsFilters) => [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
  search: (query: string, filters?: ProductsFilters) => [...productsKeys.all, 'search', query, filters] as const,
};

// ============================================================================
// API HELPERS
// ============================================================================

const API_BASE = '/api/simplified/products';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    count: number;
    totalCount: number;
    totalPages: number;
  };
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch multiple products with filtering
 */
export function useProductsQuery(filters?: ProductsFilters) {
  return useQuery({
    queryKey: productsKeys.list(filters),
    queryFn: async (): Promise<Products[]> => {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.signalWord) params.append('signalWord', filters.signalWord);
      if (filters?.hazardClass) params.append('hazardClass', filters.hazardClass);
      if (typeof filters?.isActive === 'boolean') {
        params.append('isActive', filters.isActive.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Products[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch products');
      }
      
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a single product by ID
 */
export function useProductQuery(id: string) {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: async (): Promise<Products> => {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Products> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch product');
      }
      
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to search products
 */
export function useProductsSearchQuery(query: string, filters?: ProductsFilters) {
  return useQuery({
    queryKey: productsKeys.search(query, filters),
    queryFn: async (): Promise<Products[]> => {
      const params = new URLSearchParams({ q: query });
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.signalWord) params.append('signalWord', filters.signalWord);
      if (filters?.hazardClass) params.append('hazardClass', filters.hazardClass);
      if (typeof filters?.isActive === 'boolean') {
        params.append('isActive', filters.isActive.toString());
      }

      const url = `${API_BASE}/search?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Products[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to search products');
      }
      
      return result.data;
    },
    enabled: query.length > 0, // Only run query if search term provided
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 2,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProductsCreate): Promise<Products> => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Products> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create product');
      }
      
      return result.data;
    },
    onSuccess: (newProduct) => {
      // Invalidate and refetch products lists
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      
      // Add the new product to the cache
      queryClient.setQueryData(productsKeys.detail(newProduct.id), newProduct);
    },
  });
}

/**
 * Hook to update an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductsUpdate }): Promise<Products> => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Products> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update product');
      }
      
      return result.data;
    },
    onSuccess: (updatedProduct) => {
      // Update the specific product in cache
      queryClient.setQueryData(productsKeys.detail(updatedProduct.id), updatedProduct);
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete product');
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove the product from cache
      queryClient.removeQueries({ queryKey: productsKeys.detail(deletedId) });
      
      // Invalidate lists to refetch without deleted product
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

// ============================================================================
// BULK OPERATION HOOKS
// ============================================================================

/**
 * Hook to invalidate all products data (useful for bulk operations)
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: productsKeys.all });
  };
}

/**
 * Hook to prefetch products (useful for performance optimization)
 */
export function usePrefetchProducts() {
  const queryClient = useQueryClient();
  
  return (filters?: ProductsFilters) => {
    queryClient.prefetchQuery({
      queryKey: productsKeys.list(filters),
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        // ... add other filters as needed
        
        const queryString = params.toString();
        const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
        const response = await fetch(url);
        const result: ApiResponse<Products[]> = await response.json();
        return result.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
