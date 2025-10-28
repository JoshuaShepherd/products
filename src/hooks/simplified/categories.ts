/**
 * Categories React Query Hooks (Layer 5)
 * 
 * React Query hooks for categories data fetching following the 6-Layer Type Safety Chain
 * Uses the simplified API routes from Layer 4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Categories, CategoriesCreate, CategoriesUpdate, CategoriesFilters } from '@/lib/schemas';

// ============================================================================
// QUERY KEYS FOR CACHE MANAGEMENT
// ============================================================================

export const categoriesKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesKeys.all, 'list'] as const,
  list: (filters?: CategoriesFilters) => [...categoriesKeys.lists(), filters] as const,
  details: () => [...categoriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoriesKeys.details(), id] as const,
  roots: () => [...categoriesKeys.all, 'roots'] as const,
  children: (parentId: string) => [...categoriesKeys.all, 'children', parentId] as const,
};

// ============================================================================
// API HELPERS
// ============================================================================

const API_BASE = '/api/simplified/categories';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  count?: number;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch multiple categories with filtering
 */
export function useCategoriesQuery(filters?: CategoriesFilters) {
  return useQuery({
    queryKey: categoriesKeys.list(filters),
    queryFn: async (): Promise<Categories[]> => {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.parentId) params.append('parentId', filters.parentId);
      if (typeof filters?.isActive === 'boolean') {
        params.append('isActive', filters.isActive.toString());
      }

      const url = `${API_BASE}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Categories[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch categories');
      }
      
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
    retry: 2,
  });
}

/**
 * Hook to fetch root categories (no parent)
 */
export function useRootCategoriesQuery(filters?: Omit<CategoriesFilters, 'parentId'>) {
  return useQuery({
    queryKey: categoriesKeys.roots(),
    queryFn: async (): Promise<Categories[]> => {
      const params = new URLSearchParams({ rootOnly: 'true' });
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (typeof filters?.isActive === 'boolean') {
        params.append('isActive', filters.isActive.toString());
      }

      const url = `${API_BASE}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Categories[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch root categories');
      }
      
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch child categories of a parent
 */
export function useChildCategoriesQuery(parentId: string, filters?: Omit<CategoriesFilters, 'parentId'>) {
  return useQuery({
    queryKey: categoriesKeys.children(parentId),
    queryFn: async (): Promise<Categories[]> => {
      const params = new URLSearchParams({ parentId });
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (typeof filters?.isActive === 'boolean') {
        params.append('isActive', filters.isActive.toString());
      }

      const url = `${API_BASE}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Categories[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch child categories');
      }
      
      return result.data;
    },
    enabled: !!parentId, // Only run if parentId is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategoryQuery(id: string) {
  return useQuery({
    queryKey: categoriesKeys.detail(id),
    queryFn: async (): Promise<Categories> => {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Category not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Categories> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch category');
      }
      
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CategoriesCreate): Promise<Categories> => {
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
      
      const result: ApiResponse<Categories> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create category');
      }
      
      return result.data;
    },
    onSuccess: (newCategory) => {
      // Invalidate and refetch categories lists
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.roots() });
      
      // If category has a parent, invalidate children queries
      if (newCategory.parentId) {
        queryClient.invalidateQueries({ queryKey: categoriesKeys.children(newCategory.parentId) });
      }
      
      // Add the new category to the cache
      queryClient.setQueryData(categoriesKeys.detail(newCategory.id), newCategory);
    },
  });
}

/**
 * Hook to update an existing category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoriesUpdate }): Promise<Categories> => {
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
      
      const result: ApiResponse<Categories> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update category');
      }
      
      return result.data;
    },
    onSuccess: (updatedCategory) => {
      // Update the specific category in cache
      queryClient.setQueryData(categoriesKeys.detail(updatedCategory.id), updatedCategory);
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.roots() });
      
      // If category has a parent, invalidate children queries
      if (updatedCategory.parentId) {
        queryClient.invalidateQueries({ queryKey: categoriesKeys.children(updatedCategory.parentId) });
      }
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
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
        throw new Error(result.error?.message || 'Failed to delete category');
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove the category from cache
      queryClient.removeQueries({ queryKey: categoriesKeys.detail(deletedId) });
      
      // Invalidate all category lists
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.roots() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to invalidate all categories data (useful for bulk operations)
 */
export function useInvalidateCategories() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
  };
}

/**
 * Hook to prefetch categories (useful for performance optimization)
 */
export function usePrefetchCategories() {
  const queryClient = useQueryClient();
  
  return (filters?: CategoriesFilters) => {
    queryClient.prefetchQuery({
      queryKey: categoriesKeys.list(filters),
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        // ... add other filters as needed
        
        const queryString = params.toString();
        const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
        const response = await fetch(url);
        const result: ApiResponse<Categories[]> = await response.json();
        return result.data;
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Hook for hierarchical category tree management
 */
export function useCategoryTree(rootId?: string) {
  const rootQuery = useRootCategoriesQuery();
  const specificQuery = useCategoryQuery(rootId || '');
  
  // This hook can be extended to build full tree structures
  // For now, it provides the basic building blocks
  
  return {
    roots: rootQuery.data || [],
    isLoading: rootQuery.isLoading || (rootId ? specificQuery.isLoading : false),
    error: rootQuery.error || (rootId ? specificQuery.error : null),
  };
}
