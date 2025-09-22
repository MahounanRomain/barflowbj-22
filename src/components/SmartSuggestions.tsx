
import React from 'react';
import { Card } from '@/components/ui/card';
import { Lightbulb, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { useSalesData } from '@/hooks/useSalesData';

const SmartSuggestions = () => {
  const { getInventory } = useLocalData();
  const { getSales } = useSalesData();
  
  const inventory = getInventory();
  const sales = getSales();

  // Génération de suggestions intelligentes
  const suggestions = [];

  // Suggestion stock bas
  const lowStockItems = inventory.filter(item => item.quantity <= item.threshold);
  if (lowStockItems.length > 0) {
    suggestions.push({
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      title: 'Réapprovisionnement urgent',
      description: `${lowStockItems.length} articles en rupture de stock`,
      priority: 'high'
    });
  }

  // Suggestion sur les ventes populaires
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => sale.date === today);
  if (todaySales.length > 0) {
    const topSeller = todaySales.reduce((acc, sale) => {
      acc[sale.item] = (acc[sale.item] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    const mostSold = Object.entries(topSeller).sort(([,a], [,b]) => b - a)[0];
    if (mostSold) {
      suggestions.push({
        icon: TrendingUp,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        title: 'Produit vedette',
        description: `${mostSold[0]} se vend bien aujourd'hui`,
        priority: 'medium'
      });
    }
  }

  // Suggestion pour optimiser l'inventaire
  const overstockedItems = inventory.filter(item => item.quantity > item.threshold * 3);
  if (overstockedItems.length > 0) {
    suggestions.push({
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      title: 'Optimisation stock',
      description: `${overstockedItems.length} articles en surstock`,
      priority: 'low'
    });
  }

  // Suggestion par défaut si aucune donnée
  if (suggestions.length === 0) {
    suggestions.push({
      icon: Lightbulb,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      title: 'Astuce du jour',
      description: 'Ajoutez des ventes pour obtenir des suggestions personnalisées',
      priority: 'medium'
    });
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-card to-accent/5 border shadow-lg">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        Suggestions intelligentes
      </h3>
      
      <div className="space-y-3">
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <div 
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg ${suggestion.bgColor}`}
          >
            <suggestion.icon className={`w-4 h-4 mt-0.5 ${suggestion.color}`} />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{suggestion.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {suggestion.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SmartSuggestions;
