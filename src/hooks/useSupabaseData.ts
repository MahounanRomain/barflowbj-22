import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Helper to get current user ID
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

// ============ INVENTORY ============
export const useSupabaseInventory = () => {
  const qc = useQueryClient();

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return [];
      const { data, error } = await supabase.from('inventory').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      // Map DB columns to camelCase for backward compat
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category || '',
        purchasePrice: item.purchase_price || 0,
        salePrice: item.sale_price,
        quantity: item.quantity,
        stock: item.stock,
        unit: item.unit || 'unité',
        threshold: item.threshold || 5,
        lowStockThreshold: item.threshold || 5,
        imageUrl: item.image_url,
        supplier: item.supplier,
        sku: item.sku,
        barcode: item.barcode,
        notes: item.notes,
        containerType: item.container_type || '',
        minQuantity: item.min_quantity || 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    },
  });

  const getInventory = useCallback(() => inventory, [inventory]);

  const addInventoryItem = useCallback(async (item: any) => {
    const userId = await getUserId();
    if (!userId) return null;
    const { data, error } = await supabase.from('inventory').insert({
      user_id: userId,
      name: item.name,
      description: item.description,
      category: item.category,
      purchase_price: item.purchasePrice,
      sale_price: item.salePrice,
      quantity: item.quantity,
      stock: item.stock || item.quantity,
      unit: item.unit,
      threshold: item.threshold,
      image_url: item.imageUrl,
      supplier: item.supplier,
      sku: item.sku,
      barcode: item.barcode,
      notes: item.notes,
      container_type: item.containerType,
      min_quantity: item.minQuantity,
    }).select().single();
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ['inventory'] });
    return data;
  }, [qc]);

  const updateInventoryItem = useCallback(async (id: string, updates: any) => {
    const mapped: any = {};
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.description !== undefined) mapped.description = updates.description;
    if (updates.category !== undefined) mapped.category = updates.category;
    if (updates.purchasePrice !== undefined) mapped.purchase_price = updates.purchasePrice;
    if (updates.salePrice !== undefined) mapped.sale_price = updates.salePrice;
    if (updates.quantity !== undefined) { mapped.quantity = updates.quantity; mapped.stock = updates.quantity; }
    if (updates.stock !== undefined) mapped.stock = updates.stock;
    if (updates.unit !== undefined) mapped.unit = updates.unit;
    if (updates.threshold !== undefined) mapped.threshold = updates.threshold;
    if (updates.imageUrl !== undefined) mapped.image_url = updates.imageUrl;
    if (updates.supplier !== undefined) mapped.supplier = updates.supplier;
    if (updates.sku !== undefined) mapped.sku = updates.sku;
    if (updates.barcode !== undefined) mapped.barcode = updates.barcode;
    if (updates.notes !== undefined) mapped.notes = updates.notes;
    if (updates.containerType !== undefined) mapped.container_type = updates.containerType;
    if (updates.minQuantity !== undefined) mapped.min_quantity = updates.minQuantity;
    mapped.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase.from('inventory').update(mapped).eq('id', id).select().single();
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ['inventory'] });
    return data;
  }, [qc]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    await supabase.from('inventory').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['inventory'] });
  }, [qc]);

  const restockItem = useCallback(async (id: string, newQuantity: number, reason?: string) => {
    const userId = await getUserId();
    const item = inventory.find((i: any) => i.id === id);
    const oldQty = item?.quantity || 0;
    
    const { data, error } = await supabase.from('inventory').update({ 
      quantity: newQuantity, stock: newQuantity, updated_at: new Date().toISOString() 
    }).eq('id', id).select().single();
    if (error) throw error;

    // Add history entry
    if (userId && item) {
      await supabase.from('inventory_history').insert({
        user_id: userId,
        item_id: id,
        item_name: item.name,
        action: 'stock_adjusted',
        changes: { quantity: { from: oldQty, to: newQuantity } },
        reason,
      });
    }
    
    qc.invalidateQueries({ queryKey: ['inventory'] });
    qc.invalidateQueries({ queryKey: ['inventory_history'] });
    return data;
  }, [qc, inventory]);

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return [];
      const { data } = await supabase.from('categories').select('*').eq('user_id', userId);
      return (data || []).map(c => ({
        id: c.id, name: c.name, color: c.color || '', icon: c.icon || '',
        parentId: c.parent_id, isParent: c.is_parent,
        createdAt: c.created_at, updatedAt: c.updated_at,
      }));
    },
  });

  const getCategories = useCallback(() => categories, [categories]);

  const addCategory = useCallback(async (category: any) => {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await supabase.from('categories').insert({
      user_id: userId, name: category.name, color: category.color, icon: category.icon,
      parent_id: category.parentId, is_parent: category.isParent,
    }).select().single();
    qc.invalidateQueries({ queryKey: ['categories'] });
    return data;
  }, [qc]);

  const updateCategory = useCallback(async (id: string, updates: any) => {
    const mapped: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.color !== undefined) mapped.color = updates.color;
    if (updates.icon !== undefined) mapped.icon = updates.icon;
    if (updates.parentId !== undefined) mapped.parent_id = updates.parentId;
    if (updates.isParent !== undefined) mapped.is_parent = updates.isParent;
    await supabase.from('categories').update(mapped).eq('id', id);
    qc.invalidateQueries({ queryKey: ['categories'] });
  }, [qc]);

  const deleteCategory = useCallback(async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['categories'] });
  }, [qc]);

  // Inventory History
  const { data: inventoryHistory = [] } = useQuery({
    queryKey: ['inventory_history'],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return [];
      const { data } = await supabase.from('inventory_history').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(200);
      return (data || []).map(h => ({
        id: h.id, itemId: h.item_id, itemName: h.item_name,
        action: h.action as 'created' | 'updated' | 'deleted' | 'stock_adjusted',
        changes: (h.changes || {}) as Record<string, { from: any; to: any }>,
        userId: h.user_id, userName: 'Utilisateur',
        timestamp: h.timestamp, reason: h.reason,
      }));
    },
  });

  const getInventoryHistory = useCallback(() => inventoryHistory, [inventoryHistory]);

  const createInventoryHistoryEntry = useCallback(async (data: any) => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('inventory_history').insert({
      user_id: userId,
      item_id: data.itemId,
      item_name: data.itemName,
      action: data.action,
      changes: data.quantityChange ? { quantity: { from: data.quantityChange.from, to: data.quantityChange.to } } : {},
      reason: data.reason,
    });
    qc.invalidateQueries({ queryKey: ['inventory_history'] });
  }, [qc]);

  const initializeParentCategories = useCallback(() => {}, []);

  return {
    isLoading: inventoryLoading,
    getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, restockItem,
    getCategories, addCategory, updateCategory, deleteCategory,
    getInventoryHistory, createInventoryHistoryEntry, initializeParentCategories,
  };
};

