import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import React, { useCallback, useMemo } from 'react';

interface UseOptimizedQueryOptions<T> {
  queryKey: (string | number)[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retryDelay?: number;
  select?: (data: T) => any;
}

export function useOptimizedQuery<T>(options: UseOptimizedQueryOptions<T>) {
  const queryClient = useQueryClient();

  // Optimisations par défaut
  const optimizedOptions = useMemo(() => ({
    staleTime: 5 * 60 * 1000, // 5 minutes par défaut
    cacheTime: 10 * 60 * 1000, // 10 minutes par défaut
    refetchOnWindowFocus: false,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  }), [options]);

  const query = useQuery(optimizedOptions);

  // Préchargement intelligent
  const prefetch = useCallback((newQueryKey?: (string | number)[]) => {
    const keyToUse = newQueryKey || options.queryKey;
    queryClient.prefetchQuery({
      queryKey: keyToUse,
      queryFn: options.queryFn,
      staleTime: optimizedOptions.staleTime,
    });
  }, [queryClient, options.queryKey, options.queryFn, optimizedOptions.staleTime]);

  // Invalidation optimisée
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: options.queryKey });
  }, [queryClient, options.queryKey]);

  // Mise à jour optimiste
  const optimisticUpdate = useCallback((updater: (oldData: T | undefined) => T) => {
    queryClient.setQueryData(options.queryKey, updater);
  }, [queryClient, options.queryKey]);

  return {
    ...query,
    prefetch,
    invalidate,
    optimisticUpdate,
  };
}

// Hook pour les mutations optimisées
export function useOptimizedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: (string | number)[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalider les queries spécifiées
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
}