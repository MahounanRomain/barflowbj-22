
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalData } from '@/hooks/useLocalData';
import { useTableBalance } from '@/hooks/useTableBalance';
import { 
  Table as TableIcon, 
  Users, 
  Receipt, 
  Calculator, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { getTodayDateString } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { TableSalesData, TableStatus } from '@/types/app';
import { Table, SaleRecord } from '@/lib/storage';

interface TableSale extends Omit<TableSalesData, 'status'> {
  status: TableStatus | 'none';
}

const EnhancedTableSalesView = React.memo(() => {
  const { getSales, getTables } = useLocalData();
  const { formatCurrency } = useTableBalance();
  const [tableSales, setTableSales] = useState<TableSale[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'occupied' | 'available'>('all');

  // Mémoiser les données de base
  const memoizedData = useMemo(() => {
    const sales = getSales();
    const tables = getTables();
    const today = getTodayDateString();
    
    return { sales, tables, today };
  }, [getSales, getTables]);

  // Calculer les ventes par table avec useMemo
  const processedTableSales = useMemo(() => {
    const { sales, tables, today } = memoizedData;
    
    // Filtrer les ventes du jour
    const todaySales = sales.filter((sale: SaleRecord) => sale.date === today);
    
    // Grouper par table
    const salesByTable: Record<string, SaleRecord[]> = {};
    
    todaySales.forEach((sale: SaleRecord) => {
      const tableId = sale.tableId || 'no-table';
      if (!salesByTable[tableId]) {
        salesByTable[tableId] = [];
      }
      salesByTable[tableId].push(sale);
    });

    // Créer le résumé par table
    const allTables = tables.map((table: Table): TableSale => {
      const tableSales = salesByTable[table.id] || [];
      const totalAmount = tableSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const itemCount = tableSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
      
      return {
        tableId: table.id,
        tableName: table.name,
        sales: tableSales,
        totalAmount,
        itemCount,
        status: table.status
      };
    });

    // Ajouter les ventes sans table
    if (salesByTable['no-table']) {
      const noTableSales = salesByTable['no-table'];
      const totalAmount = noTableSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const itemCount = noTableSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
      
      allTables.push({
        tableId: 'no-table',
        tableName: 'Sans table',
        sales: noTableSales,
        totalAmount,
        itemCount,
        status: 'none' as const
      });
    }

    return allTables;
  }, [memoizedData]);

  // Filtrer et trier avec useMemo
  const filteredAndSortedTables = useMemo(() => {
    let filteredTables = processedTableSales;
    
    if (filter === 'occupied') {
      filteredTables = processedTableSales.filter(table => 
        table.status === 'occupied' || table.totalAmount > 0
      );
    } else if (filter === 'available') {
      filteredTables = processedTableSales.filter(table => 
        table.tableId !== 'no-table' && table.status === 'available' && table.totalAmount === 0
      );
    }

    return filteredTables.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [processedTableSales, filter]);

  // Mettre à jour l'état avec les données filtrées
  useEffect(() => {
    setTableSales(filteredAndSortedTables);
  }, [filteredAndSortedTables]);

  // Mémoiser les statistiques
  const statistics = useMemo(() => {
    const totalRevenue = tableSales.reduce((sum, table) => sum + table.totalAmount, 0);
    const occupiedTables = tableSales.filter(table => table.status === 'occupied' || table.totalAmount > 0);
    
    return { totalRevenue, occupiedTablesCount: occupiedTables.length };
  }, [tableSales]);

  const selectedTableData = useMemo(() => 
    tableSales.find(t => t.tableId === selectedTable),
    [tableSales, selectedTable]
  );

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} className="text-success" />;
      case 'occupied': return <Clock size={16} className="text-warning" />;
      case 'reserved': return <AlertCircle size={16} className="text-info" />;
      default: return <TableIcon size={16} className="text-muted-foreground" />;
    }
  }, []);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'available': return 'Libre';
      case 'occupied': return 'Occupée';
      case 'reserved': return 'Réservée';
      default: return '';
    }
  }, []);

  if (selectedTableData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTable(null)}
            >
              ← Retour
            </Button>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{selectedTableData.tableName}</h3>
              <Badge 
                variant="secondary"
                className={cn(
                  "text-xs",
                  selectedTableData.status === 'available' && "bg-success/10 text-success",
                  selectedTableData.status === 'occupied' && "bg-warning/10 text-warning",
                  selectedTableData.status === 'reserved' && "bg-info/10 text-info"
                )}
              >
                {getStatusLabel(selectedTableData.status)}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(selectedTableData.totalAmount)}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedTableData.itemCount} articles
            </div>
          </div>
        </div>

        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Receipt size={16} />
            Détail des commandes
          </h4>
          {selectedTableData.sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucune commande aujourd'hui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTableData.sales.map((sale, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <span className="font-medium">{sale.item}</span>
                    <div className="text-sm text-muted-foreground">
                      {sale.quantity} × {formatCurrency(sale.unitPrice)}
                      {sale.sellerName && <span className="ml-2">• {sale.sellerName}</span>}
                      <span className="ml-2">• {new Date(sale.createdAt).toLocaleTimeString('fr-FR')}</span>
                    </div>
                  </div>
                  <span className="font-medium">{formatCurrency(sale.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <TableIcon size={20} />
          Ventes par Table
        </h3>
        <div className="text-sm text-muted-foreground">
          {tableSales.length} table(s)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold">{formatCurrency(statistics.totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Total aujourd'hui</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
              <Clock size={16} className="text-warning" />
            </div>
            <div>
              <div className="text-lg font-bold">{statistics.occupiedTablesCount}</div>
              <div className="text-sm text-muted-foreground">Tables actives</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Toutes
        </Button>
        <Button
          variant={filter === 'occupied' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('occupied')}
        >
          Actives
        </Button>
        <Button
          variant={filter === 'available' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('available')}
        >
          Libres
        </Button>
      </div>

      {tableSales.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <TableIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucune table {filter === 'occupied' ? 'active' : filter === 'available' ? 'libre' : ''} aujourd'hui</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tableSales.map((tableData) => (
            <Card 
              key={tableData.tableId} 
              className={cn(
                "p-4 cursor-pointer hover:bg-muted/20 transition-colors",
                tableData.totalAmount > 0 && "border-l-4 border-l-primary"
              )}
              onClick={() => setSelectedTable(tableData.tableId)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    tableData.status === 'available' && tableData.totalAmount === 0 && "bg-success/10",
                    tableData.status === 'occupied' && "bg-warning/10",
                    tableData.status === 'reserved' && "bg-info/10",
                    tableData.totalAmount > 0 && "bg-primary/10"
                  )}>
                    {tableData.totalAmount > 0 ? (
                      <DollarSign size={16} className="text-primary" />
                    ) : (
                      getStatusIcon(tableData.status)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{tableData.tableName}</h4>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          tableData.status === 'available' && "bg-success/10 text-success",
                          tableData.status === 'occupied' && "bg-warning/10 text-warning",
                          tableData.status === 'reserved' && "bg-info/10 text-info"
                        )}
                      >
                        {tableData.tableId !== 'no-table' ? getStatusLabel(tableData.status) : 'Vente directe'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Receipt size={12} />
                        {tableData.sales.length} commandes
                      </span>
                      <span className="flex items-center gap-1">
                        <Calculator size={12} />
                        {tableData.itemCount} articles
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-lg font-bold",
                    tableData.totalAmount > 0 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {formatCurrency(tableData.totalAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tableData.totalAmount > 0 ? 'Total' : 'Pas de vente'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});

EnhancedTableSalesView.displayName = 'EnhancedTableSalesView';

export default EnhancedTableSalesView;
