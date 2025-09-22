
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { usePerformanceOptimization } from './usePerformanceOptimization';

export const useOptimizedPerformance = <T>(
  data: T,
  dependencies: readonly unknown[] = [],
  options: {
    shouldMemoize?: boolean;
    debounceMs?: number;
    throttleMs?: number;
  } = {}
) => {
  const { useDebounce, useThrottle, measurePerformance } = usePerformanceOptimization();
  const { shouldMemoize = true, debounceMs = 300, throttleMs = 100 } = options;

  // Mémoriser les données si nécessaire
  const memoizedData = useMemo(() => {
    if (!shouldMemoize) return data;
    
    return measurePerformance('data-memoization', () => data);
  }, dependencies);

  // Créer des callbacks optimisés
  const createOptimizedCallback = useCallback(<F extends (...args: unknown[]) => void>(
    callback: F,
    type: 'debounce' | 'throttle' = 'debounce'
  ) => {
    return type === 'debounce' 
      ? useDebounce(callback, debounceMs)
      : useThrottle(callback, throttleMs);
  }, [useDebounce, useThrottle, debounceMs, throttleMs]);

  // Optimiser les rendus avec React.memo
  const createMemoizedComponent = useCallback(<P extends object>(
    Component: React.ComponentType<P>,
    propsAreEqual?: (prevProps: P, nextProps: P) => boolean
  ) => {
    return React.memo(Component, propsAreEqual);
  }, []);

  return {
    data: memoizedData,
    createOptimizedCallback,
    createMemoizedComponent,
    measurePerformance
  };
};
