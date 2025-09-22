
import React, { useState, useCallback, useRef, useEffect } from 'react';

export const usePerformanceOptimization = () => {
  const [isOptimized, setIsOptimized] = useState(false);
  const rafRef = useRef<number>();
  const frameCount = useRef(0);

  // Debounce pour éviter les appels trop fréquents
  const useDebounce = useCallback(<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
  ): T => {
    const timeoutRef = useRef<NodeJS.Timeout>();
    
    return useCallback((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }, [callback, delay]) as T;
  }, []);

  // Throttle pour limiter la fréquence d'exécution
  const useThrottle = useCallback(<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
  ): T => {
    const lastRun = useRef(Date.now());
    
    return useCallback((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }, [callback, delay]) as T;
  }, []);

  // Optimisation des animations avec requestAnimationFrame
  const scheduleUpdate = useCallback((callback: () => void) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(callback);
  }, []);

  // Mesure des performances de rendu
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  }, []);

  // Optimisation du scroll
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

  // Gestion intelligente des états
  const useSmartState = useCallback(<T>(initialValue: T) => {
    const [value, setValue] = useState(initialValue);
    const previousValue = useRef(initialValue);
    const hasChanged = useRef(false);

    const smartSetValue = useCallback((newValue: T | ((prev: T) => T)) => {
      setValue(prev => {
        const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
        if (JSON.stringify(nextValue) !== JSON.stringify(previousValue.current)) {
          previousValue.current = nextValue;
          hasChanged.current = true;
          return nextValue;
        }
        return prev;
      });
    }, []);

    return [value, smartSetValue, hasChanged.current] as const;
  }, []);

  useEffect(() => {
    // Optimisations générales au montage
    setIsOptimized(true);
    
    // Nettoyage
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    isOptimized,
    useDebounce,
    useThrottle,
    scheduleUpdate,
    measurePerformance,
    optimizeScroll,
    useSmartState
  };
};
