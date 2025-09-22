
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePeriodComparison } from '@/hooks/usePeriodComparison';
import { DateFilter } from './EnhancedDateFilter';

interface PeriodComparisonProps {
  dateFilter?: DateFilter;
}

const PeriodComparison: React.FC<PeriodComparisonProps> = ({ dateFilter }) => {
  const [currentPeriod, setCurrentPeriod] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7); // 7 derniers jours par défaut
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  });

  // Synchroniser avec le filtre de date global
  useEffect(() => {
    if (dateFilter) {
      if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
        setCurrentPeriod({
          start: dateFilter.startDate,
          end: dateFilter.endDate
        });
      } else if (dateFilter.preset) {
        // Handle monthly filter
        if (dateFilter.preset === 'monthly' && dateFilter.month) {
          const year = parseInt(dateFilter.month.split('-')[0]);
          const month = parseInt(dateFilter.month.split('-')[1]) - 1;
          const start = new Date(year, month, 1);
          const end = new Date(year, month + 1, 0);
          setCurrentPeriod({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
          });
        }
        // Handle yearly filter
        else if (dateFilter.preset === 'yearly' && dateFilter.year) {
          const year = parseInt(dateFilter.year);
          setCurrentPeriod({
            start: `${year}-01-01`,
            end: `${year}-12-31`
          });
        }
        // Handle day-based presets
        else {
          let days = 30; // default
          switch (dateFilter.preset) {
            case '7d': days = 7; break;
            case '14d': days = 14; break;
            case '21d': days = 21; break;
            case '30d': days = 30; break;
            case '90d': days = 90; break;
          }
          setPeriod(days);
        }
      }
    }
  }, [dateFilter]);
  
  const comparison = usePeriodComparison(currentPeriod);
  
  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const absValue = Math.abs(value);
    return `${value >= 0 ? '+' : ''}${absValue.toFixed(1)}%`;
  };

  const getGrowthDescription = (growth: number) => {
    if (Math.abs(growth) < 1) return 'stable';
    if (growth >= 25) return 'forte hausse';
    if (growth >= 10) return 'hausse';
    if (growth >= 1) return 'légère hausse';
    if (growth <= -25) return 'forte baisse';
    if (growth <= -10) return 'baisse';
    return 'légère baisse';
  };
  
  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };
  
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  const setPeriod = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setCurrentPeriod({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Comparaison Périodique
        </h3>
        <div className="flex flex-wrap gap-1">
          <Button variant="outline" size="sm" onClick={() => setPeriod(7)}>
            7d
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPeriod(14)}>
            14d
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPeriod(21)}>
            21d
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            setCurrentPeriod({
              start: start.toISOString().split('T')[0],
              end: now.toISOString().split('T')[0]
            });
          }}>
            Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 1);
            setCurrentPeriod({
              start: start.toISOString().split('T')[0],
              end: now.toISOString().split('T')[0]
            });
          }}>
            Year
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setCurrentPeriod({
              start: '2020-01-01',
              end: new Date().toISOString().split('T')[0]
            });
          }}>
            All
          </Button>
        </div>
      </div>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Chiffre d'Affaires</span>
            {getGrowthIcon(comparison.growth.revenue)}
          </div>
          <div className="text-2xl font-bold">{formatXOF(comparison.current.totalRevenue)}</div>
          <div className={`text-sm ${getGrowthColor(comparison.growth.revenue)} flex items-center gap-1`}>
            <span>{formatPercentage(comparison.growth.revenue)}</span>
            <span className="text-xs opacity-75">({getGrowthDescription(comparison.growth.revenue)})</span>
          </div>
          {comparison.previous.totalRevenue > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              vs {formatXOF(comparison.previous.totalRevenue)} période précédente
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Nombre de Ventes</span>
            {getGrowthIcon(comparison.growth.sales)}
          </div>
          <div className="text-2xl font-bold">{comparison.current.totalSales}</div>
          <div className={`text-sm ${getGrowthColor(comparison.growth.sales)} flex items-center gap-1`}>
            <span>{formatPercentage(comparison.growth.sales)}</span>
            <span className="text-xs opacity-75">({getGrowthDescription(comparison.growth.sales)})</span>
          </div>
          {comparison.previous.totalSales > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {comparison.previous.totalSales} ventes période précédente
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Panier Moyen</span>
            {getGrowthIcon(comparison.growth.averageOrderValue)}
          </div>
          <div className="text-2xl font-bold">{formatXOF(comparison.current.averageOrderValue)}</div>
          <div className={`text-sm ${getGrowthColor(comparison.growth.averageOrderValue)} flex items-center gap-1`}>
            <span>{formatPercentage(comparison.growth.averageOrderValue)}</span>
            <span className="text-xs opacity-75">({getGrowthDescription(comparison.growth.averageOrderValue)})</span>
          </div>
          {comparison.previous.averageOrderValue > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              vs {formatXOF(comparison.previous.averageOrderValue)} période précédente
            </div>
          )}
        </div>
      </div>
      
      {/* Top des ventes */}
      <div className="space-y-4">
        <h4 className="font-medium">Top des Ventes - Période Actuelle</h4>
        <div className="space-y-2">
          {comparison.current.topSellingItems.slice(0, 5).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.quantity} vendus</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatXOF(item.revenue)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PeriodComparison;