// ============ SALES ============
export const useSupabaseSales = () => {
  const qc = useQueryClient();

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return [];
      const { data } = await supabase.from('sales').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return (data || []).map(s => ({
        id: s.id, item: s.item, quantity: s.quantity,
        unitPrice: s.unit_price, total: s.total,
        sellerId: s.seller_id || '', sellerName: s.seller_name || '',
        tableId: s.table_id, tableName: s.table_name,
        date: s.date, paymentMethod: s.payment_method,
        customer: s.customer, createdAt: s.created_at,
      }));
    },
  });

  const getSales = useCallback(() => sales, [sales]);

  const saveSales = useCallback(() => {
    // No-op: individual mutations handle persistence now
    qc.invalidateQueries({ queryKey: ['sales'] });
  }, [qc]);

  const addSale = useCallback(async (sale: any) => {
    const userId = await getUserId();
    if (!userId) return null;
    const { data, error } = await supabase.from('sales').insert({
      user_id: userId,
      item: sale.item,
      quantity: sale.quantity,
      unit_price: sale.unitPrice,
      total: sale.total,
      seller_id: sale.sellerId,
      seller_name: sale.sellerName,
      table_id: sale.tableId,
      table_name: sale.tableName,
      date: sale.date || new Date().toISOString().split('T')[0],
      payment_method: sale.paymentMethod,
      customer: sale.customer,
    }).select().single();
    if (error) throw error;

    // Auto-add cash transaction
    await supabase.from('cash_transactions').insert({
      user_id: userId,
      type: 'income',
      amount: sale.total,
      description: `Vente — ${sale.item} (×${sale.quantity})`,
      category: 'sales',
      related_sale_id: data.id,
    });

    // Update cash balance
    const { data: balanceData } = await supabase.from('cash_balance').select('*').eq('user_id', userId).single();
    if (balanceData) {
      await supabase.from('cash_balance').update({
        current_amount: balanceData.current_amount + sale.total,
        last_updated: new Date().toISOString(),
      }).eq('id', balanceData.id);
    }

    qc.invalidateQueries({ queryKey: ['sales'] });
    qc.invalidateQueries({ queryKey: ['cash_transactions'] });
    qc.invalidateQueries({ queryKey: ['cash_balance'] });
    return data;
  }, [qc]);

  return { getSales, addSale, saveSales };
};

