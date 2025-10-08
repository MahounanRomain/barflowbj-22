
import React, { useState, useEffect, useCallback } from "react";
import { Calendar } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnifiedSaleDialog from "@/components/UnifiedSaleDialog";
import SalesChart from "@/components/SalesChart";
import TableManager from "@/components/TableManager";
import TableSalesView from "@/components/TableSalesView";
import EnhancedTableSalesView from "@/components/tables/EnhancedTableSalesView";
import TableStatusManager from "@/components/tables/TableStatusManager";
import { useLocalData } from "@/hooks/useLocalData";
import { checkAndGenerateDailyReport } from "@/lib/dailyReports";
import { useToast } from "@/hooks/use-toast";
import { getTodayDateString } from "@/lib/dateUtils";
import { SalesStats } from "@/components/sales/SalesStats";
import { RecentSales } from "@/components/sales/RecentSales";
import { PageWithSkeleton } from "@/components/PageWithSkeleton";
import { useSkeletonLoading } from "@/hooks/useSkeletonLoading";
import { useRealTimeData } from "@/hooks/useRealTimeData";

const Sales = () => {
  const { getSales, saveSales, updateInventoryItem, getInventory, updateTable } = useLocalData();
  const { toast } = useToast();
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isSkeletonLoading = useSkeletonLoading(isDataLoaded);

  const loadData = useCallback(() => {
    const salesData = getSales();
    const inventoryData = getInventory();
    setSales(salesData);
    setInventory(inventoryData);
    if (!isDataLoaded) {
      setIsDataLoaded(true);
    }
  }, [getSales, getInventory, isDataLoaded]);

  // Listen for real-time data changes
  useRealTimeData({
    dataTypes: ['sales', 'inventory', 'cashTransactions', 'cashBalance'],
    refreshCallback: loadData
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculer les statistiques
  const today = getTodayDateString();
  const todaySales = sales.filter(sale => sale.date === today);
  const totalToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItemsToday = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);

  // Calcul des bénéfices
  const calculateProfits = () => {
    return todaySales.reduce((totalProfit, sale) => {
      const inventoryItem = inventory.find(item => item.name === sale.item);
      if (inventoryItem) {
        const profit = (Number(sale.unitPrice) - Number(inventoryItem.purchasePrice)) * Number(sale.quantity);
        return totalProfit + profit;
      }
      return totalProfit;
    }, 0);
  };

  const totalProfits = calculateProfits();

  // Formatage en FCFA
  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleGenerateReport = () => {
    try {
      const fileName = checkAndGenerateDailyReport();
      if (fileName) {
        toast({
          title: "Rapport généré",
          description: `Rapport quotidien sauvegardé: ${fileName}`
        });
      } else {
        toast({
          title: "Information",
          description: "Un rapport a déjà été généré aujourd'hui"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du rapport",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    const saleToDelete = sales.find(sale => sale.id === saleId);
    if (!saleToDelete) {
      toast({
        title: "Erreur",
        description: "Vente introuvable",
        variant: "destructive"
      });
      return;
    }

    try {
      // 1. Restaurer la quantité dans l'inventaire
      const inventoryItem = inventory.find(item => item.name === saleToDelete.item);
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity + saleToDelete.quantity;
        updateInventoryItem(inventoryItem.id, { 
          quantity: newQuantity,
          stock: newQuantity 
        });
      }

      // 2. Libérer la table si elle était occupée pour cette vente
      if (saleToDelete.tableId) {
        updateTable(saleToDelete.tableId, { status: 'available' });
      }

      // 3. Supprimer la vente
      const updatedSales = sales.filter(sale => sale.id !== saleId);
      saveSales(updatedSales);

      // 4. Supprimer la transaction de trésorerie associée
      const { storage } = await import('@/lib/storage');
      const cashTransactions: any[] = storage.load('cashTransactions') || [];
      const updatedCashTransactions = cashTransactions.filter((transaction: any) => 
        transaction.relatedSaleId !== saleId
      );
      storage.save('cashTransactions', updatedCashTransactions);

      // 5. Mettre à jour le solde de trésorerie
      const cashBalance: any = storage.load('cashBalance');
      if (cashBalance && cashBalance.currentAmount !== undefined) {
        cashBalance.currentAmount -= saleToDelete.total;
        cashBalance.lastUpdated = new Date().toISOString();
        storage.save('cashBalance', cashBalance);
      }

      // 6. Nettoyer les notifications obsolètes pour l'article restauré
      if (inventoryItem) {
        const updatedInventory = inventory.map(item => 
          item.id === inventoryItem.id 
            ? { ...item, quantity: inventoryItem.quantity + saleToDelete.quantity } 
            : item
        );
      }

      // 6. Déclencher tous les événements nécessaires
      window.dispatchEvent(new CustomEvent('salesChanged'));
      window.dispatchEvent(new CustomEvent('cashTransactionsChanged'));
      window.dispatchEvent(new CustomEvent('cashBalanceChanged'));
      window.dispatchEvent(new CustomEvent('inventoryChanged'));
      window.dispatchEvent(new CustomEvent('tablesChanged'));

      toast({
        title: "✅ Vente annulée",
        description: `La vente de ${saleToDelete.item} a été annulée. Stock et table restaurés.`
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer la vente",
        variant: "destructive"
      });
    }
  };

  return (
    <PageWithSkeleton isLoading={isSkeletonLoading}>
      <div className="mobile-container animate-fade-in overflow-hidden">
        {/* Background animated elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full animate-float blur-3xl"></div>
          <div className="absolute bottom-40 left-5 w-80 h-80 bg-accent/5 rounded-full animate-gentle-bounce blur-3xl" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
        <Header 
          rightContent={
            <div className="flex gap-2 items-center animate-fade-in">
              <UnifiedSaleDialog />
            </div>
          }
        />

        <main className="px-4 py-4 space-y-4 animate-fade-in-up"
              style={{ '--stagger': 1 } as React.CSSProperties}>
          <Tabs defaultValue="sales" className="animate-scale-in">
            <TabsList className="w-full grid grid-cols-4 h-auto p-1 hover-glow">
              <TabsTrigger value="sales" className="text-xs px-2 py-2 min-w-0 transition-smooth">
                <span className="truncate">Ventes</span>
              </TabsTrigger>
              <TabsTrigger value="tables-sales" className="text-xs px-2 py-2 min-w-0">
                <span className="truncate">Tables</span>
              </TabsTrigger>
              <TabsTrigger value="tables-status" className="text-xs px-2 py-2 min-w-0">
                <span className="truncate">Statuts</span>
              </TabsTrigger>
              <TabsTrigger value="manage" className="text-xs px-2 py-2 min-w-0">
                <span className="truncate">Gestion</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales" className="space-y-4 mt-4">
              {/* Statistiques du jour */}
              <SalesStats
                totalToday={totalToday}
                totalItemsToday={totalItemsToday}
                totalProfits={totalProfits}
                formatFCFA={formatFCFA}
              />

              {/* Charts et KPIs */}
              <SalesChart sales={sales} />

              {/* Actions rapides */}
              <Card className="p-4">
                <h3 className="font-medium mb-3">Actions rapides</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleGenerateReport}
                  >
                    <Calendar size={16} className="mr-2" />
                    Générer rapport quotidien
                  </Button>
                </div>
              </Card>

              {/* Ventes récentes */}
              <RecentSales
                sales={sales}
                formatFCFA={formatFCFA}
                onDeleteSale={handleDeleteSale}
              />
            </TabsContent>
            
            <TabsContent value="tables-sales" className="mt-4">
              <EnhancedTableSalesView />
            </TabsContent>
            
            <TabsContent value="tables-status" className="mt-4">
              <TableStatusManager />
            </TabsContent>
            
            <TabsContent value="manage" className="mt-4">
              <TableManager />
            </TabsContent>
          </Tabs>
        </main>
        </div>
      </div>
    </PageWithSkeleton>
  );
};

export default Sales;
