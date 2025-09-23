
import { useMemo } from 'react';
import { useLocalData } from '@/hooks/useLocalData';

interface PeriodStats {
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  topSellingItems: Array<{ name: string; quantity: number; revenue: number }>;
  categoryBreakdown: Record<string, number>;
}

interface PeriodComparison {
  current: PeriodStats;
  previous: PeriodStats;
  growth: {
    revenue: number;
    sales: number;
    averageOrderValue: number;
  };
}

export const usePeriodComparison = (currentPeriod: { start: string; end: string }) => {
  const { getSales, getInventory } = useLocalData();
  
  const comparison = useMemo((): PeriodComparison => {
    const sales = getSales();
    const inventory = getInventory();
    
    // Calculer la période précédente (même durée)
    const currentStart = new Date(currentPeriod.start);
    const currentEnd = new Date(currentPeriod.end);
    const periodDuration = currentEnd.getTime() - currentStart.getTime();
    
    const previousStart = new Date(currentStart.getTime() - periodDuration);
    const previousEnd = new Date(currentStart.getTime() - 1);
    
    const calculatePeriodStats = (startDate: Date, endDate: Date): PeriodStats => {
      const periodSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
      });
      
      const totalRevenue = periodSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalSales = periodSales.length;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      
      // Top des ventes
      const itemStats: Record<string, { quantity: number; revenue: number }> = {};
      periodSales.forEach(sale => {
        if (!itemStats[sale.item]) {
          itemStats[sale.item] = { quantity: 0, revenue: 0 };
        }
        itemStats[sale.item].quantity += sale.quantity;
        itemStats[sale.item].revenue += sale.total;
      });
      
      const topSellingItems = Object.entries(itemStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Répartition par catégorie
      const categoryBreakdown: Record<string, number> = {};
      periodSales.forEach(sale => {
        const item = inventory.find(inv => inv.name === sale.item);
        const category = item?.category || 'Non catégorisé';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + sale.total;
      });
      
      return {
        totalRevenue,
        totalSales,
        averageOrderValue,
        topSellingItems,
        categoryBreakdown
      };
    };
    
    const current = calculatePeriodStats(currentStart, currentEnd);
    const previous = calculatePeriodStats(previousStart, previousEnd);
    
    const growth = {
      revenue: previous.totalRevenue > 0 
        ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
        : 0,
      sales: previous.totalSales > 0 
        ? ((current.totalSales - previous.totalSales) / previous.totalSales) * 100 
        : 0,
      averageOrderValue: previous.averageOrderValue > 0 
        ? ((current.averageOrderValue - previous.averageOrderValue) / previous.averageOrderValue) * 100 
        : 0
    };
    
    return { current, previous, growth };
  }, [getSales, getInventory, currentPeriod]);
  
  return comparison;
};
