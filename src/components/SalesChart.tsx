import { FC } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import TrendIndicator from "@/components/ui/trend-indicator";

interface SalesChartProps {
  sales: any[];
}

const SalesChart: FC<SalesChartProps> = ({ sales }) => {
  // Données pour le graphique en barres (7 derniers jours)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyData = last7Days.map(date => {
    const daySales = sales.filter(sale => sale.date === date);
    const revenue = daySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const count = daySales.length;
    
    return {
      date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      revenue,
      count
    };
  });

  // Calculate average trend line for revenue
  const averageRevenue = dailyData.length > 0 
    ? dailyData.reduce((sum, day) => sum + day.revenue, 0) / dailyData.length 
    : 0;

  // Données pour le graphique en secteurs (articles les plus vendus)
  const itemSales: Record<string, number> = {};
  sales.forEach(sale => {
    if (!itemSales[sale.item]) {
      itemSales[sale.item] = 0;
    }
    itemSales[sale.item] += Number(sale.quantity || 0);
  });

  const pieData = Object.entries(itemSales)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  // Formatage en XOF (Franc CFA de l'Afrique de l'ouest)
  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Custom label renderer for better mobile display
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      {/* Graphique en barres - Revenus des 7 derniers jours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-500" />
            Revenus des 7 derniers jours
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Évolution quotidienne des ventes</span>
            <TrendIndicator 
              data={dailyData.map(d => d.revenue)} 
              label="Tendance" 
              className="text-xs"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [formatXOF(Number(value)), 'Revenus']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <ReferenceLine 
                y={averageRevenue} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                strokeWidth={2}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique en secteurs - Articles les plus vendus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={18} className="text-green-500" />
            Top 5 Articles Vendus
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Répartition par quantité vendue</span>
            <TrendIndicator 
              data={pieData.map(d => d.value)} 
              label="Popularité" 
              className="text-xs"
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {pieData.length > 0 ? (
            <div className="space-y-4">
              {/* Graphique centré avec responsive container */}
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={280} className="max-w-sm">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value} vendus`, 'Quantité']}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Légende personnalisée sous le graphique */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate">{entry.name}</span>
                    <span className="ml-auto font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune donnée de vente disponible
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesChart;
