
import React, { useCallback, useMemo } from 'react';
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
  const { createDebouncedFn, createThrottledFn, measurePerformance } = usePerformanceOptimization();
  const { shouldMemoize = true, debounceMs = 300, throttleMs = 100 } = options;

  const memoizedData = useMemo(() => {
    if (!shouldMemoize) return data;
    return data;
  }, dependencies);

  const createOptimizedCallback = useCallback(<F extends (...args: unknown[]) => void>(
    callback: F,
    type: 'debounce' | 'throttle' = 'debounce'
  ) => {
    return type === 'debounce' 
      ? createDebouncedFn(callback, debounceMs)
      : createThrottledFn(callback, throttleMs);
  }, [createDebouncedFn, createThrottledFn, debounceMs, throttleMs]);

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
