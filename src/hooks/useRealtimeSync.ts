import { useEffect, useState, useCallback } from 'react';
import { storage } from '@/lib/storage';

interface SyncState {
  isOnline: boolean;
  lastSync: string;
  pendingChanges: number;
  syncErrors: string[];
}

export const useRealtimeSync = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: navigator.onLine,
    lastSync: new Date().toISOString(),
    pendingChanges: 0,
    syncErrors: []
  });

  const [listeners, setListeners] = useState<Array<() => void>>([]);

  // Generic sync function for any data type
  const syncData = useCallback((dataType: string, data: any) => {
    try {
      storage.save(dataType, data);
      
      // Update sync state
      setSyncState(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        pendingChanges: Math.max(0, prev.pendingChanges - 1)
      }));

      // Dispatch custom event for real-time updates
      const eventName = `${dataType}Updated`;
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: { data, timestamp: new Date().toISOString() }
      }));

      console.log(`🔄 Sync: ${dataType} updated at ${new Date().toLocaleTimeString()}`);
      
    } catch (error) {
      console.error(`❌ Sync error for ${dataType}:`, error);
      setSyncState(prev => ({
        ...prev,
        syncErrors: [...prev.syncErrors, `Error syncing ${dataType}: ${error}`]
      }));
    }
  }, []);

  // Listen for data changes across the app
  const setupDataListeners = useCallback(() => {
    const dataTypes = [
      'inventory', 'sales', 'staff', 'tables', 
      'settings', 'categories', 'cashBalance', 'cashTransactions'
    ];

    const newListeners: Array<() => void> = [];

    dataTypes.forEach(dataType => {
      const eventName = `${dataType}Changed`;
      
      const listener = (event: CustomEvent) => {
        console.log(`📡 Real-time update detected: ${dataType}`);
        setSyncState(prev => ({
          ...prev,
          lastSync: new Date().toISOString()
        }));
        
        // Propagate the change to other components
        window.dispatchEvent(new CustomEvent(`${dataType}Synced`, {
          detail: event.detail
        }));
      };

      window.addEventListener(eventName, listener);
      newListeners.push(() => window.removeEventListener(eventName, listener));
    });

    setListeners(newListeners);
  }, []);

  // Force sync all data
  const forceSyncAll = useCallback(() => {
    console.log('🔄 Force sync all data...');
    
    const dataTypes = [
      'inventory', 'sales', 'staff', 'tables', 
      'settings', 'categories', 'cashBalance', 'cashTransactions'
    ];

    setSyncState(prev => ({
      ...prev,
      pendingChanges: dataTypes.length
    }));

    dataTypes.forEach(dataType => {
      const data = storage.load(dataType);
      if (data) {
        syncData(dataType, data);
      }
    });
  }, [syncData]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 App back online - syncing data');
      setSyncState(prev => ({ ...prev, isOnline: true }));
      forceSyncAll();
    };

    const handleOffline = () => {
      console.log('📱 App offline - storing changes locally');
      setSyncState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [forceSyncAll]);

  // Setup listeners on mount
  useEffect(() => {
    setupDataListeners();
    
    // Initial sync
    forceSyncAll();

    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }, []);

  return {
    syncState,
    syncData,
    forceSyncAll,
    isRealTimeEnabled: true
  };
};