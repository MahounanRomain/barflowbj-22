import { useState, useEffect, useCallback, useRef } from 'react';
import { asyncStorage } from '@/lib/asyncStorage';

interface UseAsyncStorageOptions {
  fallbackToLocalStorage?: boolean;
  enableCache?: boolean;
  cacheTime?: number;
}

export const useAsyncStorage = <T>(
  key: string, 
  defaultValue: T,
  options: UseAsyncStorageOptions = {}
) => {
  const {
    fallbackToLocalStorage = true,
    enableCache = true,
    cacheTime = 5000 // 5 seconds cache
  } = options;

  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache to prevent excessive reads
  const cacheRef = useRef<{ value: T; timestamp: number } | null>(null);
  
  // Queue for batching writes
  const writeQueueRef = useRef<Array<() => Promise<void>>>([]);
  const processingRef = useRef(false);

  // Load data from storage
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (enableCache && cacheRef.current) {
        const { value, timestamp } = cacheRef.current;
        if (Date.now() - timestamp < cacheTime) {
          setData(value);
          setLoading(false);
          return;
        }
      }

      let result: T | null = null;
      
      try {
        result = await asyncStorage.get<T>(key);
      } catch (indexedDBError) {
        console.warn('IndexedDB failed, falling back to localStorage:', indexedDBError);
        
        if (fallbackToLocalStorage) {
          const fallbackData = localStorage.getItem(key);
          result = fallbackData ? JSON.parse(fallbackData) : null;
        }
      }

      const finalValue = result !== null ? result : defaultValue;
      setData(finalValue);
      
      // Update cache
      if (enableCache) {
        cacheRef.current = { value: finalValue, timestamp: Date.now() };
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue, fallbackToLocalStorage, enableCache, cacheTime]);

  // Process write queue
  const processWriteQueue = useCallback(async () => {
    if (processingRef.current || writeQueueRef.current.length === 0) return;
    
    processingRef.current = true;
    
    try {
      // Process all queued writes
      const queue = [...writeQueueRef.current];
      writeQueueRef.current = [];
      
      await Promise.all(queue.map(write => write()));
    } catch (err) {
      console.error('Error processing write queue:', err);
    } finally {
      processingRef.current = false;
    }
  }, []);

  // Save data to storage
  const saveData = useCallback(async (newData: T) => {
    const writeOperation = async () => {
      try {
        await asyncStorage.set(key, newData);
        
        // Also save to localStorage as fallback
        if (fallbackToLocalStorage) {
          localStorage.setItem(key, JSON.stringify(newData));
        }
        
        // Update cache
        if (enableCache) {
          cacheRef.current = { value: newData, timestamp: Date.now() };
        }
        
        // Trigger real-time update event
        window.dispatchEvent(new CustomEvent(`${key}Changed`, { detail: newData }));
        
      } catch (err) {
        console.error('Save operation failed:', err);
        throw err;
      }
    };

    // Add to queue for batching
    writeQueueRef.current.push(writeOperation);
    
    // Update local state immediately for UI responsiveness
    setData(newData);
    
    // Process queue asynchronously
    setTimeout(processWriteQueue, 0);
  }, [key, fallbackToLocalStorage, enableCache, processWriteQueue]);

  // Update data
  const updateData = useCallback((updater: (prev: T) => T) => {
    setData(prev => {
      const newData = updater(prev);
      // Queue the save operation
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  // Remove data
  const removeData = useCallback(async () => {
    try {
      await asyncStorage.remove(key);
      
      if (fallbackToLocalStorage) {
        localStorage.removeItem(key);
      }
      
      setData(defaultValue);
      cacheRef.current = null;
      
      window.dispatchEvent(new CustomEvent(`${key}Removed`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove data');
    }
  }, [key, defaultValue, fallbackToLocalStorage]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Process any remaining writes when component unmounts
  useEffect(() => {
    return () => {
      if (writeQueueRef.current.length > 0) {
        processWriteQueue();
      }
    };
  }, [processWriteQueue]);

  return {
    data,
    loading,
    error,
    saveData,
    updateData,
    removeData,
    reload: loadData
  };
};