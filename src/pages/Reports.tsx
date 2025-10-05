import React, { useState, useEffect } from "react";
import { Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocalData } from "@/hooks/useLocalData";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DailyTransactions from "@/components/DailyTransactions";
import { formatDateForStorage, getTodayDateString } from "@/lib/dateUtils";
import { CashManager } from "@/components/cash/CashManager";
import { SpendsManager } from "@/components/spends/SpendsManager";
import AdvancedAnalytics from "@/components/analytics/AdvancedAnalytics";
import ProfitabilityAnalysis from "@/components/analytics/ProfitabilityAnalysis";
import PeriodComparison from "@/components/analytics/PeriodComparison";
import AccountingExport from "@/components/analytics/AccountingExport";
import { PageWithSkeleton } from "@/components/PageWithSkeleton";
import { useSkeletonLoading } from "@/hooks/useSkeletonLoading";
import RestockDialog from "@/components/inventory/RestockDialog";

const Reports = () => {
  const { getSales, getInventory, getStaff } = useLocalData();
  const [sales, setSales] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDailyTransactions, setShowDailyTransactions] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [restockItem, setRestockItem] = useState<any>(null);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const isSkeletonLoading = useSkeletonLoading(isDataLoaded);

  useEffect(() => {
    const loadData = () => {
      setSales(getSales());
      setInventory(getInventory());
      setStaff(getStaff());
      setIsDataLoaded(true);
    };
    
    loadData();
  }, [getSales, getInventory, getStaff]);

  // Calcul des statistiques de ventes avec dates cohérentes
  const today = getTodayDateString();
  
  // Calculer correctement le début de la semaine (7 jours en arrière)
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const weekStartString = formatDateForStorage(thisWeekStart);
  
  // Calculer correctement le début du mois
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  const monthStartString = formatDateForStorage(thisMonthStart);

  const todaySales = sales.filter(sale => sale.date === today);
  const weekSales = sales.filter(sale => sale.date >= weekStartString);
  const monthSales = sales.filter(sale => sale.date >= monthStartString);

  const dailyTotal = todaySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const weeklyTotal = weekSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const monthlyTotal = monthSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  // Calculer les articles les plus vendus
  const itemSales: Record<string, { sales: number; revenue: number }> = {};
  sales.forEach(sale => {
    if (!itemSales[sale.item]) {
      itemSales[sale.item] = { sales: 0, revenue: 0 };
    }
    itemSales[sale.item].sales += Number(sale.quantity || 0);
    itemSales[sale.item].revenue += Number(sale.total || 0);
  });

  const topItems = Object.entries(itemSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Analyser l'inventaire pour les alertes
  const lowStockItems = inventory.filter(item => 
    Number(item.quantity || 0) <= Number(item.threshold || 0) && Number(item.quantity || 0) > 0
  );
  const outOfStockItems = inventory.filter(item => Number(item.quantity || 0) <= 0);

  // Calculer les tendances de consommation par catégorie
  const categoryTrends: Record<string, number> = {};
  sales.forEach(sale => {
    const item = inventory.find(inv => inv.name === sale.item);
    const category = item?.category || 'Autres';
    if (!categoryTrends[category]) {
      categoryTrends[category] = 0;
    }
    categoryTrends[category] += Number(sale.quantity || 0);
  });

  // Calculer les performances du personnel - corrigé
  const staffPerformance = staff.filter(member => member.isActive).map(member => {
    const memberSales = sales.filter(sale => sale.sellerName === member.name);
    const totalRevenue = memberSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    return {
      ...member,
      totalRevenue,
      salesCount: memberSales.length
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Formatage en XOF
  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Obtenir les transactions pour la date sélectionnée
  const getTransactionsForDate = (date: Date) => {
    const dateString = formatDateForStorage(date);
    return sales.filter(sale => sale.date === dateString);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowDailyTransactions(true);
    }
  };

  const handleRestockClick = (item: any) => {
    setRestockItem(item);
    setShowRestockDialog(true);
  };

  const handleRestockClose = () => {
    setShowRestockDialog(false);
    setRestockItem(null);
    // Recharger les données pour refléter les changements
    setSales(getSales());
    setInventory(getInventory());
  };

  return (
    <PageWithSkeleton isLoading={isSkeletonLoading}>
      <div className="mobile-container">
        <Header 
          rightContent={
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar size={16} className="mr-1" />
                  {format(selectedDate, "dd MMM yyyy", { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          }
        />

        <main className="px-4 py-4 space-y-4 pb-24">
          {showDailyTransactions && (
            <DailyTransactions
              date={selectedDate}
              transactions={getTransactionsForDate(selectedDate)}
              onClose={() => setShowDailyTransactions(false)}
            />
          )}

          <Tabs defaultValue="sales">
            <TabsList className="w-full grid grid-cols-7 h-auto p-1">
              <TabsTrigger value="sales" className="text-xs px-1 py-2 min-w-0">
                <span className="truncate">Ventes</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="text-xs px-1 py-2 min-w-0">
                <span className="truncate">Stock</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="text-xs px-1 py-2 min-w-0">
                <span className="truncate">Staff</span>
              </TabsTrigger>
              <TabsTrigger value="cash" className="text-xs px-1 py-2 min-w-0">
                <span className="truncate">Caisse</span>
              </TabsTrigger>
              <TabsTrigger value="spends" className="text-xs px-1 py-2 min-w-0">
                <span className="truncate">Dépenses</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs px-1 py-2 min-w-0">
                <span className="truncate">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs px-1 py-2 min-w-0">
                <span className="truncate">Avancé</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales" className="space-y-4 mt-4">
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <TrendingUp size={18} className="text-bar-purple mr-2" />
                  Aperçu des Ventes
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Aujourd'hui</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatXOF(dailyTotal)}</span>
                      <span className="text-blue-500 text-xs flex items-center">
                        {todaySales.length} ventes
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cette Semaine</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatXOF(weeklyTotal)}</span>
                      <span className="text-green-500 text-xs flex items-center">
                        {weekSales.length} ventes
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ce Mois</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatXOF(monthlyTotal)}</span>
                      <span className="text-green-500 text-xs flex items-center">
                        {monthSales.length} ventes
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <BarChart3 size={18} className="text-bar-purple mr-2" />
                  Articles les Plus Vendus
                </h3>
                
                {topItems.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Aucune vente enregistrée
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {item.sales} vendus
                          </div>
                        </div>
                        <span className="font-medium">{formatXOF(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-4 mt-4">
              <Card className="p-4">
                <h3 className="font-medium">Alertes Inventaire</h3>
                <div className="space-y-3 mt-3">
                  {outOfStockItems.length === 0 && lowStockItems.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune alerte d'inventaire
                    </div>
                  ) : (
                    <>
                      {outOfStockItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span>{item.name}</span>
                            <div className="text-xs text-red-500">Rupture de stock</div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleRestockClick(item)}>Commander</Button>
                        </div>
                      ))}
                      
                      {lowStockItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span>{item.name}</span>
                            <div className="text-xs text-yellow-500">
                              Stock faible ({item.quantity} {item.unit})
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleRestockClick(item)}>Commander</Button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-medium">Tendances de Consommation</h3>
                <div className="space-y-3 mt-3">
                  {Object.keys(categoryTrends).length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune donnée de consommation
                    </div>
                  ) : (
                    Object.entries(categoryTrends).map(([category, quantity], index) => {
                      const maxQuantity = Math.max(...Object.values(categoryTrends));
                      const percentage = maxQuantity > 0 ? (Number(quantity) / maxQuantity) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <span>{category}</span>
                          <div className="flex items-center gap-2">
                            <span>{Number(quantity)} vendus</span>
                            <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-bar-purple" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="staff" className="mt-4">
              <Card className="p-4">
                <h3 className="font-medium">Performance du Personnel</h3>
                <div className="space-y-4 mt-3">
                  {staffPerformance.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucun membre du personnel actif
                    </div>
                  ) : (
                    staffPerformance.map((member, index) => {
                      const maxRevenue = Math.max(...staffPerformance.map(s => s.totalRevenue), 1);
                      const percentage = (member.totalRevenue / maxRevenue) * 100;
                      
                      return (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span>{member.name}</span>
                            <span className="text-sm">{formatXOF(member.totalRevenue)} ({member.salesCount} ventes)</span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                index === 0 ? 'bg-green-500' : 
                                index === 1 ? 'bg-bar-purple' : 
                                index === 2 ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="cash" className="mt-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Gestion de Caisse</h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-300">Suivez vos flux de trésorerie</p>
                    </div>
                  </div>
                  <CashManager />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="spends" className="mt-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7c0-2-1-3.5-3.5-3.5S10 5 10 7v2m7 0v11a1 1 0 01-1 1H8a1 1 0 01-1-1V9a1 1 0 011-1h8a1 1 0 011 1z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-800 dark:text-orange-200">Gestion des Dépenses</h3>
                      <p className="text-sm text-orange-600 dark:text-orange-300">Contrôlez vos sorties de fonds</p>
                    </div>
                  </div>
                  <SpendsManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-4">
              <AdvancedAnalytics />
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-4">
              <div className="space-y-4">
                <ProfitabilityAnalysis />
                <PeriodComparison />
                <AccountingExport />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Dialog de réapprovisionnement */}
        {restockItem && (
          <RestockDialog 
            isOpen={showRestockDialog}
            onClose={handleRestockClose}
            item={restockItem}
          />
        )}
      </div>
    </PageWithSkeleton>
  );
};

export default Reports;
