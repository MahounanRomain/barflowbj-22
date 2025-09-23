import React, { useCallback } from 'react';
import { useLocalData } from './useLocalData';
import { getTodayDateString } from '@/lib/dateUtils';

export interface TableBalance {
  tableId: string;
  tableName: string;
  totalAmount: number;
  itemCount: number;
  sales: any[];
  lastUpdated: string;
}

export const useTableBalance = () => {
  const { getSales, getTables, updateTable } = useLocalData();

  const getTableBalance = useCallback((tableId: string): TableBalance | null => {
    const sales = getSales();
    const tables = getTables();
    const table = tables.find(t => t.id === tableId);
    
    if (!table) return null;

    const today = getTodayDateString();
    const tableSales = sales.filter(sale => 
      sale.tableId === tableId && sale.date === today
    );

    const totalAmount = tableSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const itemCount = tableSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);

    return {
      tableId,
      tableName: table.name,
      totalAmount,
      itemCount,
      sales: tableSales,
      lastUpdated: new Date().toISOString()
    };
  }, [getSales, getTables]);

  const getAllTableBalances = useCallback((): TableBalance[] => {
    const tables = getTables();
    const occupiedTables = tables.filter(table => table.status === 'occupied');
    
    return occupiedTables.map(table => getTableBalance(table.id)).filter(Boolean) as TableBalance[];
  }, [getTables, getTableBalance]);

  const setTableStatus = useCallback((tableId: string, status: 'available' | 'occupied' | 'reserved') => {
    const tables = getTables();
    const table = tables.find(t => t.id === tableId);
    
    if (table && table.status !== status) {
      updateTable(tableId, { status });
      
      // Si la table devient libre, on peut considérer que le solde est "payé"
      // mais on garde les ventes dans l'historique pour les rapports
      if (status === 'available') {
        console.log(`Table ${table.name} libérée - solde réinitialisé conceptuellement`);
      }
    }
  }, [getTables, updateTable]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  return {
    getTableBalance,
    getAllTableBalances,
    setTableStatus,
    formatCurrency
  };
};