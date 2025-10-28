/**
 * SDS Products React Query Hooks (Layer 5)
 * 
 * React Query hooks for SDS products data fetching following the 6-Layer Type Safety Chain
 * Uses the simplified API routes from Layer 4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SdsProducts, SdsProductsCreate, SdsProductsUpdate, SdsProductsFilters } from '@/lib/schemas';

// ============================================================================
// QUERY KEYS FOR CACHE MANAGEMENT
// ============================================================================

export const sdsProductsKeys = {
  all: ['sds-products'] as const,
  lists: () => [...sdsProductsKeys.all, 'list'] as const,
  list: (filters?: SdsProductsFilters) => [...sdsProductsKeys.lists(), filters] as const,
  details: () => [...sdsProductsKeys.all, 'detail'] as const,
  detail: (id: number) => [...sdsProductsKeys.details(), id] as const,
  search: (query: string, filters?: SdsProductsFilters) => [...sdsProductsKeys.all, 'search', query, filters] as const,
  documentId: (documentId: string) => [...sdsProductsKeys.all, 'documentId', documentId] as const,
  category: (category: string, filters?: SdsProductsFilters) => [...sdsProductsKeys.all, 'category', category, filters] as const,
  manufacturer: (manufacturer: string, filters?: SdsProductsFilters) => [...sdsProductsKeys.all, 'manufacturer', manufacturer, filters] as const,
  fileName: (fileName: string) => [...sdsProductsKeys.all, 'fileName', fileName] as const,
};

// ============================================================================
// API HELPERS
// ============================================================================

const API_BASE = '/api/simplified/sds-products';

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
 * Hook to fetch multiple SDS products with filtering
 */
export function useSdsProductsQuery(filters?: SdsProductsFilters) {
  return useQuery({
    queryKey: sdsProductsKeys.list(filters),
    queryFn: async (): Promise<SdsProducts[]> => {
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

      const result: ApiResponse<SdsProducts[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch SDS products');
      }

      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single SDS product by ID
 */
export function useSdsProductQuery(id?: number) {
  return useQuery({
    queryKey: sdsProductsKeys.detail(id!),
    queryFn: async (): Promise<SdsProducts> => {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<SdsProducts> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch SDS product');
      }

      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search SDS products by document ID
 */
export function useSdsProductByDocumentIdQuery(documentId?: string) {
  return useQuery({
    queryKey: sdsProductsKeys.documentId(documentId!),
    queryFn: async (): Promise<SdsProducts[]> => {
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

      const result: ApiResponse<SdsProducts[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch SDS product by document ID');
      }

      return result.data;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch SDS products by category
 */
export function useSdsProductsByCategoryQuery(category?: string, filters?: SdsProductsFilters) {
  return useQuery({
    queryKey: sdsProductsKeys.category(category!, filters),
    queryFn: async (): Promise<SdsProducts[]> => {
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

      const result: ApiResponse<SdsProducts[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch SDS products by category');
      }

      return result.data;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch SDS products by manufacturer
 */
export function useSdsProductsByManufacturerQuery(manufacturer?: string, filters?: SdsProductsFilters) {
  return useQuery({
    queryKey: sdsProductsKeys.manufacturer(manufacturer!, filters),
    queryFn: async (): Promise<SdsProducts[]> => {
      const searchParams = new URLSearchParams();
      
      if (manufacturer) {
        searchParams.append('manufacturer', manufacturer);
      }
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'manufacturer') {
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

      const result: ApiResponse<SdsProducts[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch SDS products by manufacturer');
      }

      return result.data;
    },
    enabled: !!manufacturer,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search SDS products by file name
 */
export function useSdsProductByFileNameQuery(fileName?: string) {
  return useQuery({
    queryKey: sdsProductsKeys.fileName(fileName!),
    queryFn: async (): Promise<SdsProducts[]> => {
      const searchParams = new URLSearchParams();
      if (fileName) {
        searchParams.append('fileName', fileName);
      }

      const queryString = searchParams.toString();
      const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<SdsProducts[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch SDS product by file name');
      }

      return result.data;
    },
    enabled: !!fileName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new SDS product
 */
export function useCreateSdsProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SdsProductsCreate): Promise<SdsProducts> => {
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

      const result: ApiResponse<SdsProducts> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create SDS product');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sdsProductsKeys.all });
    },
  });
}

/**
 * Hook to update an existing SDS product
 */
export function useUpdateSdsProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SdsProductsUpdate }): Promise<SdsProducts> => {
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

      const result: ApiResponse<SdsProducts> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update SDS product');
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sdsProductsKeys.all });
      queryClient.setQueryData(sdsProductsKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to delete a SDS product
 */
export function useDeleteSdsProduct() {
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
      queryClient.invalidateQueries({ queryKey: sdsProductsKeys.all });
      queryClient.removeQueries({ queryKey: sdsProductsKeys.detail(id) });
    },
  });
}

// ============================================================================
// CACHE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook to invalidate all SDS products queries
 */
export function useInvalidateSdsProducts() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: sdsProductsKeys.all });
  };
}

/**
 * Hook to prefetch SDS products
 */
export function usePrefetchSdsProducts() {
  const queryClient = useQueryClient();

  return (filters?: SdsProductsFilters) => {
    queryClient.prefetchQuery({
      queryKey: sdsProductsKeys.list(filters),
      queryFn: async (): Promise<SdsProducts[]> => {
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
        const result: ApiResponse<SdsProducts[]> = await response.json();
        return result.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}
