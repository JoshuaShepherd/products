/**
 * React Query Provider (Layer 5)
 * 
 * Provider setup for React Query following the 6-Layer Type Safety Chain
 * Provides global configuration for data fetching and caching
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time - how long data is considered fresh
        staleTime: 60 * 1000, // 1 minute
        
        // Default cache time - how long data stays in cache after being unused
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        
        // Retry configuration
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && error.message.includes('40')) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch configuration
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnReconnect: true, // Refetch when network reconnects
        refetchOnMount: true, // Refetch when component mounts
      },
      mutations: {
        // Retry mutations on network errors
        retry: (failureCount, error) => {
          // Don't retry on validation errors (4xx)
          if (error instanceof Error && error.message.includes('40')) {
            return false;
          }
          // Retry once for 5xx errors
          return failureCount < 1;
        },
        
        // Retry delay for mutations
        retryDelay: 1000,
      },
    },
  });
}

// Create a stable query client instance
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Export the query client for use in other parts of the app
export const queryClient = getQueryClient();

// ============================================================================
// REACT QUERY PROVIDER COMPONENT
// ============================================================================

interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create a stable query client instance for this provider
  const [client] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Utility function to invalidate all queries
 * Useful for logout or major data changes
 */
export function invalidateAllQueries() {
  return queryClient.invalidateQueries();
}

/**
 * Utility function to clear all query cache
 * Useful for logout scenarios
 */
export function clearAllQueries() {
  return queryClient.clear();
}

/**
 * Utility function to prefetch multiple queries
 * Useful for performance optimization on route changes
 */
export async function prefetchQueries(prefetchFunctions: (() => Promise<void>)[]) {
  await Promise.all(prefetchFunctions.map(fn => fn()));
}

/**
 * Global error handler for query errors
 * Can be extended to integrate with error tracking services
 */
export function handleQueryError(error: unknown) {
  console.error('Query error:', error);
  
  // Here you could integrate with error tracking services like:
  // - Sentry
  // - LogRocket  
  // - Custom error reporting
  
  // Example:
  // if (typeof window !== 'undefined') {
  //   // Only run in browser
  //   window.Sentry?.captureException(error);
  // }
}
