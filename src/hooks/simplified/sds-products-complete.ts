/**
 * SDS Products Complete React Query Hooks (Layer 5)
 * 
 * React Query hooks for SDS products complete data fetching following the 6-Layer Type Safety Chain
 * Uses the simplified API routes from Layer 4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SdsProductsComplete, SdsProductsCompleteCreate, SdsProductsCompleteUpdate, SdsProductsCompleteFilters } from '@/lib/schemas';

// ============================================================================
// QUERY KEYS FOR CACHE MANAGEMENT
// ============================================================================

export const sdsProductsCompleteKeys = {
  all: ['sds-products-complete'] as const,
  lists: () => [...sdsProductsCompleteKeys.all, 'list'] as const,
  list: (filters?: SdsProductsCompleteFilters) => [...sdsProductsCompleteKeys.lists(), filters] as const,
  details: () => [...sdsProductsCompleteKeys.all, 'detail'] as const,
  detail: (id: number) => [...sdsProductsCompleteKeys.details(), id] as const,
  search: (query: string, filters?: SdsProductsCompleteFilters) => [...sdsProductsCompleteKeys.all, 'search', query, filters] as const,
  category: (category: string, filters?: SdsProductsCompleteFilters) => [...sdsProductsCompleteKeys.all, 'category', category, filters] as const,
  productName: (productName: string) => [...sdsProductsCompleteKeys.all, 'productName', productName] as const,
};

// ============================================================================
// API HELPERS
// ============================================================================

const API_BASE = '/api/sds-products-complete';

interface ApiResponse<T> {
  ok?: boolean;
  data?: T;
  error?: { code: string; message: string };
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch multiple SDS products complete with filtering
 */
export function useSdsProductsCompleteQuery(filters?: SdsProductsCompleteFilters) {
  return useQuery({
    queryKey: sdsProductsCompleteKeys.list(filters),
    queryFn: async (): Promise<SdsProductsComplete[]> => {
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

      const result: ApiResponse<SdsProductsComplete[]> | SdsProductsComplete[] = await response.json();
      
      // Handle both array and ApiResponse formats
      if (Array.isArray(result)) {
        return result;
      }
      
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single SDS product complete by ID
 */
export function useSdsProductCompleteQuery(id?: number) {
  return useQuery({
    queryKey: sdsProductsCompleteKeys.detail(id!),
    queryFn: async (): Promise<SdsProductsComplete> => {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<SdsProductsComplete> = await response.json();
      
      if (!result.ok && result.error) {
        throw new Error(result.error.message || 'Failed to fetch SDS product complete');
      }
      
      return result.data!;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch SDS products complete by category
 */
export function useSdsProductsCompleteByCategoryQuery(category?: string, filters?: SdsProductsCompleteFilters) {
  return useQuery({
    queryKey: sdsProductsCompleteKeys.category(category!, filters),
    queryFn: async (): Promise<SdsProductsComplete[]> => {
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

      const result: ApiResponse<SdsProductsComplete[]> | SdsProductsComplete[] = await response.json();
      
      // Handle both array and ApiResponse formats
      if (Array.isArray(result)) {
        return result;
      }
      
      return result.data || [];
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new SDS product complete
 */
export function useCreateSdsProductComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SdsProductsCompleteCreate): Promise<SdsProductsComplete> => {
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

      const result: ApiResponse<SdsProductsComplete> = await response.json();
      
      if (!result.ok && result.error) {
        throw new Error(result.error.message || 'Failed to create SDS product complete');
      }
      
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sdsProductsCompleteKeys.all });
    },
  });
}

/**
 * Hook to update an existing SDS product complete
 */
export function useUpdateSdsProductComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SdsProductsCompleteUpdate }): Promise<SdsProductsComplete> => {
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

      const result: ApiResponse<SdsProductsComplete> = await response.json();
      
      if (!result.ok && result.error) {
        throw new Error(result.error.message || 'Failed to update SDS product complete');
      }
      
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sdsProductsCompleteKeys.all });
      queryClient.setQueryData(sdsProductsCompleteKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to delete a SDS product complete
 */
export function useDeleteSdsProductComplete() {
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
      queryClient.invalidateQueries({ queryKey: sdsProductsCompleteKeys.all });
      queryClient.removeQueries({ queryKey: sdsProductsCompleteKeys.detail(id) });
    },
  });
}

// ============================================================================
// CACHE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook to invalidate all SDS products complete queries
 */
export function useInvalidateSdsProductsComplete() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: sdsProductsCompleteKeys.all });
  };
}

/**
 * Hook to prefetch SDS products complete
 */
export function usePrefetchSdsProductsComplete() {
  const queryClient = useQueryClient();

  return (filters?: SdsProductsCompleteFilters) => {
    queryClient.prefetchQuery({
      queryKey: sdsProductsCompleteKeys.list(filters),
      queryFn: async (): Promise<SdsProductsComplete[]> => {
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
        const result: ApiResponse<SdsProductsComplete[]> | SdsProductsComplete[] = await response.json();
        
        // Handle both array and ApiResponse formats
        if (Array.isArray(result)) {
          return result;
        }
        
        return result.data || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}

