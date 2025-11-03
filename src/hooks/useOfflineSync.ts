import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncQueueItem {
  id: string;
  table_name: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'offline_sync_queue';
const SYNC_CHECK_INTERVAL = 30000; // Check every 30 seconds

export const useOfflineSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get sync queue from localStorage
  const getSyncQueue = useCallback((): SyncQueueItem[] => {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }, []);

  // Save sync queue to localStorage
  const saveSyncQueue = useCallback((queue: SyncQueueItem[]) => {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }, []);

  // Add item to sync queue
  const addToSyncQueue = useCallback((
    table_name: string,
    operation: 'insert' | 'update' | 'delete',
    data: any
  ) => {
    const queue = getSyncQueue();
    const newItem: SyncQueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      table_name,
      operation,
      data,
      timestamp: Date.now()
    };
    queue.push(newItem);
    saveSyncQueue(queue);
  }, [getSyncQueue, saveSyncQueue]);

  // Sync a single item
  const syncItem = async (item: SyncQueueItem): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const dataWithUserId = { ...item.data, user_id: user.id };

      switch (item.operation) {
        case 'insert':
          const { error: insertError } = await (supabase.from as any)(item.table_name)
            .insert(dataWithUserId);
          if (insertError) throw insertError;
          break;

        case 'update':
          const { id, ...updateData } = dataWithUserId;
          const { error: updateError } = await (supabase.from as any)(item.table_name)
            .update(updateData)
            .eq('id', id);
          if (updateError) throw updateError;
          break;

        case 'delete':
          const { error: deleteError } = await (supabase.from as any)(item.table_name)
            .delete()
            .eq('id', dataWithUserId.id);
          if (deleteError) throw deleteError;
          break;
      }

      return true;
    } catch (error) {
      console.error('Error syncing item:', error);
      return false;
    }
  };

  // Sync all queued items
  const syncAll = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    const queue = getSyncQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    setSyncProgress(0);

    toast({
      title: "Synchronisation en cours",
      description: `${queue.length} modification(s) à synchroniser...`
    });

    let successCount = 0;
    let failedItems: SyncQueueItem[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const success = await syncItem(item);
      
      if (success) {
        successCount++;
      } else {
        failedItems.push(item);
      }

      setSyncProgress(((i + 1) / queue.length) * 100);
    }

    // Update queue with failed items only
    saveSyncQueue(failedItems);

    setIsSyncing(false);
    setSyncProgress(0);

    if (successCount > 0) {
      toast({
        title: "Synchronisation réussie",
        description: `${successCount} modification(s) synchronisée(s) avec succès.`,
      });
    }

    if (failedItems.length > 0) {
      toast({
        title: "Synchronisation partielle",
        description: `${failedItems.length} modification(s) ont échoué. Nouvelle tentative plus tard.`,
        variant: "destructive"
      });
    }
  }, [isOnline, isSyncing, getSyncQueue, saveSyncQueue, toast]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      const queue = getSyncQueue();
      if (queue.length > 0) {
        // Delay sync to ensure stable connection
        const timer = setTimeout(() => {
          syncAll();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, syncAll, getSyncQueue]);

  // Periodic sync check
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        syncAll();
      }
    }, SYNC_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isOnline, syncAll]);

  return {
    isOnline,
    isSyncing,
    syncProgress,
    addToSyncQueue,
    syncAll,
    queueLength: getSyncQueue().length
  };
};
