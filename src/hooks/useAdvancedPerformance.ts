import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Optimisations mémoire avancées
export const useAdvancedPerformance = () => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const performanceMetrics = useRef({
    averageRenderTime: 0,
    maxRenderTime: 0,
    memoryUsage: 0
  });

  // Debounce optimisé avec cancel
  const useOptimizedDebounce = useCallback(<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
  ): [T, () => void] => {
    const timeoutRef = useRef<NodeJS.Timeout>();
    
    const debouncedFn = useCallback((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]) as T;

    const cancel = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }, []);

    return [debouncedFn, cancel];
  }, []);

  // Throttle optimisé avec leading/trailing options
  const useOptimizedThrottle = useCallback(<T extends (...args: any[]) => void>(
    callback: T,
    delay: number,
    options: { leading?: boolean; trailing?: boolean } = { leading: true, trailing: true }
  ): T => {
    const lastCall = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout>();
    
    return useCallback((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall.current;
      
      const callFunction = () => {
        lastCall.current = now;
        callback(...args);
      };

      if (timeSinceLastCall >= delay) {
        if (options.leading) {
          callFunction();
        }
      } else if (options.trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(callFunction, delay - timeSinceLastCall);
      }
    }, [callback, delay, options.leading, options.trailing]) as T;
  }, []);

  // Mesure de performance en temps réel
  const measureRenderPerformance = useCallback(() => {
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;
    
    renderCount.current++;
    performanceMetrics.current.averageRenderTime = 
      (performanceMetrics.current.averageRenderTime * (renderCount.current - 1) + renderTime) / renderCount.current;
    
    if (renderTime > performanceMetrics.current.maxRenderTime) {
      performanceMetrics.current.maxRenderTime = renderTime;
    }

    // Mesure de la mémoire si disponible
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      performanceMetrics.current.memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
    }

    lastRenderTime.current = currentTime;

    // Alerte si performance dégradée
    if (renderTime > 16.67) { // Plus de 16.67ms = moins de 60fps
      console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
    }
  }, []);

  // Optimisation des listes volumineuses avec pagination virtuelle
  const useVirtualizedList = useCallback(<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan: number = 5
  ) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleRange = useMemo(() => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      );
      
      return { startIndex, endIndex };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

    const visibleItems = useMemo(() => {
      return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    }, [items, visibleRange]);

    return {
      visibleItems,
      visibleRange,
      setScrollTop,
      totalHeight: items.length * itemHeight
    };
  }, []);

  // Cache intelligent avec TTL
  const useSmartCache = useCallback(<T>(
    key: string,
    computation: () => T,
    ttl: number = 5 * 60 * 1000 // 5 minutes par défaut
  ) => {
    const cache = useRef(new Map<string, { value: T; timestamp: number }>());
    
    return useMemo(() => {
      const cached = cache.current.get(key);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < ttl) {
        return cached.value;
      }
      
      const result = computation();
      cache.current.set(key, { value: result, timestamp: now });
      
      // Nettoyage des entrées expirées
      for (const [cacheKey, cacheValue] of cache.current.entries()) {
        if ((now - cacheValue.timestamp) >= ttl) {
          cache.current.delete(cacheKey);
        }
      }
      
      return result;
    }, [key, computation, ttl]);
  }, []);

  // Batch d'opérations pour éviter les re-renders multiples
  const useBatchedUpdates = useCallback(() => {
    const updates = useRef<(() => void)[]>([]);
    const isScheduled = useRef(false);
    
    const batchUpdate = useCallback((updateFn: () => void) => {
      updates.current.push(updateFn);
      
      if (!isScheduled.current) {
        isScheduled.current = true;
        requestAnimationFrame(() => {
          const batch = updates.current;
          updates.current = [];
          isScheduled.current = false;
          
          batch.forEach(update => update());
        });
      }
    }, []);

    return batchUpdate;
  }, []);

  // Intersection Observer optimisé pour le lazy loading
  const useIntersectionObserver = useCallback((
    callback: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit = {}
  ) => {
    const ref = useRef<Element | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const setRef = useCallback((element: Element | null) => {
      if (ref.current && observerRef.current) {
        observerRef.current.unobserve(ref.current);
      }

      if (element) {
        if (!observerRef.current) {
          observerRef.current = new IntersectionObserver(
            (entries) => entries.forEach(callback),
            { threshold: 0.1, rootMargin: '50px', ...options }
          );
        }
        observerRef.current.observe(element);
      }

      ref.current = element;
    }, [callback, options]);

    useEffect(() => {
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, []);

    return setRef;
  }, []);

  // Mesure de performance globale
  const getPerformanceMetrics = useCallback(() => {
    return {
      ...performanceMetrics.current,
      renderCount: renderCount.current,
      fps: renderCount.current > 0 ? Math.round(1000 / performanceMetrics.current.averageRenderTime) : 0
    };
  }, []);

  return {
    useOptimizedDebounce,
    useOptimizedThrottle,
    measureRenderPerformance,
    useVirtualizedList,
    useSmartCache,
    useBatchedUpdates,
    useIntersectionObserver,
    getPerformanceMetrics
  };
};

// Hook pour l'optimisation des animations
export const useAnimationOptimization = () => {
  const rafId = useRef<number>();
  const isAnimating = useRef(false);

  const startAnimation = useCallback((animationFn: (timestamp: number) => boolean | void) => {
    if (isAnimating.current) return;
    
    isAnimating.current = true;
    
    const animate = (timestamp: number) => {
      const shouldContinue = animationFn(timestamp);
      
      if (shouldContinue !== false && isAnimating.current) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
      }
    };
    
    rafId.current = requestAnimationFrame(animate);
  }, []);

  const stopAnimation = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    isAnimating.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return { startAnimation, stopAnimation, isAnimating: isAnimating.current };
};