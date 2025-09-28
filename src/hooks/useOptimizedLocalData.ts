import { useCallback, useMemo, useRef } from 'react';
import { storage } from '@/lib/storage';

// Hook optimisé pour les opérations localStorage fréquentes
export const useOptimizedLocalData = () => {
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_TTL = 1000; // Cache pendant 1 seconde pour éviter les accès répétés

  const getCachedData = useCallback(<T>(key: string, loader: () => T): T => {
    const cached = cacheRef.current.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return cached.data;
    }
    
    const data = loader();
    cacheRef.current.set(key, { data, timestamp: now });
    return data;
  }, []);

  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const optimizedGet = useCallback(<T>(key: string, defaultValue: T): T => {
    return getCachedData(key, () => storage.load<T>(key) || defaultValue);
  }, [getCachedData]);

  const optimizedSave = useCallback((key: string, data: any) => {
    storage.save(key, data);
    invalidateCache(key);
    // Événement temps réel optimisé avec debounce
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(`${key}Changed`));
    }, 0);
  }, [invalidateCache]);

  return {
    optimizedGet,
    optimizedSave,
    invalidateCache
  };
};