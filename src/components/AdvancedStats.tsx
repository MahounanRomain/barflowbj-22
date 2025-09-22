import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useLocalData } from '@/hooks/useLocalData';
import { TrendingUp, TrendingDown, Users, Package, DollarSign } from 'lucide-react';
import TrendIndicator from '@/components/ui/trend-indicator';

const AdvancedStats = () => {
  const { getInventory, getSales, getStaff } = useLocalData();

  const stats = useMemo(() => {
    const inventory = getInventory();
    const sales = getSales();
    const staff = getStaff();

    // Statistiques de base
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(item => item.quantity <= item.threshold).length;
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const activeStaff = staff.filter(member => member.isActive).length;

    // Ventes par jour (7 derniers jours)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const salesByDay = last7Days.map(date => {
      const daySales = sales.filter(sale => sale.date.startsWith(date));
      return {
        date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
        sales: daySales.reduce((sum, sale) => sum + sale.total, 0),
        count: daySales.length
      };
    });

    // Top 5 des produits vendus
    const productSales = sales.reduce((acc, sale) => {
      acc[sale.item] = (acc[sale.item] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([product, quantity]) => ({ product, quantity }));

    // Répartition du stock par catégorie
    const stockByCategory = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(stockByCategory).map(([category, quantity]) => ({
      category,
      quantity
    }));

    // Performance par vendeur
    const sellerPerformance = sales.reduce((acc, sale) => {
      if (!acc[sale.sellerName]) {
        acc[sale.sellerName] = { sales: 0, revenue: 0 };
      }
      acc[sale.sellerName].sales += sale.quantity;
      acc[sale.sellerName].revenue += sale.total;
      return acc;
    }, {} as Record<string, { sales: number; revenue: number }>);

    const topSellers = Object.entries(sellerPerformance)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 3)
      .map(([seller, data]) => ({ seller, ...data }));

    return {
      totalItems,
      lowStockItems,
      totalSales,
      activeStaff,
      salesByDay,
      topProducts,
      categoryData,
      topSellers
    };
  }, [getInventory, getSales, getStaff]);

  const chartConfig = {
    sales: { label: "Ventes", color: "#8b5cf6" },
    quantity: { label: "Quantité", color: "#10b981" },
  };

  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  // Formatage en XOF (Franc CFA de l'Afrique de l'ouest)
  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Articles</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stock bas</p>
              <p className="text-2xl font-bold text-orange-500">{stats.lowStockItems}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">CA Total</p>
              <p className="text-2xl font-bold">{formatXOF(stats.totalSales)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Personnel</p>
              <p className="text-2xl font-bold">{stats.activeStaff}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ventes par jour */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Ventes (7 derniers jours)</h3>
            <TrendIndicator 
              data={stats.salesByDay.map(d => d.sales)} 
              label="CA" 
              className="text-xs"
            />
          </div>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={stats.salesByDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="var(--color-sales)" 
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </Card>

        {/* Stock par catégorie */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Stock par catégorie</h3>
            <TrendIndicator 
              data={stats.categoryData.map(d => d.quantity)} 
              label="Stock" 
              className="text-xs"
            />
          </div>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <PieChart>
              <Pie
                data={stats.categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="quantity"
                label={({ category }) => category}
              >
                {stats.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Top produits et vendeurs */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Top produits vendus</h3>
          <div className="space-y-2">
            {stats.topProducts.map((product, index) => (
              <div key={product.product} className="flex justify-between items-center">
                <span className="text-sm">{product.product}</span>
                <Badge variant="secondary">{product.quantity}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Top vendeurs</h3>
          <div className="space-y-2">
            {stats.topSellers.map((seller, index) => (
              <div key={seller.seller} className="flex justify-between items-center">
                <span className="text-sm">{seller.seller}</span>
                <div className="text-right">
                  <Badge variant="secondary">{formatXOF(seller.revenue)}</Badge>
                  <p className="text-xs text-muted-foreground">{seller.sales} ventes</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedStats;
