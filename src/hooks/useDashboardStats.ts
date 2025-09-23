import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useLocalData } from '@/hooks/useLocalData';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { getTodayDateString } from '@/lib/dateUtils';

export const useDashboardStats = () => {
  const { getSales, getInventory, getStaff } = useLocalData();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdateDate, setLastUpdateDate] = useState(getTodayDateString());
  
  const refreshStats = useCallback(() => {
    const currentDate = getTodayDateString();
    if (currentDate !== lastUpdateDate) {
      console.log('📅 Date changed, forcing dashboard refresh');
      setLastUpdateDate(currentDate);
    }
    setRefreshKey(prev => prev + 1);
  }, [lastUpdateDate]);
  
  // Check for date changes every minute and at midnight
  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = getTodayDateString();
      if (currentDate !== lastUpdateDate) {
        console.log('🔄 Dashboard: Date changed from', lastUpdateDate, 'to', currentDate);
        refreshStats();
      }
    };
    
    // Schedule midnight check
    const scheduleMidnightCheck = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 1, 0); // 00:00:01 AM - 1 second after midnight
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      return setTimeout(() => {
        console.log('🕛 Dashboard: Midnight refresh triggered');
        checkDateChange();
        // Reschedule for next day
        scheduleMidnightCheck();
      }, msUntilMidnight);
    };
    
    // Initial midnight schedule
    const midnightTimeout = scheduleMidnightCheck();
    
    // Regular interval check (every 5 minutes)
    const interval = setInterval(checkDateChange, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(interval);
    };
  }, [lastUpdateDate, refreshStats]);

  // Listen for real-time data changes
  useRealTimeData({
    dataTypes: ['sales', 'inventory', 'staff', 'cashTransactions', 'cashBalance'],
    refreshCallback: refreshStats
  });
  
  const stats = useMemo(() => {
    const sales = getSales();
    const inventory = getInventory();
    const staff = getStaff();

    // Calcul des statistiques avec date optimisée
    const today = getTodayDateString();
    const todaySales = sales.filter(sale => sale.date === today);
    const totalRevenue = todaySales.reduce((sum, sale) => {
      const amount = Number(sale.total || 0);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);
    
    // Calcul optimisé de la valeur de vente potentielle du stock
    const totalStockValue = inventory.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const salePrice = Number(item.salePrice || 0);
      if (Number.isFinite(quantity) && Number.isFinite(salePrice)) {
        return sum + (quantity * salePrice);
      }
      return sum;
    }, 0);

    const lowStockItems = inventory.filter(item => {
      const quantity = Number(item.quantity || 0);
      const threshold = Number(item.threshold || 0);
      return Number.isFinite(quantity) && Number.isFinite(threshold) && quantity <= threshold;
    }).length;

    const activeStaff = staff.filter(member => member.isActive).length;

    // Peak hour analysis - analyser TOUTES les ventes depuis le début
    const salesData = getSales();
    const peakHourAnalysis = () => {
      // Analyser TOUTES les ventes, pas seulement les 7 derniers jours
      const allSales = salesData;
      
      if (allSales.length === 0) return { hour: '22h00', analysis: 0 };
      
      // Analyser les ventes par heure
      const hourlyData: { [key: string]: { count: number, revenue: number } } = {};
      
      allSales.forEach(sale => {
        // Utiliser createdAt si disponible, sinon estimer l'heure basée sur la date
        let saleDate: Date;
        if (sale.createdAt) {
          saleDate = new Date(sale.createdAt);
        } else {
          // Si pas de createdAt, utiliser une heure par défaut (12h00)
          saleDate = new Date(sale.date + 'T12:00:00');
        }
        
        const hour = saleDate.getHours();
        const hourKey = `${hour.toString().padStart(2, '0')}h00`;
        
        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = { count: 0, revenue: 0 };
        }
        
        hourlyData[hourKey].count += 1;
        const revenue = Number(sale.total || 0);
        if (Number.isFinite(revenue)) {
          hourlyData[hourKey].revenue += revenue;
        }
      });
      
      // Trouver l'heure avec le plus d'activité (score combiné volume + revenus)
      let peakHour = '22h00';
      let maxScore = 0;
      
      Object.entries(hourlyData).forEach(([hour, data]) => {
        // Score combiné : 30% volume, 70% revenus normalisés
        const normalizedRevenue = data.revenue / 1000;
        const score = (data.count * 0.3) + (normalizedRevenue * 0.7);
        if (score > maxScore) {
          maxScore = score;
          peakHour = hour;
        }
      });
      
      return { 
        hour: peakHour, 
        analysis: Object.keys(hourlyData).length
      };
    };

    const peakHour = peakHourAnalysis();

    return {
      totalRevenue,
      totalStockValue,
      lowStockItems,
      activeStaff,
      todaySalesCount: todaySales.length,
      totalInventoryItems: inventory.length,
      peakHour: peakHour.hour,
      peakHourAnalysis: peakHour.analysis,
      // CA moyen par vente basé sur TOUTES les ventes de la journée
      averageOrderValue: todaySales.length > 0 ? Number((totalRevenue / todaySales.length).toFixed(2)) : 0,
      refreshKey,
      lastUpdateDate
    };
  }, [getSales, getInventory, getStaff, refreshKey, lastUpdateDate]);

  return stats;
};