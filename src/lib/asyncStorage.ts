// Modern IndexedDB wrapper for async storage operations
class AsyncStorage {
  private dbName = 'BarFlowDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for app data
        if (!db.objectStoreNames.contains('appData')) {
          db.createObjectStore('appData', { keyPath: 'key' });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readonly');
      const store = transaction.objectStore('appData');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  }

  async set(key: string, value: any): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readwrite');
      const store = transaction.objectStore('appData');
      const request = store.put({ key, value, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async remove(key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readwrite');
      const store = transaction.objectStore('appData');
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readwrite');
      const store = transaction.objectStore('appData');
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  // Batch operations for better performance
  async setBatch(items: Array<{ key: string; value: any }>): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readwrite');
      const store = transaction.objectStore('appData');
      
      let completed = 0;
      const total = items.length;

      if (total === 0) {
        resolve();
        return;
      }

      items.forEach(item => {
        const request = store.put({ 
          key: item.key, 
          value: item.value, 
          timestamp: Date.now() 
        });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
      });
    });
  }

  async getBatch<T>(keys: string[]): Promise<Record<string, T | null>> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const results: Record<string, T | null> = {};

    for (const key of keys) {
      results[key] = await this.get<T>(key);
    }

    return results;
  }
}

// Singleton instance
export const asyncStorage = new AsyncStorage();