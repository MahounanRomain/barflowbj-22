
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3, Clock, Star } from 'lucide-react';
import { useSalesData } from '@/hooks/useSalesData';

const QuickSalesAnalytics = () => {
  const { getSales } = useSalesData();
  const sales = getSales();

  // Calculs pour aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => sale.date === today);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  // Calculs pour hier
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdaySales = sales.filter(sale => sale.date === yesterdayStr);
  const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);

  // Calcul du pourcentage de croissance
  const growthPercentage = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
    : todayRevenue > 0 ? 100 : 0;

  // Calcul de l'heure de pointe basé sur TOUTES les ventes
  const calculatePeakHour = () => {
    const minSalesRequired = 10; // Minimum de ventes pour calculer une heure de pointe fiable
    
    // Regrouper TOUTES les ventes par heure
    const hourCounts = Array(24).fill(0);
    let totalSalesAnalyzed = 0;
    const uniqueDates = new Set<string>();
    
    sales.forEach(sale => {
      if (sale.createdAt) {
        const hour = new Date(sale.createdAt).getHours();
        hourCounts[hour]++;
        totalSalesAnalyzed++;
        if (sale.date) {
          uniqueDates.add(sale.date);
        }
      }
    });
    
    const daysWithSales = uniqueDates.size;
    
    // Ne calculer l'heure de pointe que si on a assez de données
    if (totalSalesAnalyzed < minSalesRequired || daysWithSales < 2) {
      return { hour: null, confidence: 'insufficient', daysAnalyzed: daysWithSales, totalSales: totalSalesAnalyzed };
    }
    
    // Trouver l'heure avec le plus de ventes
    const maxCount = Math.max(...hourCounts);
    const peakHourIndex = hourCounts.indexOf(maxCount);
    
    // Calculer le niveau de confiance basé sur le nombre total de ventes et de jours
    let confidence = 'low';
    if (daysWithSales >= 14 && totalSalesAnalyzed >= 100) {
      confidence = 'high';
    } else if (daysWithSales >= 7 && totalSalesAnalyzed >= 50) {
      confidence = 'medium';
    }
    
    return { 
      hour: peakHourIndex, 
      confidence, 
      daysAnalyzed: daysWithSales,
      totalSales: totalSalesAnalyzed 
    };
  };

  const peakHourData = calculatePeakHour();

  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-card to-primary/5 border shadow-lg">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        Analytics rapides
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 bg-background/30 rounded-lg">
          <span className="text-sm">Ventes aujourd'hui</span>
          <div className="text-right">
            <span className="font-semibold">{todaySales.length}</span>
            {Number(growthPercentage) !== 0 && (
              <p className={`text-xs ${Number(growthPercentage) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(growthPercentage) > 0 ? '+' : ''}{growthPercentage}% vs hier
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-background/30 rounded-lg">
          <span className="text-sm">CA moyen/vente</span>
          <span className="font-semibold">
            {sales.length > 0 ? formatXOF(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length) : formatXOF(0)}
          </span>
        </div>
        
        {peakHourData.hour !== null && (
          <div className="flex justify-between items-center p-2 bg-background/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm">Heure de pointe</span>
              {peakHourData.confidence !== 'insufficient' && (
                <div className={`w-2 h-2 rounded-full ${
                  peakHourData.confidence === 'high' ? 'bg-green-500' :
                  peakHourData.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`} title={`Confiance: ${peakHourData.confidence} (${peakHourData.daysAnalyzed} jours analysés)`} />
              )}
            </div>
            <div className="text-right">
              <span className="font-semibold">{peakHourData.hour}h00</span>
              <p className="text-xs text-muted-foreground">
                {peakHourData.daysAnalyzed}j analysés
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuickSalesAnalytics;