// ============ STAFF ============
export const useSupabaseStaff = () => {
  const qc = useQueryClient();

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return [];
      const { data } = await supabase.from('staff').select('*').eq('user_id', userId);
      return (data || []).map(s => ({
        id: s.id, name: s.name, firstName: s.first_name, lastName: s.last_name,
        email: s.email || '', phone: s.phone || '', role: s.role || '',
        permissions: [], isActive: s.is_active !== false,
        createdAt: s.created_at, updatedAt: s.updated_at,
      }));
    },
  });

  const getStaff = useCallback(() => staff, [staff]);

  const addStaffMember = useCallback(async (member: any) => {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await supabase.from('staff').insert({
      user_id: userId, name: member.name, first_name: member.firstName,
      last_name: member.lastName, email: member.email, phone: member.phone,
      role: member.role, is_active: member.isActive !== false,
    }).select().single();
    qc.invalidateQueries({ queryKey: ['staff'] });
    return data;
  }, [qc]);

  const updateStaffMember = useCallback(async (id: string, updates: any) => {
    const mapped: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.firstName !== undefined) mapped.first_name = updates.firstName;
    if (updates.lastName !== undefined) mapped.last_name = updates.lastName;
    if (updates.email !== undefined) mapped.email = updates.email;
    if (updates.phone !== undefined) mapped.phone = updates.phone;
    if (updates.role !== undefined) mapped.role = updates.role;
    if (updates.isActive !== undefined) mapped.is_active = updates.isActive;
    await supabase.from('staff').update(mapped).eq('id', id);
    qc.invalidateQueries({ queryKey: ['staff'] });
  }, [qc]);

  const deleteStaffMember = useCallback(async (id: string) => {
    await supabase.from('staff').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['staff'] });
  }, [qc]);

  return { getStaff, addStaffMember, updateStaffMember, deleteStaffMember };
};

// ============ CASH ============
export const useSupabaseCash = () => {
  const qc = useQueryClient();

  const { data: cashBalance = null } = useQuery({
    queryKey: ['cash_balance'],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return null;
      const { data } = await supabase.from('cash_balance').select('*').eq('user_id', userId).single();
      if (!data) return null;
      return {
        id: data.id, initialAmount: data.initial_amount,
        currentAmount: data.current_amount,
        lastUpdated: data.last_updated, createdAt: data.created_at,
      };
    },
  });

  const getCashBalance = useCallback(() => cashBalance, [cashBalance]);

  const setCashBalance = useCallback(async (amount: number) => {
    const userId = await getUserId();
    if (!userId) return null;
    const existing = cashBalance;
    if (existing) {
      await supabase.from('cash_balance').update({
        initial_amount: amount, current_amount: amount,
        last_updated: new Date().toISOString(),
      }).eq('id', existing.id);
    }
    qc.invalidateQueries({ queryKey: ['cash_balance'] });
  }, [qc, cashBalance]);

  const updateCashBalance = useCallback(async (newAmount: number) => {
    if (!cashBalance) return null;
    await supabase.from('cash_balance').update({
      current_amount: newAmount, last_updated: new Date().toISOString(),
    }).eq('id', cashBalance.id);
    qc.invalidateQueries({ queryKey: ['cash_balance'] });
  }, [qc, cashBalance]);

  const { data: cashTransactions = [] } = useQuery({
    queryKey: ['cash_transactions'],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return [];
      const { data } = await supabase.from('cash_transactions').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
      return (data || []).map(t => ({
        id: t.id, type: t.type as 'income' | 'expense',
        amount: t.amount, description: t.description || '',
        category: t.category || '', relatedSaleId: t.related_sale_id,
        timestamp: t.timestamp,
      }));
    },
  });

  const getCashTransactions = useCallback(() => cashTransactions, [cashTransactions]);

  const addCashTransaction = useCallback(async (transaction: any) => {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await supabase.from('cash_transactions').insert({
      user_id: userId, type: transaction.type, amount: transaction.amount,
      description: transaction.description, category: transaction.category,
      related_sale_id: transaction.relatedSaleId,
    }).select().single();

    // Update balance
    if (cashBalance) {
      const newAmount = transaction.type === 'income'
        ? cashBalance.currentAmount + transaction.amount
        : cashBalance.currentAmount - transaction.amount;
      await updateCashBalance(newAmount);
    }

    qc.invalidateQueries({ queryKey: ['cash_transactions'] });
    return data;
  }, [qc, cashBalance, updateCashBalance]);

  const deleteCashTransaction = useCallback(async (id: string) => {
    const tx = cashTransactions.find((t: any) => t.id === id);
    if (!tx) return;
    await supabase.from('cash_transactions').delete().eq('id', id);
    if (cashBalance) {
      const newAmount = tx.type === 'income'
        ? cashBalance.currentAmount - tx.amount
        : cashBalance.currentAmount + tx.amount;
      await updateCashBalance(newAmount);
    }
    qc.invalidateQueries({ queryKey: ['cash_transactions'] });
  }, [qc, cashTransactions, cashBalance, updateCashBalance]);

  return { getCashBalance, setCashBalance, updateCashBalance, getCashTransactions, addCashTransaction, deleteCashTransaction };
};

