
import { storage } from '@/lib/storage';
import { useInventoryData } from './useInventoryData';
import { useStaffData } from './useStaffData';
import { useSalesData } from './useSalesData';
import { useCashData } from './useCashData';
import { useLocalDataCore } from './useLocalDataCore';
import { useSettingsData } from './useSettingsData';
import { useTablesData } from './useTablesData';

export const useLocalData = () => {
  const { isLoading } = useLocalDataCore();
  
  // Import hooks spécialisés
  const inventoryHooks = useInventoryData();
  const staffHooks = useStaffData();
  const salesHooks = useSalesData();
  const cashHooks = useCashData();
  const settingsHooks = useSettingsData();
  const tablesHooks = useTablesData();

  // Fonction pour effacer toutes les données
  const clearAllData = () => {
    storage.clearAll();
    // Réinitialiser avec les données par défaut
    const defaultSettings = {
      barName: '',
      address: '',
      phone: '',
      email: 'romainmahougnon@gmail.com',
      darkMode: true,
      notifications: true,
      lowStockAlerts: true
    };

    const defaultTables = [
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
  };

  // Import data function
  const importData = (key: string, data: unknown) => {
    storage.save(key, data);
  };

  return {
    isLoading,
    // Inventaire
    ...inventoryHooks,
    // Personnel
    ...staffHooks,
    // Ventes
    ...salesHooks,
    // Cash
    ...cashHooks,
    // Paramètres
    ...settingsHooks,
    // Tables
    ...tablesHooks,
    // Utilitaires
    clearAllData,
    importData
  };
};
