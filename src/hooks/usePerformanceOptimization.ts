
import { useState, useCallback, useRef, useEffect } from 'react';

// Standalone debounce function (not a hook)
function createDebouncedFn<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }) as T;
}

// Standalone throttle function (not a hook)
function createThrottledFn<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  let lastRun = 0;
  return ((...args: Parameters<T>) => {
    if (Date.now() - lastRun >= delay) {
      callback(...args);
      lastRun = Date.now();
    }
  }) as T;
}

export const usePerformanceOptimization = () => {
  const [isOptimized, setIsOptimized] = useState(false);
  const rafRef = useRef<number>();

  // Optimize animations with requestAnimationFrame
  const scheduleUpdate = useCallback((callback: () => void) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(callback);
  }, []);

  // Measure render performance
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    if (end - start > 16) {
      console.warn(`⚠️ ${name} took ${(end - start).toFixed(1)}ms (>16ms budget)`);
    }
  }, []);

  // Optimized scroll handler
  const optimizeScroll = useCallback(() => {
    let ticking = false;
    return (callback: () => void) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    };
  }, []);

  useEffect(() => {
    setIsOptimized(true);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    isOptimized,
    createDebouncedFn,
    createThrottledFn,
    scheduleUpdate,
    measurePerformance,
    optimizeScroll
  };
};
