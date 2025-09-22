
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalData } from '@/hooks/useLocalData';
import { Table as TableIcon, Users, Receipt, Calculator } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getTodayDateString } from '@/lib/dateUtils';

interface TableSale {
  tableId: string;
  tableName: string;
  sales: any[];
  totalAmount: number;
  itemCount: number;
}

const TableSalesView = () => {
  const { getSales, getTables } = useLocalData();
  const [tableSales, setTableSales] = useState<TableSale[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  useEffect(() => {
    const loadTableSales = () => {
      const sales = getSales();
      const tables = getTables();
      const today = getTodayDateString();
      
      // Filtrer les ventes du jour
      const todaySales = sales.filter(sale => sale.date === today);
      
      // Grouper par table
      const salesByTable: Record<string, any[]> = {};
      
      todaySales.forEach(sale => {
        const tableId = sale.tableId || 'no-table';
        if (!salesByTable[tableId]) {
          salesByTable[tableId] = [];
        }
        salesByTable[tableId].push(sale);
      });

      // Créer le résumé par table
      const tablesSummary: TableSale[] = Object.entries(salesByTable).map(([tableId, sales]) => {
        const table = tables.find(t => t.id === tableId);
        const tableName = table?.name || (tableId === 'no-table' ? 'Sans table' : 'Table inconnue');
        
        const totalAmount = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const itemCount = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
        
        return {
          tableId,
          tableName,
          sales,
          totalAmount,
          itemCount
        };
      });

      // Trier par montant décroissant
      tablesSummary.sort((a, b) => b.totalAmount - a.totalAmount);
      setTableSales(tablesSummary);
    };

    loadTableSales();
    const interval = setInterval(loadTableSales, 2000);
    return () => clearInterval(interval);
  }, [getSales, getTables]);

  const selectedTableData = tableSales.find(t => t.tableId === selectedTable);

  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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
            <h3 className="text-lg font-medium">{selectedTableData.tableName}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatXOF(selectedTableData.totalAmount)}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedTableData.itemCount} articles
            </div>
          </div>
        </div>

        <Card className="p-4">
          <h4 className="font-medium mb-3">Détail des commandes</h4>
          <div className="space-y-3">
            {selectedTableData.sales.map((sale, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div>
                  <span className="font-medium">{sale.item}</span>
                  <div className="text-sm text-muted-foreground">
                    {sale.quantity} × {formatXOF(sale.unitPrice)}
                    {sale.sellerName && <span className="ml-2">• {sale.sellerName}</span>}
                  </div>
                </div>
                <span className="font-medium">{formatXOF(sale.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <TableIcon size={20} />
          Tables Actives Aujourd'hui
        </h3>
        <div className="text-sm text-muted-foreground">
          {tableSales.length} table(s)
        </div>
      </div>

      {tableSales.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <TableIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucune vente avec table aujourd'hui</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tableSales.map((tableData) => (
            <Card 
              key={tableData.tableId} 
              className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => setSelectedTable(tableData.tableId)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <TableIcon size={16} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{tableData.tableName}</h4>
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
                  <div className="text-lg font-bold text-green-600">
                    {formatXOF(tableData.totalAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableSalesView;
