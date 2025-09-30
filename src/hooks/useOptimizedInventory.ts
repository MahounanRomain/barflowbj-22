import { useMemo, useCallback } from 'react';
import { useOptimizedQuery, useOptimizedMutation } from './useOptimizedQuery';
import { useOptimizedLocalData } from './useOptimizedLocalData';
import { InventoryItem } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export const useOptimizedInventory = () => {
  const { optimizedGet, optimizedSave } = useOptimizedLocalData();

  // Query pour charger l'inventaire avec cache
  const { data: inventory = [], isLoading, refetch, optimisticUpdate } = useOptimizedQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      return optimizedGet<InventoryItem[]>('inventory', []);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutation pour ajouter un item
  const addItemMutation = useOptimizedMutation<InventoryItem, InventoryItem>(
    async (newItem) => {
      const current = optimizedGet<InventoryItem[]>('inventory', []);
      const updated = [...current, newItem];
      optimizedSave('inventory', updated);
      return newItem;
    },
    {
      onSuccess: () => {
        toast({ title: 'Article ajouté avec succès' });
      },
      invalidateQueries: [['inventory']],
    }
  );

  // Mutation pour mettre à jour un item
  const updateItemMutation = useOptimizedMutation<InventoryItem, InventoryItem>(
    async (updatedItem) => {
      const current = optimizedGet<InventoryItem[]>('inventory', []);
      const updated = current.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      );
      optimizedSave('inventory', updated);
      return updatedItem;
    },
    {
      onSuccess: () => {
        toast({ title: 'Article mis à jour' });
      },
      invalidateQueries: [['inventory']],
    }
  );

  // Mutation pour supprimer un item
  const deleteItemMutation = useOptimizedMutation<void, string>(
    async (itemId) => {
      const current = optimizedGet<InventoryItem[]>('inventory', []);
      const updated = current.filter(item => item.id !== itemId);
      optimizedSave('inventory', updated);
    },
    {
      onSuccess: () => {
        toast({ title: 'Article supprimé' });
      },
      invalidateQueries: [['inventory']],
    }
  );

  // Filtres optimisés avec memoization
  const lowStockItems = useMemo(() => 
    inventory.filter(item => item.quantity <= item.threshold),
    [inventory]
  );

  const outOfStockItems = useMemo(() => 
    inventory.filter(item => item.quantity === 0),
    [inventory]
  );

  const activeItems = useMemo(() => 
    inventory.filter(item => item.quantity > 0),
    [inventory]
  );

  // Fonctions callback optimisées
  const addItem = useCallback((item: InventoryItem) => {
    addItemMutation.mutate(item);
  }, [addItemMutation]);

  const updateItem = useCallback((item: InventoryItem) => {
    // Mise à jour optimiste
    optimisticUpdate((old: InventoryItem[] | undefined) => 
      old?.map(i => i.id === item.id ? item : i) || []
    );
    updateItemMutation.mutate(item);
  }, [updateItemMutation, optimisticUpdate]);

  const deleteItem = useCallback((itemId: string) => {
    deleteItemMutation.mutate(itemId);
  }, [deleteItemMutation]);

  const getItemById = useCallback((itemId: string) => 
    inventory.find(item => item.id === itemId),
    [inventory]
  );

  const getItemsByCategory = useCallback((category: string) => 
    inventory.filter(item => item.category === category),
    [inventory]
  );

  return {
    inventory,
    isLoading,
    lowStockItems,
    outOfStockItems,
    activeItems,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
    getItemsByCategory,
    refetch,
  };
};
