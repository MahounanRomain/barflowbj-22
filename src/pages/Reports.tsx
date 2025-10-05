import { useState, useEffect, useMemo } from "react";
import { Calendar, TrendingUp, Package, Users, DollarSign, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalData } from "@/hooks/useLocalData";
import { PageWithSkeleton } from "@/components/PageWithSkeleton";
import { useSkeletonLoading } from "@/hooks/useSkeletonLoading";
import { DateRange, getDateRangeForPreset, filterSalesByDateRange, calculateTotals } from "@/lib/dateFilters";
import { formatDateForStorage } from "@/lib/dateUtils";
import ProfitabilityAnalysis from "@/components/analytics/ProfitabilityAnalysis";
import PeriodComparison from "@/components/analytics/PeriodComparison";
import AccountingExport from "@/components/analytics/AccountingExport";
import StockPredictions from "@/components/analytics/StockPredictions";
import { CashManager } from "@/components/cash/CashManager";
import { SpendsManager } from "@/components/spends/SpendsManager";
import SalesChart from "@/components/SalesChart";

const Reports = () => {
  const { getSales, getInventory, getStaff } = useLocalData();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isSkeletonLoading = useSkeletonLoading(isDataLoaded);
  
  // État centralisé pour le filtre de dates
  const [dateRange, setDateRange] = useState<DateRange>(() => getDateRangeForPreset('thisMonth'));
  const [activePreset, setActivePreset] = useState('thisMonth');

  // Données brutes
  const [allSales, setAllSales] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      setAllSales(getSales());
      setInventory(getInventory());
      setStaff(getStaff());
      setIsDataLoaded(true);
    };
    loadData();
  }, [getSales, getInventory, getStaff]);

  // Filtrer les ventes selon la période sélectionnée - LOGIQUE CENTRALISÉE
  const filteredSales = useMemo(() => {
    return filterSalesByDateRange(allSales, dateRange);
  }, [allSales, dateRange]);

  // Calculer les statistiques - UNIQUE SOURCE DE VÉRITÉ
  const stats = useMemo(() => {
    const totals = calculateTotals(filteredSales);
    
    // Articles les plus vendus
    const itemSales: Record<string, { quantity: number; revenue: number }> = {};
    filteredSales.forEach(sale => {
      if (!itemSales[sale.item]) {
        itemSales[sale.item] = { quantity: 0, revenue: 0 };
      }
      itemSales[sale.item].quantity += Number(sale.quantity || 0);
      itemSales[sale.item].revenue += Number(sale.total || 0);
    });

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Tendances par catégorie
    const categoryTrends: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const item = inventory.find(inv => inv.name === sale.item);
      const category = item?.category || 'Autres';
      categoryTrends[category] = (categoryTrends[category] || 0) + Number(sale.quantity || 0);
    });

    // Performance du personnel
    const staffPerformance = staff
      .filter(member => member.isActive)
      .map(member => {
        const memberSales = filteredSales.filter(sale => sale.sellerName === member.name);
        const totalRevenue = memberSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
        return {
          ...member,
          totalRevenue,
          salesCount: memberSales.length
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      totals,
      topItems,
      categoryTrends,
      staffPerformance
    };
  }, [filteredSales, inventory, staff]);

  // Alertes inventaire
  const inventoryAlerts = useMemo(() => {
    const lowStock = inventory.filter(item => 
      Number(item.quantity || 0) <= Number(item.threshold || 0) && Number(item.quantity || 0) > 0
    );
    const outOfStock = inventory.filter(item => Number(item.quantity || 0) <= 0);
    
    return { lowStock, outOfStock };
  }, [inventory]);

  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePresetChange = (preset: string) => {
    setActivePreset(preset);
    setDateRange(getDateRangeForPreset(preset));
  };

  const periodButtons = [
    { label: '7 jours', value: '7d' },
    { label: '14 jours', value: '14d' },
    { label: '30 jours', value: '30d' },
    { label: 'Semaine', value: 'thisWeek' },
    { label: 'Mois', value: 'thisMonth' },
    { label: 'Année', value: 'thisYear' },
    { label: 'Tout', value: 'allTime' }
  ];

  return (
    <PageWithSkeleton isLoading={isSkeletonLoading}>
      <div className="mobile-container">
        <Header title="Rapports" />

        <main className="px-4 py-4 space-y-4 pb-24">
          {/* Filtres de période - CENTRALISÉS */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Période d'analyse</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {periodButtons.map(btn => (
                <button
                  key={btn.value}
                  onClick={() => handlePresetChange(btn.value)}
                  className={`px-3 py-2 text-xs rounded-lg transition-all ${
                    activePreset === btn.value
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Du {dateRange.start} au {dateRange.end}
            </p>
          </Card>

          {/* Statistiques globales */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Chiffre d'Affaires</span>
              </div>
              <div className="text-2xl font-bold">{formatXOF(stats.totals.revenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.totals.count} ventes</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Articles vendus</span>
              </div>
              <div className="text-2xl font-bold">{stats.totals.items}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totals.count > 0 ? (stats.totals.items / stats.totals.count).toFixed(1) : 0} / vente
              </p>
            </Card>
          </div>

          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="w-full grid grid-cols-6 h-auto p-1">
              <TabsTrigger value="sales" className="text-xs px-1 py-2">
                Ventes
              </TabsTrigger>
              <TabsTrigger value="inventory" className="text-xs px-1 py-2">
                Stock
              </TabsTrigger>
              <TabsTrigger value="staff" className="text-xs px-1 py-2">
                Staff
              </TabsTrigger>
              <TabsTrigger value="cash" className="text-xs px-1 py-2">
                Caisse
              </TabsTrigger>
              <TabsTrigger value="spends" className="text-xs px-1 py-2">
                Dépenses
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs px-1 py-2">
                Avancé
              </TabsTrigger>
            </TabsList>

            {/* Ventes */}
            <TabsContent value="sales" className="space-y-4 mt-4">
              <SalesChart sales={filteredSales} />
              
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <BarChart3 size={18} className="text-primary mr-2" />
                  Top des ventes
                </h3>
                {stats.topItems.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    Aucune vente sur cette période
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.topItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {item.quantity} vendus
                          </div>
                        </div>
                        <span className="font-semibold">{formatXOF(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Stock */}
            <TabsContent value="inventory" className="space-y-4 mt-4">
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Package className="h-4 w-4 text-orange-500 mr-2" />
                  Alertes inventaire
                </h3>
                {inventoryAlerts.outOfStock.length === 0 && inventoryAlerts.lowStock.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    Aucune alerte
                  </p>
                ) : (
                  <div className="space-y-2">
                    {inventoryAlerts.outOfStock.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span>{item.name}</span>
                        <span className="text-red-500 font-medium">Rupture</span>
                      </div>
                    ))}
                    {inventoryAlerts.lowStock.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span>{item.name}</span>
                        <span className="text-yellow-500 font-medium">
                          Stock faible ({item.quantity})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-3">Tendances par catégorie</h3>
                {Object.keys(stats.categoryTrends).length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    Aucune donnée
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(stats.categoryTrends).map(([category, qty], idx) => {
                      const maxQty = Math.max(...Object.values(stats.categoryTrends));
                      const percentage = maxQty > 0 ? (Number(qty) / maxQty) * 100 : 0;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category}</span>
                            <span>{Number(qty)} vendus</span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              <StockPredictions />
            </TabsContent>

            {/* Personnel */}
            <TabsContent value="staff" className="space-y-4 mt-4">
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Users className="h-4 w-4 text-blue-500 mr-2" />
                  Performance du personnel
                </h3>
                {stats.staffPerformance.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    Aucun membre actif
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.staffPerformance.map((member, idx) => {
                      const maxRevenue = Math.max(...stats.staffPerformance.map(s => s.totalRevenue), 1);
                      const percentage = (member.totalRevenue / maxRevenue) * 100;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between mb-1 text-sm">
                            <span className="font-medium">{member.name}</span>
                            <span>
                              {formatXOF(member.totalRevenue)} ({member.salesCount} ventes)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Caisse */}
            <TabsContent value="cash" className="mt-4">
              <CashManager />
            </TabsContent>

            {/* Dépenses */}
            <TabsContent value="spends" className="mt-4">
              <SpendsManager />
            </TabsContent>

            {/* Avancé */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <ProfitabilityAnalysis />
              <PeriodComparison dateFilter={{
                type: 'custom',
                startDate: dateRange.start,
                endDate: dateRange.end,
                label: `Période personnalisée`
              }} />
              <AccountingExport />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageWithSkeleton>
  );
};

export default Reports;
