
import * as React from 'react';
const { useState, useEffect, useCallback } = React;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  defaultTTL: number; // en millisecondes
  maxSize: number;
}

export const useSmartCache = (config: CacheConfig = { defaultTTL: 300000, maxSize: 100 }) => {
  const [cache, setCache] = useState<Map<string, CacheItem<any>>>(new Map());
  
  const set = useCallback(<T>(key: string, data: T, customTTL?: number) => {
    const ttl = customTTL || config.defaultTTL;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      
      // Supprimer les éléments expirés et gérer la taille max
      if (newCache.size >= config.maxSize) {
        const sortedEntries = Array.from(newCache.entries())
          .sort(([,a], [,b]) => a.timestamp - b.timestamp);
        
        // Supprimer les plus anciens
        for (let i = 0; i < Math.floor(config.maxSize * 0.1); i++) {
          newCache.delete(sortedEntries[i][0]);
        }
      }
      
      newCache.set(key, item);
      return newCache;
    });
  }, [config.defaultTTL, config.maxSize]);
  
  const get = useCallback(<T>(key: string): T | null => {
    const item = cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) return null;
    
    // Vérifier si l'élément est expiré
    if (Date.now() - item.timestamp > item.ttl) {
      setCache(prevCache => {
        const newCache = new Map(prevCache);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }
    
    return item.data;
  }, [cache]);
  
  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);
  
  const remove = useCallback((key: string) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.delete(key);
      return newCache;
    });
  }, []);
  
  const clear = useCallback(() => {
    setCache(new Map());
  }, []);
  
  const getOrSet = useCallback(async <T>(
    key: string, 
    factory: () => Promise<T> | T,
    customTTL?: number
  ): Promise<T> => {
    const cached = get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const data = await factory();
    set(key, data, customTTL);
    return data;
  }, [get, set]);
  
  // Nettoyage automatique des éléments expirés
  useEffect(() => {
    const cleanup = setInterval(() => {
      setCache(prevCache => {
        const newCache = new Map(prevCache);
        const now = Date.now();
        
        for (const [key, item] of newCache.entries()) {
          if (now - item.timestamp > item.ttl) {
            newCache.delete(key);
          }
        }
        
        return newCache;
      });
    }, 60000); // Nettoyage toutes les minutes
    
    return () => clearInterval(cleanup);
  }, []);
  
  return {
    set,
    get,
    has,
    remove,
    clear,
    getOrSet,
    size: cache.size
  };
};