// ============ SETTINGS ============
export const useSupabaseSettings = () => {
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return { barName: '', address: '', phone: '', email: '', darkMode: true, notifications: true, lowStockAlerts: true };
      const { data } = await supabase.from('settings').select('*').eq('user_id', userId).single();
      if (!data) return { barName: '', address: '', phone: '', email: '', darkMode: true, notifications: true, lowStockAlerts: true };
      return {
        barName: data.bar_name || '', address: data.address || '',
        phone: data.phone || '', email: data.email || '',
        darkMode: data.dark_mode !== false, notifications: data.notifications !== false,
        lowStockAlerts: data.low_stock_alerts !== false,
      };
    },
  });

  const defaultSettings = { barName: '', address: '', phone: '', email: '', darkMode: true, notifications: true, lowStockAlerts: true };
  const getSettings = useCallback(() => settings || defaultSettings, [settings]);

  const updateSettings = useCallback(async (updates: any) => {
    const userId = await getUserId();
    if (!userId) return;
    const mapped: any = { updated_at: new Date().toISOString() };
    if (updates.barName !== undefined) mapped.bar_name = updates.barName;
    if (updates.address !== undefined) mapped.address = updates.address;
    if (updates.phone !== undefined) mapped.phone = updates.phone;
    if (updates.email !== undefined) mapped.email = updates.email;
    if (updates.darkMode !== undefined) mapped.dark_mode = updates.darkMode;
    if (updates.notifications !== undefined) mapped.notifications = updates.notifications;
    if (updates.lowStockAlerts !== undefined) mapped.low_stock_alerts = updates.lowStockAlerts;
    await supabase.from('settings').update(mapped).eq('user_id', userId);
    qc.invalidateQueries({ queryKey: ['settings'] });
  }, [qc]);

  return { getSettings, updateSettings };
};

// ============ TABLES ============
export const useSupabaseTables = () => {
  const qc = useQueryClient();

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const userId = await getUserId();
      if (!userId) return [];
      const { data } = await supabase.from('tables').select('*').eq('user_id', userId).order('name');
      return (data || []).map(t => ({
        id: t.id, name: t.name, capacity: t.capacity || 4,
        status: (t.status || 'available') as 'available' | 'occupied' | 'reserved',
        isActive: t.is_active !== false, createdAt: t.created_at,
      }));
    },
  });

  const getTables = useCallback(() => tables, [tables]);

  const saveTables = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['tables'] });
  }, [qc]);

  const addTable = useCallback(async (tableData: any) => {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await supabase.from('tables').insert({
      user_id: userId, name: tableData.name, capacity: tableData.capacity,
      status: tableData.status || 'available', is_active: tableData.isActive !== false,
    }).select().single();
    qc.invalidateQueries({ queryKey: ['tables'] });
    return data;
  }, [qc]);

  const updateTable = useCallback(async (id: string, updates: any) => {
    const mapped: any = {};
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.capacity !== undefined) mapped.capacity = updates.capacity;
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.isActive !== undefined) mapped.is_active = updates.isActive;
    await supabase.from('tables').update(mapped).eq('id', id);
    qc.invalidateQueries({ queryKey: ['tables'] });
  }, [qc]);

  const deleteTable = useCallback(async (id: string) => {
    await supabase.from('tables').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['tables'] });
  }, [qc]);

  return { getTables, saveTables, addTable, updateTable, deleteTable };
};
