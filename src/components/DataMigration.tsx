import React, { useEffect } from 'react';
import { asyncStorage } from '@/lib/asyncStorage';
import { storage } from '@/lib/storage';

interface DataMigrationProps {
  onMigrationComplete?: () => void;
  onMigrationError?: (error: Error) => void;
}

// Migration component to transfer localStorage data to IndexedDB
const DataMigration: React.FC<DataMigrationProps> = ({ 
  onMigrationComplete, 
  onMigrationError 
}) => {
  useEffect(() => {
    const migrateData = async () => {
      try {
        console.log('🔄 Starting data migration from localStorage to IndexedDB...');
        
        // Check if migration is already done
        const migrationFlag = await asyncStorage.get('migration_completed');
        if (migrationFlag) {
          console.log('✅ Data migration already completed');
          onMigrationComplete?.();
          return;
        }

        // List of keys to migrate
        const keysToMigrate = [
          'inventory',
          'sales', 
          'staff',
          'categories',
          'settings',
          'cashBalance',
          'cashTransactions',
          'tables',
          'inventoryHistory',
          'app_initialized'
        ];

        const migrationData: Array<{ key: string; value: any }> = [];

        // Collect all data from localStorage
        for (const key of keysToMigrate) {
          try {
            const data = storage.load(key);
            if (data !== null) {
              migrationData.push({ key, value: data });
              console.log(`📦 Collected ${key}:`, data);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to read ${key} from localStorage:`, error);
          }
        }

        // Batch migrate to IndexedDB
        if (migrationData.length > 0) {
          await asyncStorage.setBatch(migrationData);
          console.log(`✅ Migrated ${migrationData.length} items to IndexedDB`);
        }

        // Mark migration as complete
        await asyncStorage.set('migration_completed', {
          timestamp: new Date().toISOString(),
          itemsCount: migrationData.length
        });

        console.log('🎉 Data migration completed successfully');
        onMigrationComplete?.();

      } catch (error) {
        console.error('❌ Data migration failed:', error);
        onMigrationError?.(error instanceof Error ? error : new Error('Migration failed'));
      }
    };

    migrateData();
  }, [onMigrationComplete, onMigrationError]);

  return null; // This component doesn't render anything
};

export default DataMigration;