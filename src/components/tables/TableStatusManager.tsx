
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useLocalData } from '@/hooks/useLocalData';
import { useTableBalance } from '@/hooks/useTableBalance';
import { useToast } from '@/hooks/use-toast';
import { Table as TableIcon } from 'lucide-react';
import { TableStatusCard } from './TableStatusCard';
import { TableActions } from './TableActions';
import { Table } from '@/lib/storage';

const TableStatusManager = React.memo(() => {
  const { getTables } = useLocalData();
  const { getTableBalance, setTableStatus, formatCurrency } = useTableBalance();
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const loadTables = () => {
      const tablesData = getTables();
      setTables(tablesData);
    };

    loadTables();
    const interval = setInterval(loadTables, 2000);
    return () => clearInterval(interval);
  }, [getTables]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Libre';
      case 'occupied': return 'Occupée';
      case 'reserved': return 'Réservée';
      default: return 'Inconnu';
    }
  };

  const handleStatusChange = (tableId: string, newStatus: 'available' | 'occupied') => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    setTableStatus(tableId, newStatus);
    
    if (newStatus === 'available' && table.status === 'occupied') {
      const balance = getTableBalance(tableId);
      toast({
        title: "Table libérée",
        description: `${table.name} est maintenant libre. ${balance ? `Solde: ${formatCurrency(balance.totalAmount)}` : ''}`,
      });
    } else {
      toast({
        title: "Statut mis à jour",
        description: `${table.name} est maintenant ${getStatusLabel(newStatus).toLowerCase()}`,
      });
    }
  };

  const tablesWithBalances = useMemo(() => {
    return tables.map(table => ({
      table,
      balance: table.status === 'occupied' ? getTableBalance(table.id) : null
    }));
  }, [tables, getTableBalance]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <TableIcon size={20} />
          Statuts des Tables
        </h3>
        <div className="text-sm text-muted-foreground">
          {tables.length} table(s)
        </div>
      </div>

      <div className="grid gap-3">
        {tablesWithBalances.map(({ table, balance }) => (
          <div key={table.id} className="space-y-2">
            <TableStatusCard
              table={table}
              balance={balance}
              onStatusChange={handleStatusChange}
              formatCurrency={formatCurrency}
            />
            <div className="pt-2 border-t border-border">
              <TableActions
                table={table}
                balance={balance}
                onStatusChange={handleStatusChange}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <TableIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucune table créée</p>
            <p className="text-sm">Allez dans l'onglet "Gestion" pour créer des tables</p>
          </div>
        </Card>
      )}
    </div>
  );
});

TableStatusManager.displayName = 'TableStatusManager';

export default TableStatusManager;
