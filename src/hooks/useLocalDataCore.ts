
import { useState, useEffect } from 'react';
import { storage, BarSettings, Table } from '@/lib/storage';
import { generateRandomId } from '@/lib/utils';

export const useLocalDataCore = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        if (!storage.exists('app_initialized')) {
          console.log('Premier lancement - initialisation des données par défaut');
          
          const defaultSettings: BarSettings = {
            barName: '',
            address: '',
            phone: '',
            email: 'romainmahougnon@gmail.com',
            darkMode: true,
            notifications: true,
            lowStockAlerts: true
          };

          const defaultTables: Table[] = [
            { id: '1', name: 'Table 1', capacity: 4, status: 'available', isActive: true, createdAt: new Date().toISOString() },
            { id: '2', name: 'Table 2', capacity: 4, status: 'available', isActive: true, createdAt: new Date().toISOString() },
            { id: '3', name: 'Table 3', capacity: 6, status: 'available', isActive: true, createdAt: new Date().toISOString() },
            { id: '4', name: 'Table 4', capacity: 2, status: 'available', isActive: true, createdAt: new Date().toISOString() },
            { id: '5', name: 'Table 5', capacity: 8, status: 'available', isActive: true, createdAt: new Date().toISOString() }
          ];
          
          storage.save('settings', defaultSettings);
          storage.save('inventory', []);
          storage.save('staff', []);
          storage.save('sales', []);
          storage.save('categories', []);
          storage.save('inventoryHistory', []);
          storage.save('tables', defaultTables);
          storage.save('cashBalance', null);
          storage.save('cashTransactions', []);
          storage.save('app_initialized', true);
        } else {
          // Vérifier les données essentielles
          const existingTables = storage.load<Table[]>('tables');
          if (!existingTables || existingTables.length === 0) {
            const defaultTables: Table[] = [
              { id: '1', name: 'Table 1', capacity: 4, status: 'available', isActive: true, createdAt: new Date().toISOString() },
              { id: '2', name: 'Table 2', capacity: 4, status: 'available', isActive: true, createdAt: new Date().toISOString() },
              { id: '3', name: 'Table 3', capacity: 6, status: 'available', isActive: true, createdAt: new Date().toISOString() },
              { id: '4', name: 'Table 4', capacity: 2, status: 'available', isActive: true, createdAt: new Date().toISOString() },
              { id: '5', name: 'Table 5', capacity: 8, status: 'available', isActive: true, createdAt: new Date().toISOString() }
            ];
            storage.save('tables', defaultTables);
          }

          // S'assurer que les autres données nécessaires existent
          ['categories', 'inventory', 'staff', 'sales', 'inventoryHistory', 'cashBalance', 'cashTransactions'].forEach(key => {
            if (!storage.exists(key)) {
              storage.save(key, key === 'cashBalance' ? null : []);
            }
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  return { isLoading };
};
