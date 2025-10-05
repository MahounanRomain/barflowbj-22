import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TrendIndicator from '@/components/ui/trend-indicator';
import EnhancedDateFilter, { DateFilter } from './EnhancedDateFilter';
import TradingChart from './TradingChart';
import { filterSalesByDateRange } from '@/lib/dateFiltering';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface AdvancedAnalyticsProps {
  initialFilter?: DateFilter;
  onFilterChange?: (filter: DateFilter) => void;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ 
  initialFilter, 
  onFilterChange 
}) => {
  const { getSales, getInventory, getStaff } = useLocalData();
  const [dateFilter, setDateFilter] = useState<DateFilter>(
    initialFilter || {
      type: 'preset',
      preset: '7d',
      label: '7 derniers jours'
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
  
  const allSales = getSales();
  const inventory = getInventory();
  const staff = getStaff();

  // Utiliser la fonction centralisée de filtrage pour garantir la cohérence
  const sales = useMemo(() => {
    return filterSalesByDateRange(allSales, dateFilter);
  }, [allSales, dateFilter]);

  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculs des métriques principales
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const totalSales = sales.length;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const activeStaffCount = staff.filter(s => s.isActive).length;
  
  // Get days array based on current filter
  const selectedDays = useMemo(() => {
    if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      const days = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(d.toISOString().split('T')[0]);
      }
      return days;
    }
    
    // Handle monthly filter
    if (dateFilter.preset === 'monthly' && dateFilter.month) {
      const year = parseInt(dateFilter.month.split('-')[0]);
      const month = parseInt(dateFilter.month.split('-')[1]) - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, month, i + 1);
        return date.toISOString().split('T')[0];
      });
    }
    
    // Handle yearly filter
    if (dateFilter.preset === 'yearly' && dateFilter.year) {
      const year = parseInt(dateFilter.year);
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      const daysInYear = isLeapYear ? 366 : 365;
      return Array.from({ length: daysInYear }, (_, i) => {
        const date = new Date(year, 0, i + 1);
        return date.toISOString().split('T')[0];
      });
    }
    
    // Handle day-based presets
    let days = 30; // default
    switch (dateFilter.preset) {
      case '7d': days = 7; break;
      case '14d': days = 14; break;
      case '21d': days = 21; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 30;
    }
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });
  }, [dateFilter]);
  
  const dailyData = selectedDays.map(date => {
    const daySales = sales.filter(sale => sale.date === date);
    const revenue = daySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const count = daySales.length;
    
    return {
      date: new Date(date).toLocaleDateString('fr-FR', { 
        day: '2-digit',
        month: '2-digit'
      }),
      fullDate: date,
      revenue,
      sales: count,
      avgOrder: count > 0 ? revenue / count : 0
    };
  });

  // Calculate average trend lines
  const averageRevenue = dailyData.length > 0 
    ? dailyData.reduce((sum, day) => sum + day.revenue, 0) / dailyData.length 
    : 0;
  const averageSales = dailyData.length > 0 
    ? dailyData.reduce((sum, day) => sum + day.sales, 0) / dailyData.length 
    : 0;

  // Données par catégorie
  const categoryData: Record<string, { revenue: number; quantity: number }> = {};
  sales.forEach(sale => {
    const item = inventory.find(inv => inv.name === sale.item);
    const category = item?.category || 'Non catégorisé';
    
    if (!categoryData[category]) {
      categoryData[category] = { revenue: 0, quantity: 0 };
    }
    
    categoryData[category].revenue += Number(sale.total || 0);
    categoryData[category].quantity += Number(sale.quantity || 0);
  });

  const categoryChartData = Object.entries(categoryData).map(([name, data]) => ({
    name,
    value: data.revenue,
    quantity: data.quantity
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  // Top performers
  const topProducts = Object.entries(
    sales.reduce((acc: Record<string, { revenue: number; quantity: number }>, sale) => {
      const item = sale.item;
      if (!acc[item]) acc[item] = { revenue: 0, quantity: 0 };
      acc[item].revenue += Number(sale.total || 0);
      acc[item].quantity += Number(sale.quantity || 0);
      return acc;
    }, {})
  )
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Analytics Avancées
        </h2>
        <EnhancedDateFilter 
          currentFilter={dateFilter}
          onFilterChange={handleDateFilterChange}
        />
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">CA Total</span>
          </div>
          <div className="text-2xl font-bold">{formatXOF(totalRevenue)}</div>
          <div className="text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Période actuelle
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Ventes</span>
          </div>
          <div className="text-2xl font-bold">{totalSales}</div>
          <div className="text-xs text-muted-foreground">
            Transactions totales
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-muted-foreground">Panier Moyen</span>
          </div>
          <div className="text-2xl font-bold">{formatXOF(averageOrderValue)}</div>
          <div className="text-xs text-muted-foreground">
            Par transaction
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">Personnel</span>
          </div>
          <div className="text-2xl font-bold">{activeStaffCount}</div>
          <div className="text-xs text-muted-foreground">
            Membres actifs
          </div>
        </Card>
      </div>

      {/* Graphiques détaillés */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <TradingChart 
            data={dailyData} 
            formatXOF={formatXOF}
            currentFilter={dateFilter}
            onFilterChange={handleDateFilterChange}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-500" />
                Répartition par Catégorie
              </h3>
              <TrendIndicator 
                data={categoryChartData.map(d => d.value)} 
                label="Ventes" 
              />
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="h-64 lg:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatXOF(value as number), 'Chiffre d\'affaires']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:w-1/2 space-y-2">
                {categoryChartData.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-2 bg-background/50 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatXOF(category.value)}</div>
                      <div className="text-xs text-muted-foreground">{category.quantity} vendus</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Top Produits
              </h3>
              <TrendIndicator 
                data={topProducts.map(p => p.revenue)} 
                label="Performance" 
              />
            </div>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune donnée de vente disponible</p>
                </div>
              ) : (
                topProducts.map((product, index) => {
                  const maxRevenue = topProducts[0]?.revenue || 1;
                  const percentage = (product.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={product.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatXOF(product.revenue)}</div>
                          <div className="text-xs text-muted-foreground">{product.quantity} vendus</div>
                        </div>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-blue-500' : 
                            index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
