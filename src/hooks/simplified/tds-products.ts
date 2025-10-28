/**
 * TDS Products React Query Hooks (Layer 5)
 * 
 * React Query hooks for TDS products data fetching following the 6-Layer Type Safety Chain
 * Uses the simplified API routes from Layer 4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TdsProducts, TdsProductsCreate, TdsProductsUpdate, TdsProductsFilters } from '@/lib/schemas';

// ============================================================================
// QUERY KEYS FOR CACHE MANAGEMENT
// ============================================================================

export const tdsProductsKeys = {
  all: ['tds-products'] as const,
  lists: () => [...tdsProductsKeys.all, 'list'] as const,
  list: (filters?: TdsProductsFilters) => [...tdsProductsKeys.lists(), filters] as const,
  details: () => [...tdsProductsKeys.all, 'detail'] as const,
  detail: (id: number) => [...tdsProductsKeys.details(), id] as const,
  search: (query: string, filters?: TdsProductsFilters) => [...tdsProductsKeys.all, 'search', query, filters] as const,
  documentId: (documentId: string) => [...tdsProductsKeys.all, 'documentId', documentId] as const,
  category: (category: string, filters?: TdsProductsFilters) => [...tdsProductsKeys.all, 'category', category, filters] as const,
};

// ============================================================================
// API HELPERS
// ============================================================================

const API_BASE = '/api/simplified/tds-products';

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
 * Hook to fetch multiple TDS products with filtering
 */
export function useTdsProductsQuery(filters?: TdsProductsFilters) {
  return useQuery({
    queryKey: tdsProductsKeys.list(filters),
    queryFn: async (): Promise<TdsProducts[]> => {
      const searchParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const queryString = searchParams.toString();
      const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TdsProducts[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch TDS products');
      }

      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single TDS product by ID
 */
export function useTdsProductQuery(id?: number) {
  return useQuery({
    queryKey: tdsProductsKeys.detail(id!),
    queryFn: async (): Promise<TdsProducts> => {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TdsProducts> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch TDS product');
      }

      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search TDS products by document ID
 */
export function useTdsProductByDocumentIdQuery(documentId?: string) {
  return useQuery({
    queryKey: tdsProductsKeys.documentId(documentId!),
    queryFn: async (): Promise<TdsProducts[]> => {
      const searchParams = new URLSearchParams();
      if (documentId) {
        searchParams.append('documentId', documentId);
      }

      const queryString = searchParams.toString();
      const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TdsProducts[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch TDS product by document ID');
      }

      return result.data;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch TDS products by category
 */
export function useTdsProductsByCategoryQuery(category?: string, filters?: TdsProductsFilters) {
  return useQuery({
    queryKey: tdsProductsKeys.category(category!, filters),
    queryFn: async (): Promise<TdsProducts[]> => {
      const searchParams = new URLSearchParams();
      
      if (category) {
        searchParams.append('category', category);
      }
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'category') {
            searchParams.append(key, value.toString());
          }
        });
      }

      const queryString = searchParams.toString();
      const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TdsProducts[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch TDS products by category');
      }

      return result.data;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new TDS product
 */
export function useCreateTdsProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TdsProductsCreate): Promise<TdsProducts> => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TdsProducts> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create TDS product');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tdsProductsKeys.all });
    },
  });
}

/**
 * Hook to update an existing TDS product
 */
export function useUpdateTdsProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TdsProductsUpdate }): Promise<TdsProducts> => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TdsProducts> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update TDS product');
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tdsProductsKeys.all });
      queryClient.setQueryData(tdsProductsKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to delete a TDS product
 */
export function useDeleteTdsProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || `HTTP error! status: ${response.status}`);
      }
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: tdsProductsKeys.all });
      queryClient.removeQueries({ queryKey: tdsProductsKeys.detail(id) });
    },
  });
}

// ============================================================================
// CACHE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook to invalidate all TDS products queries
 */
export function useInvalidateTdsProducts() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: tdsProductsKeys.all });
  };
}

/**
 * Hook to prefetch TDS products
 */
export function usePrefetchTdsProducts() {
  const queryClient = useQueryClient();

  return (filters?: TdsProductsFilters) => {
    queryClient.prefetchQuery({
      queryKey: tdsProductsKeys.list(filters),
      queryFn: async (): Promise<TdsProducts[]> => {
        const searchParams = new URLSearchParams();
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, value.toString());
            }
          });
        }

        const queryString = searchParams.toString();
        const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
        const response = await fetch(url);
        const result: ApiResponse<TdsProducts[]> = await response.json();
        return result.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}
