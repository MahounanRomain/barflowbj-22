import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { useCallback, useMemo } from 'react';
import { 
  InventoryItem, 
  SaleRecord, 
  StaffMember, 
  Category, 
  BarSettings,
  CashBalance,
  CashTransaction,
  Table,
  InventoryHistoryEntry
} from '@/lib/storage';

export const useAsyncLocalData = () => {
  // Core data hooks with async storage
  const { data: inventory, saveData: saveInventory, loading: inventoryLoading } = 
    useAsyncStorage<InventoryItem[]>('inventory', []);
    
  const { data: sales, saveData: saveSales, loading: salesLoading } = 
    useAsyncStorage<SaleRecord[]>('sales', []);
    
  const { data: staff, saveData: saveStaff, loading: staffLoading } = 
    useAsyncStorage<StaffMember[]>('staff', []);
    
  const { data: categories, saveData: saveCategories, loading: categoriesLoading } = 
    useAsyncStorage<Category[]>('categories', []);
    
  const { data: settings, saveData: saveSettings, loading: settingsLoading } = 
    useAsyncStorage<BarSettings>('settings', {
      barName: '',
      address: '',
      phone: '',
      email: '',
      darkMode: true,
      notifications: true,
      lowStockAlerts: true
    });

  const { data: cashBalance, saveData: saveCashBalance, loading: cashLoading } = 
    useAsyncStorage<CashBalance | null>('cashBalance', null);
    
  const { data: cashTransactions, saveData: saveCashTransactions, loading: cashTransactionsLoading } = 
    useAsyncStorage<CashTransaction[]>('cashTransactions', []);
    
  const { data: tables, saveData: saveTables, loading: tablesLoading } = 
    useAsyncStorage<Table[]>('tables', []);
    
  const { data: inventoryHistory, saveData: saveInventoryHistory, loading: historyLoading } = 
    useAsyncStorage<InventoryHistoryEntry[]>('inventoryHistory', []);

  // Optimized getters with memoization
  const getInventory = useCallback(() => inventory, [inventory]);
  const getSales = useCallback(() => sales, [sales]);
  const getStaff = useCallback(() => staff, [staff]);
  const getCategories = useCallback(() => categories, [categories]);
  const getSettings = useCallback(() => settings, [settings]);
  const getCashBalance = useCallback(() => cashBalance, [cashBalance]);
  const getCashTransactions = useCallback(() => cashTransactions, [cashTransactions]);
  const getTables = useCallback(() => tables, [tables]);
  const getInventoryHistory = useCallback(() => inventoryHistory, [inventoryHistory]);

  // Loading state aggregation
  const isLoading = useMemo(() => 
    inventoryLoading || salesLoading || staffLoading || categoriesLoading || 
    settingsLoading || cashLoading || cashTransactionsLoading || tablesLoading || historyLoading,
    [inventoryLoading, salesLoading, staffLoading, categoriesLoading, 
     settingsLoading, cashLoading, cashTransactionsLoading, tablesLoading, historyLoading]
  );

  // Batch operations for better performance
  const batchUpdate = useCallback(async (updates: Array<{
    key: 'inventory' | 'sales' | 'staff' | 'categories' | 'settings' | 'cashBalance' | 'cashTransactions' | 'tables' | 'inventoryHistory';
    data: any;
  }>) => {
    const savePromises = updates.map(update => {
      switch (update.key) {
        case 'inventory': return saveInventory(update.data);
        case 'sales': return saveSales(update.data);
        case 'staff': return saveStaff(update.data);
        case 'categories': return saveCategories(update.data);
        case 'settings': return saveSettings(update.data);
        case 'cashBalance': return saveCashBalance(update.data);
        case 'cashTransactions': return saveCashTransactions(update.data);
        case 'tables': return saveTables(update.data);
        case 'inventoryHistory': return saveInventoryHistory(update.data);
        default: return Promise.resolve();
      }
    });

    await Promise.all(savePromises);
  }, [saveInventory, saveSales, saveStaff, saveCategories, saveSettings, 
      saveCashBalance, saveCashTransactions, saveTables, saveInventoryHistory]);

  return {
    // Data getters
    getInventory,
    getSales,
    getStaff,
    getCategories,
    getSettings,
    getCashBalance,
    getCashTransactions,
    getTables,
    getInventoryHistory,
    
    // Data savers
    saveInventory,
    saveSales,
    saveStaff,
    saveCategories,
    saveSettings,
    saveCashBalance,
    saveCashTransactions,
    saveTables,
    saveInventoryHistory,
    
    // Batch operations
    batchUpdate,
    
    // Loading state
    isLoading,
    
    // Individual loading states
    loadingStates: {
      inventory: inventoryLoading,
      sales: salesLoading,
      staff: staffLoading,
      categories: categoriesLoading,
      settings: settingsLoading,
      cashBalance: cashLoading,
      cashTransactions: cashTransactionsLoading,
      tables: tablesLoading,
      inventoryHistory: historyLoading
    }
  };
};