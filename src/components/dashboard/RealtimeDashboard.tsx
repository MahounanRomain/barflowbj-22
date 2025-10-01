import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useOptimizedSales } from '@/hooks/useOptimizedSales';
import { useOptimizedInventory } from '@/hooks/useOptimizedInventory';
import { useAIPredictions } from '@/hooks/useAIPredictions';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const RealtimeDashboard = () => {
  const { sales, todayRevenue, todaySales, isLoading: salesLoading } = useOptimizedSales();
  const { inventory, lowStockItems, isLoading: inventoryLoading } = useOptimizedInventory();
  const { 
    predictions, 
    suggestions, 
    anomalies, 
    getSalesPredictions, 
    getInventorySuggestions,
    detectAnomalies,
    isLoading: aiLoading 
  } = useAIPredictions();

  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  // Données en temps réel (dernières 24h par heure)
  useEffect(() => {
    const now = new Date();
    const last24Hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getHours() === hour.getHours() &&
               saleDate.toDateString() === hour.toDateString();
      });
      
      const revenue = hourSales.reduce((sum, sale) => sum + sale.total, 0);
      
      return {
        hour: hour.getHours() + 'h',
        revenue,
        orders: hourSales.length,
      };
    });

    setRealtimeData(last24Hours);
  }, [sales]);

  const handleRefreshPredictions = async () => {
    await Promise.all([
      getSalesPredictions(sales),
      getInventorySuggestions(inventory, sales),
      detectAnomalies(inventory, sales),
    ]);
  };

  const highAnomalies = anomalies.filter(a => a.severity === 'high');
  const criticalStock = lowStockItems.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header avec refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Dashboard Intelligent
          </h1>
          <p className="text-muted-foreground mt-1">Prédictions IA et KPIs en temps réel</p>
        </div>
        <Button 
          onClick={handleRefreshPredictions} 
          disabled={aiLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
          Actualiser les prédictions
        </Button>
      </div>

      {/* KPIs en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ventes aujourd'hui</p>
              <p className="text-3xl font-bold">{todaySales.length}</p>
              <p className="text-sm text-green-600 mt-1">
                {todayRevenue.toFixed(2)} XAF
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stock bas</p>
              <p className="text-3xl font-bold text-orange-600">{criticalStock}</p>
              <p className="text-sm text-muted-foreground mt-1">Articles à commander</p>
            </div>
            <Package className="w-12 h-12 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Anomalies</p>
              <p className="text-3xl font-bold text-red-600">{highAnomalies.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Critiques détectées</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Prédictions</p>
              <p className="text-3xl font-bold text-primary">{predictions.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Prochains jours</p>
            </div>
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
        </Card>
      </div>

      {/* Graphique temps réel */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Ventes en temps réel (24h)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={realtimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Prédictions de ventes */}
      {predictions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Prédictions de ventes (7 jours)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="expectedRevenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Suggestions de commande */}
      {suggestions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Suggestions de commande IA
          </h2>
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{suggestion.item}</p>
                  <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                </div>
                <Badge variant="outline" className="text-lg">
                  Commander {suggestion.suggestedOrder} unités
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Anomalies détectées */}
      {anomalies.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Anomalies détectées
          </h2>
          <div className="space-y-3">
            {anomalies.map((anomaly, idx) => (
              <Alert 
                key={idx} 
                variant={anomaly.severity === 'high' ? 'destructive' : 'default'}
              >
                <AlertTitle className="flex items-center gap-2">
                  {anomaly.item}
                  <Badge variant={
                    anomaly.severity === 'high' ? 'destructive' : 
                    anomaly.severity === 'medium' ? 'default' : 
                    'secondary'
                  }>
                    {anomaly.type}
                  </Badge>
                </AlertTitle>
                <AlertDescription>{anomaly.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
