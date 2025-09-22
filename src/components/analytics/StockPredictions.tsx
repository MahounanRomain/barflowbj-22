
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingDown, AlertTriangle, Package } from 'lucide-react';
import { useStockPredictions } from '@/hooks/useStockPredictions';

const StockPredictions = () => {
  const { predictions } = useStockPredictions();
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400';
    }
  };
  
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingDown className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };
  
  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-500" />
        Prédictions de Stock
      </h3>
      
      <div className="space-y-4">
        {predictions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune donnée de vente pour les prédictions</p>
          </div>
        ) : (
          <>
            {/* Résumé des alertes */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {predictions.filter(p => p.riskLevel === 'high').length}
                </div>
                <div className="text-sm text-red-600">Critique</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {predictions.filter(p => p.riskLevel === 'medium').length}
                </div>
                <div className="text-sm text-yellow-600">Attention</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {predictions.filter(p => p.riskLevel === 'low').length}
                </div>
                <div className="text-sm text-green-600">OK</div>
              </div>
            </div>
            
            {/* Liste des prédictions */}
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <div key={prediction.itemId} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{prediction.itemName}</h4>
                      <Badge className={getRiskColor(prediction.riskLevel)}>
                        {getRiskIcon(prediction.riskLevel)}
                        <span className="ml-1 capitalize">{prediction.riskLevel}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Stock actuel: {prediction.currentStock} • 
                      Consommation moy.: {prediction.averageConsumption7d.toFixed(1)}/jour
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {prediction.predictedDaysRemaining > 999 
                        ? '∞ jours' 
                        : `${prediction.predictedDaysRemaining} jours`
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recommandé: {prediction.suggestedRestockQuantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default StockPredictions;
