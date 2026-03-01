
import { useSupabaseInventory, useSupabaseSales, useSupabaseStaff, useSupabaseCash, useSupabaseSettings, useSupabaseTables } from './useSupabaseData';

export const useLocalData = () => {
  const inventoryHooks = useSupabaseInventory();
  const staffHooks = useSupabaseStaff();
  const salesHooks = useSupabaseSales();
  const cashHooks = useSupabaseCash();
  const settingsHooks = useSupabaseSettings();
  const tablesHooks = useSupabaseTables();

  const clearAllData = () => {
    console.warn('clearAllData is not supported with cloud persistence');
  };

  const importData = (key: string, data: unknown) => {
    console.warn('importData: use cloud import instead', key);
  };

  return {
    isLoading: inventoryHooks.isLoading,
    ...inventoryHooks,
    ...staffHooks,
    ...salesHooks,
    ...cashHooks,
    ...settingsHooks,
    ...tablesHooks,
    clearAllData,
    importData
  };
};
