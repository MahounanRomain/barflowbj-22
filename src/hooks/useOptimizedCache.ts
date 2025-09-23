
import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import { useQueryClient } from '@tanstack/react-query';

interface CacheConfig {
  key: string;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

export const useOptimizedCache = () => {
  const queryClient = useQueryClient();
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  });

  const optimizeCache = useCallback((config: CacheConfig) => {
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
    keys.forEach(key => {
      queryClient.prefetchQuery({
        queryKey: [key],
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    });
  }, [queryClient]);

  const invalidateSmartly = useCallback((pattern: string) => {
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
