import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, AlertTriangle, BarChart3, PieChart } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useProfitabilityAnalysis } from '@/hooks/useProfitabilityAnalysis';
import { useStockPredictions } from '@/hooks/useStockPredictions';
import { useLocalData } from '@/hooks/useLocalData';
import EnhancedDateFilter, { DateFilter } from './EnhancedDateFilter';

interface ConsolidatedKPIsProps {
  initialFilter?: DateFilter;
  onFilterChange?: (filter: DateFilter) => void;
}

const ConsolidatedKPIs: React.FC<ConsolidatedKPIsProps> = ({ 
  initialFilter, 
  onFilterChange 
}) => {
  const dashboardStats = useDashboardStats();
  const profitabilityData = useProfitabilityAnalysis();
  const { predictions } = useStockPredictions();
  const { getSales, getStaff, getInventory } = useLocalData();
  
  const [dateFilter, setDateFilter] = useState<DateFilter>(
    initialFilter || {
      type: 'preset',
      preset: '30d',
      label: '30 derniers jours'
    }
  );

  useEffect(() => {
    if (initialFilter) {
      setDateFilter(initialFilter);
    }
  }, [initialFilter]);

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    onFilterChange?.(filter);
  };
  
  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculs des KPIs consolidés avec des données réelles - AVEC FILTRE
  const allSales = getSales();
  const staff = getStaff();
  const inventory = getInventory();
  const activeStaff = staff.filter(member => member.isActive);
  
  // Filter sales based on selected date range
  const sales = useMemo(() => {
    if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
      return allSales.filter(sale => 
        sale.date >= dateFilter.startDate! && sale.date <= dateFilter.endDate!
      );
    }
    
    if (dateFilter.preset === 'all') {
      return allSales;
    }
    
    // Handle monthly filter
    if (dateFilter.preset === 'monthly' && dateFilter.month) {
      return allSales.filter(sale => sale.date.startsWith(dateFilter.month!));
    }
    
    // Handle yearly filter
    if (dateFilter.preset === 'yearly' && dateFilter.year) {
      return allSales.filter(sale => sale.date.startsWith(dateFilter.year!));
    }
    
    // Handle day-based presets
    let days = 30; // default
    switch (dateFilter.preset) {
      case '7d': days = 7; break;
      case '14d': days = 14; break;
      case '21d': days = 21; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    
    return allSales.filter(sale => sale.date >= cutoffString);
  }, [allSales, dateFilter]);
  
  // Calculs réels basés sur les données
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const totalQuantitySold = sales.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0);
  
  // Calcul du bénéfice réel
  let totalProfit = 0;
  sales.forEach(sale => {
    const item = inventory.find(inv => inv.name === sale.item);
    if (item) {
      const profit = (Number(sale.total || 0)) - (Number(item.purchasePrice || 0) * Number(sale.quantity || 0));
      totalProfit += profit;
    }
  });
  
  // Calcul de la marge moyenne réelle
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  // Calcul de la valeur du stock - CORRECTION: utiliser le prix de vente
  const totalStockValue = inventory.reduce((sum, item) => {
    const salePrice = Number(item.salePrice || 0);
    const quantity = Number(item.quantity || 0);
    return sum + (salePrice * quantity);
  }, 0);
  
  const criticalStockItems = predictions.filter(p => p.riskLevel === 'high').length;
  const stockHealth = criticalStockItems === 0 ? 'Excellent' : 
                     criticalStockItems <= 2 ? 'Bon' : 
                     criticalStockItems <= 5 ? 'Attention' : 'Critique';
  
  // Calcul du score de performance basé sur des métriques réelles
  const performanceScore = Math.min(100, Math.max(0, 
    (totalRevenue > 0 ? 30 : 0) + // 30 points si il y a du CA
    (averageMargin > 10 ? 25 : averageMargin > 5 ? 15 : averageMargin > 0 ? 10 : 0) + // 25 points pour une bonne marge
    (criticalStockItems === 0 ? 25 : criticalStockItems <= 2 ? 15 : criticalStockItems <= 5 ? 10 : 0) + // 25 points pour un bon stock
    (activeStaff.length > 0 ? 20 : 0) // 20 points si il y a du personnel
  ));

  // Calcul des tendances réelles basées sur les données historiques - CORRECTION
  const calculateTrend = (currentValue: number, dataPoints: any[], valueExtractor: (item: any) => number) => {
    if (dataPoints.length === 0) return '0%';
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];
    
    const todayData = dataPoints.filter(item => item.date === todayStr);
    const yesterdayData = dataPoints.filter(item => item.date === yesterdayStr);
    
    const todayValue = todayData.reduce((sum, item) => sum + valueExtractor(item), 0);
    const yesterdayValue = yesterdayData.reduce((sum, item) => sum + valueExtractor(item), 0);
    
    // Si pas de données hier et aujourd'hui, retourner 0%
    if (yesterdayValue === 0 && todayValue === 0) return '0%';
    // Si pas de données hier mais des données aujourd'hui, ne pas afficher de pourcentage énorme
    if (yesterdayValue === 0 && todayValue > 0) return 'Nouveau';
    // Si des données hier mais pas aujourd'hui
    if (yesterdayValue > 0 && todayValue === 0) return '-100%';
    
    const trend = ((todayValue - yesterdayValue) / yesterdayValue) * 100;
    return `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
  };

  const revenueTrend = calculateTrend(totalRevenue, sales, (sale) => Number(sale.total || 0));
  const profitTrend = calculateTrend(totalProfit, sales, (sale) => {
    const item = inventory.find(inv => inv.name === sale.item);
    if (!item) return 0;
    return Number(sale.total || 0) - (Number(item.purchasePrice || 0) * Number(sale.quantity || 0));
  });
  
  // Performance trend basé sur les données réelles, pas sur des suppositions
  let performanceTrend = '0%';
  if (sales.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const todaySalesCount = sales.filter(s => s.date === todayStr).length;
    const yesterdaySalesCount = sales.filter(s => s.date === yesterdayStr).length;
    
    if (yesterdaySalesCount === 0 && todaySalesCount > 0) {
      performanceTrend = 'Nouveau';
    } else if (yesterdaySalesCount > 0) {
      const trend = ((todaySalesCount - yesterdaySalesCount) / yesterdaySalesCount) * 100;
      performanceTrend = `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
    }
  }
  
  const kpiCards = [
    {
      title: 'Performance Globale',
      value: `${Math.round(performanceScore)}%`,
      subtitle: 'Score de performance',
      icon: BarChart3,
      color: performanceScore >= 80 ? 'text-green-600' : performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600',
      bgColor: performanceScore >= 80 ? 'bg-green-50 dark:bg-green-950/20' : performanceScore >= 60 ? 'bg-yellow-50 dark:bg-yellow-950/20' : 'bg-red-50 dark:bg-red-950/20',
      trend: performanceTrend
    },
    {
      title: 'Rentabilité Moyenne',
      value: `${averageMargin.toFixed(1)}%`,
      subtitle: 'Marge bénéficiaire',
      icon: TrendingUp,
      color: averageMargin > 15 ? 'text-green-600' : averageMargin > 5 ? 'text-yellow-600' : 'text-red-600',
      bgColor: averageMargin > 15 ? 'bg-green-50 dark:bg-green-950/20' : averageMargin > 5 ? 'bg-yellow-50 dark:bg-yellow-950/20' : 'bg-red-50 dark:bg-red-950/20',
      trend: profitTrend
    },
    {
      title: 'Santé du Stock',
      value: stockHealth,
      subtitle: `${criticalStockItems} alertes critiques`,
      icon: Package,
      color: criticalStockItems === 0 ? 'text-green-600' : criticalStockItems <= 2 ? 'text-yellow-600' : 'text-red-600',
      bgColor: criticalStockItems === 0 ? 'bg-green-50 dark:bg-green-950/20' : 
               criticalStockItems <= 2 ? 'bg-yellow-50 dark:bg-yellow-950/20' : 
               'bg-red-50 dark:bg-red-950/20',
      trend: criticalStockItems === 0 ? 'Stable' : `${criticalStockItems} items`
    },
    {
      title: 'Efficacité Équipe',
      value: `${activeStaff.length}/${staff.length}`,
      subtitle: 'Personnel actif',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      trend: staff.length > 0 ? `${Math.round((activeStaff.length / staff.length) * 100)}%` : '0%'
    }
  ];
  
  // Métriques détaillées avec des tendances réelles
  const detailedMetrics = [
    {
      label: 'CA Total',
      value: formatXOF(totalRevenue),
      change: revenueTrend,
      positive: revenueTrend.includes('+')
    },
    {
      label: 'Bénéfice Total',
      value: formatXOF(totalProfit),
      change: profitTrend,
      positive: profitTrend.includes('+')
    },
    {
      label: 'Articles Vendus',
      value: totalQuantitySold.toString(),
      change: calculateTrend(totalQuantitySold, sales, (sale) => Number(sale.quantity || 0)),
      positive: calculateTrend(totalQuantitySold, sales, (sale) => Number(sale.quantity || 0)).includes('+')
    },
    {
      label: 'Valeur Stock',
      value: formatXOF(totalStockValue),
      change: inventory.length > 0 ? 'Valorisation' : '0%',
      positive: false
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Filtre de date */}
      <EnhancedDateFilter 
        currentFilter={dateFilter}
        onFilterChange={handleDateFilterChange}
      />
      
      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className={`p-4 ${kpi.bgColor} border-0`}>
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              <Badge variant="secondary" className="text-xs">
                {kpi.trend}
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{kpi.title}</h3>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Métriques Détaillées */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-500" />
          Métriques Consolidées
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {detailedMetrics.map((metric, index) => (
            <div key={index} className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <div className={`flex items-center gap-1 text-xs ${
                  metric.change === 'Nouveau' || metric.change === 'Valorisation' ? 'text-blue-600' :
                  metric.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change !== '0%' && metric.change !== 'Valorisation' && metric.change !== 'Nouveau' && (
                    metric.positive ? 
                      <TrendingUp className="w-3 h-3" /> : 
                      <TrendingDown className="w-3 h-3" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="text-lg font-semibold">{metric.value}</div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Résumé des Alertes */}
      {criticalStockItems > 0 && (
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-800 dark:text-red-400">
              Attention Requise
            </h4>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {criticalStockItems} articles nécessitent un réapprovisionnement urgent
          </p>
        </Card>
      )}
    </div>
  );
};

export default ConsolidatedKPIs;
