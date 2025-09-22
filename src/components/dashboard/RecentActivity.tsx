
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const RecentActivity = () => {
  const stats = useDashboardStats();

  // Fonction pour déterminer l'état du stock
  const getStockStatus = () => {
    if (stats.totalInventoryItems === 0) {
      return {
        status: "Vide",
        color: "text-gray-500",
        bgColor: "bg-gray-500",
        description: "Aucun article en stock"
      };
    }
    
    if (stats.lowStockItems > 0) {
      return {
        status: `${stats.lowStockItems} alertes`,
        color: "text-red-600",
        bgColor: "bg-red-500",
        description: "Articles en rupture"
      };
    }
    
    return {
      status: "Optimal",
      color: "text-green-600",
      bgColor: "bg-green-500",
      description: "Stock suffisant"
    };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border shadow-lg">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Activité récente
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-background/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Ventes aujourd'hui</span>
          </div>
          <span className="font-semibold">{stats.todaySalesCount}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-background/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Articles en stock</span>
          </div>
          <span className="font-semibold">{stats.totalInventoryItems}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-background/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${stockStatus.bgColor} ${stats.totalInventoryItems === 0 ? '' : (stats.lowStockItems > 0 ? 'animate-pulse' : '')}`}></div>
            <span className="text-sm">État du stock</span>
          </div>
          <span className={`font-semibold ${stockStatus.color}`}>
            {stockStatus.status}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default RecentActivity;
