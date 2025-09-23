
import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CacheConfig {
  key: string;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

export const useOptimizedCache = () => {
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  });
  
  let queryClient;
  
  try {
    queryClient = useQueryClient();
  } catch (error) {
    console.warn('QueryClient not available in useOptimizedCache:', error);
    queryClient = null;
  }

  const optimizeCache = useCallback((config: CacheConfig) => {
    if (!queryClient) return;
    
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Nettoyage intelligent du cache
    queries.forEach(query => {
      if (query.isStale() && query.state.fetchStatus !== 'fetching') {
        const lastUsed = query.state.dataUpdatedAt;
        const now = Date.now();
        const maxAge = config.cacheTime || 300000; // 5 minutes par défaut
        
        if (now - lastUsed > maxAge) {
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      }
    });

    setCacheStats({
      hits: queries.filter(q => !q.isStale()).length,
      misses: queries.filter(q => q.isStale()).length,
      size: queries.length
    });
  }, [queryClient]);

  const prefetchData = useCallback((keys: string[]) => {
    if (!queryClient) return;
    
    keys.forEach(key => {
      queryClient.prefetchQuery({
        queryKey: [key],
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    });
  }, [queryClient]);

  const invalidateSmartly = useCallback((pattern: string) => {
    if (!queryClient) return;
    
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        );
      }
    });
  }, [queryClient]);

  return {
    optimizeCache,
    prefetchData,
    invalidateSmartly,
    cacheStats
  };
};
