import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import { storage, InventoryItem, Category, InventoryHistoryEntry } from '@/lib/storage';

export const useInventoryData = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour créer une entrée d'historique
  const createHistoryEntry = useCallback((
    action: 'created' | 'updated' | 'deleted' | 'stock_adjusted',
    item: InventoryItem,
    changes: Record<string, { from: any; to: any }> = {},
    reason?: string
  ) => {
    const history = storage.load<InventoryHistoryEntry[]>('inventoryHistory') || [];
    const newEntry: InventoryHistoryEntry = {
      id: Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      action,
      changes,
      userId: 'current-user',
      userName: 'Utilisateur',
      timestamp: new Date().toISOString(),
      reason
    };
    history.push(newEntry);
    storage.save('inventoryHistory', history);
  }, []);

  // Fonctions pour l'inventaire
  const getInventory = useCallback((): InventoryItem[] => {
    return storage.load<InventoryItem[]>('inventory') || [];
  }, []);

  const saveInventory = useCallback((inventory: InventoryItem[]) => {
    storage.save('inventory', inventory);
  }, []);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const inventory = getInventory();
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inventory.push(newItem);
      saveInventory(inventory);
      createHistoryEntry('created', newItem);
      window.dispatchEvent(new CustomEvent('inventoryChanged'));
      return newItem;
  }, [getInventory, saveInventory, createHistoryEntry]);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    const inventory = getInventory();
    const index = inventory.findIndex(item => item.id === id);
    if (index !== -1) {
      const oldItem = { ...inventory[index] };
      const updatedItem = {
        ...inventory[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      inventory[index] = updatedItem;
      saveInventory(inventory);
      
      // Créer l'entrée d'historique avec les changements
      const changes: Record<string, { from: any; to: any }> = {};
      Object.keys(updates).forEach(key => {
        if (oldItem[key as keyof InventoryItem] !== updates[key as keyof InventoryItem]) {
          changes[key] = {
            from: oldItem[key as keyof InventoryItem],
            to: updates[key as keyof InventoryItem]
          };
        }
      });
      
      // Si c'est un changement de quantité, marquer comme stock_adjusted
      const action = changes.quantity ? 'stock_adjusted' : 'updated';
      createHistoryEntry(action, updatedItem, changes);
      window.dispatchEvent(new CustomEvent('inventoryChanged'));
      return updatedItem;
    }
    return null;
  }, [getInventory, saveInventory, createHistoryEntry]);

  const deleteInventoryItem = useCallback((id: string) => {
    const inventory = getInventory();
    const itemToDelete = inventory.find(item => item.id === id);
    if (itemToDelete) {
      const filteredInventory = inventory.filter(item => item.id !== id);
      saveInventory(filteredInventory);
      createHistoryEntry('deleted', itemToDelete);
      window.dispatchEvent(new CustomEvent('inventoryChanged'));
    }
  }, [getInventory, saveInventory, createHistoryEntry]);

  // Nouvelle fonction pour le réapprovisionnement avec raison
  const restockItem = useCallback((id: string, newQuantity: number, reason?: string) => {
    const inventory = getInventory();
    const index = inventory.findIndex(item => item.id === id);
    if (index !== -1) {
      const oldItem = { ...inventory[index] };
      const updatedItem = {
        ...inventory[index],
        quantity: newQuantity,
        stock: newQuantity, // Synchroniser stock avec quantity
        updatedAt: new Date().toISOString()
      };
      inventory[index] = updatedItem;
      saveInventory(inventory);
      
      // Créer l'entrée d'historique spécifique au réapprovisionnement
      const changes = {
        quantity: {
          from: oldItem.quantity,
          to: newQuantity
        }
      };
      
      createHistoryEntry('stock_adjusted', updatedItem, changes, reason);
      window.dispatchEvent(new CustomEvent('inventoryChanged'));
      return updatedItem;
    }
    return null;
  }, [getInventory, saveInventory, createHistoryEntry]);

  // Fonctions pour les catégories
  const getCategories = useCallback((): Category[] => {
    return storage.load<Category[]>('categories') || [];
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const categories = getCategories();
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    categories.push(newCategory);
    storage.save('categories', categories);
    return newCategory;
  }, [getCategories]);

  // Initialize parent categories - no longer creates default categories
  const initializeParentCategories = useCallback(() => {
    console.log('useInventoryData - initializeParentCategories called (no default categories created)');
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    const categories = getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      categories[index] = {
        ...categories[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      storage.save('categories', categories);
      return categories[index];
    }
    return null;
  }, [getCategories]);

  const deleteCategory = useCallback((id: string) => {
    const categories = getCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);
    storage.save('categories', filteredCategories);
  }, [getCategories]);

  // Fonctions pour l'historique
  const getInventoryHistory = useCallback((): InventoryHistoryEntry[] => {
    return storage.load<InventoryHistoryEntry[]>('inventoryHistory') || [];
  }, []);

  // Fonction pour créer une entrée d'historique (exposée pour RestockDialog)
  const createInventoryHistoryEntry = useCallback((data: {
    action: 'created' | 'updated' | 'deleted' | 'stock_adjusted';
    itemId: string;
    itemName: string;
    quantityChange?: { from: number; to: number; amount: number };
    reason?: string;
  }) => {
    const history = storage.load<InventoryHistoryEntry[]>('inventoryHistory') || [];
    const newEntry: InventoryHistoryEntry = {
      id: Date.now().toString(),
      itemId: data.itemId,
      itemName: data.itemName,
      action: data.action,
      changes: data.quantityChange ? { quantity: { from: data.quantityChange.from, to: data.quantityChange.to } } : {},
      userId: 'current-user',
      userName: 'Utilisateur',
      timestamp: new Date().toISOString(),
      reason: data.reason
    };
    history.push(newEntry);
    storage.save('inventoryHistory', history);
    window.dispatchEvent(new CustomEvent('inventoryHistoryChanged'));
  }, []);

  return {
    isLoading,
    getInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    restockItem,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getInventoryHistory,
    createInventoryHistoryEntry,
    initializeParentCategories,
  };
};
