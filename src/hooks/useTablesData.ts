
import React, { useCallback } from 'react';
import { storage, Table } from '@/lib/storage';
import { generateRandomId } from '@/lib/utils';

export const useTablesData = () => {
  const getTables = useCallback((): Table[] => {
    return storage.load<Table[]>('tables') || [];
  }, []);

  const saveTables = useCallback((tables: Table[]) => {
    storage.save('tables', tables);
  }, []);

  const addTable = useCallback((tableData: Omit<Table, 'id' | 'createdAt'>) => {
    const tables = getTables();
    const newTable: Table = {
      ...tableData,
      id: generateRandomId(),
      createdAt: new Date().toISOString()
    };
    const updatedTables = [...tables, newTable];
    saveTables(updatedTables);
    window.dispatchEvent(new CustomEvent('tablesChanged'));
    return newTable;
  }, [getTables, saveTables]);

  const updateTable = useCallback((id: string, updates: Partial<Table>) => {
    const tables = getTables();
    const updatedTables = tables.map(table =>
      table.id === id ? { ...table, ...updates } : table
    );
    saveTables(updatedTables);
    window.dispatchEvent(new CustomEvent('tablesChanged'));
  }, [getTables, saveTables]);

  const deleteTable = useCallback((id: string) => {
    const tables = getTables();
    const updatedTables = tables.filter(table => table.id !== id);
    saveTables(updatedTables);
    window.dispatchEvent(new CustomEvent('tablesChanged'));
  }, [getTables, saveTables]);

  return {
    getTables,
    saveTables,
    addTable,
    updateTable,
    deleteTable
  };
};
