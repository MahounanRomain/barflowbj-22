import { useMemo, useEffect, useRef } from 'react';
import { useLocalData } from '@/hooks/useLocalData';
import { sendSystemMessage } from '@/hooks/useNotifications';

interface StockPrediction {
  itemId: string;
  itemName: string;
  category: string;
  currentStock: number;
  averageConsumption7d: number;
  averageConsumption30d: number;
  predictedDaysRemaining: number;
  suggestedRestockDate: string;
  suggestedRestockQuantity: number;
  riskLevel: 'low' | 'medium' | 'high';
  seasonalityFactor: number;
  velocityTrend: 'increasing' | 'decreasing' | 'stable';
  stockoutProbability: number;
  optimalStockLevel: number;
  costImpact: number;
}

export const useStockPredictions = () => {
  const { getSales, getInventory } = useLocalData();
  const notifiedPredictionsRef = useRef<Set<string>>(new Set());
  
  const predictions = useMemo((): StockPrediction[] => {
    const sales = getSales();
    const inventory = getInventory();
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculer les prédictions pour chaque article
    const predictions: StockPrediction[] = inventory.map(item => {
      const itemSales = sales.filter(sale => sale.item === item.name);
      
      // Ventes des 7 derniers jours
      const sales7d = itemSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= sevenDaysAgo;
      });
      
      // Ventes des 30 derniers jours
      const sales30d = itemSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= thirtyDaysAgo;
      });
      
      // Calculer la consommation moyenne
      const totalConsumption7d = sales7d.reduce((sum, sale) => sum + sale.quantity, 0);
      const totalConsumption30d = sales30d.reduce((sum, sale) => sum + sale.quantity, 0);
      
      const averageConsumption7d = totalConsumption7d / 7;
      const averageConsumption30d = totalConsumption30d / 30;
      
      // Analyser la tendance de vélocité
      const recentSales = itemSales.slice(-14); // 14 dernières ventes
      const firstHalfAvg = recentSales.slice(0, 7).reduce((sum, sale) => sum + sale.quantity, 0) / 7;
      const secondHalfAvg = recentSales.slice(7).reduce((sum, sale) => sum + sale.quantity, 0) / 7;
      
      let velocityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (secondHalfAvg > firstHalfAvg * 1.2) velocityTrend = 'increasing';
      else if (secondHalfAvg < firstHalfAvg * 0.8) velocityTrend = 'decreasing';
      
      // Calculer le facteur de saisonnalité (simplifié)
      const currentMonth = new Date().getMonth();
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthSales = itemSales.filter(sale => new Date(sale.date).getMonth() === i);
        return monthSales.reduce((sum, sale) => sum + sale.quantity, 0);
      });
      const avgMonthlyConsumption = monthlyData.reduce((sum, val) => sum + val, 0) / 12;
      const seasonalityFactor = avgMonthlyConsumption > 0 ? monthlyData[currentMonth] / avgMonthlyConsumption : 1;
      
      // Utiliser la moyenne ajustée par la saisonnalité et la tendance
      let adjustedConsumption = averageConsumption7d > 0 ? averageConsumption7d : averageConsumption30d;
      adjustedConsumption *= seasonalityFactor;
      
      if (velocityTrend === 'increasing') adjustedConsumption *= 1.2;
      else if (velocityTrend === 'decreasing') adjustedConsumption *= 0.8;
      
      // Prédire les jours restants
      const predictedDaysRemaining = adjustedConsumption > 0 ? Math.floor(item.quantity / adjustedConsumption) : 999;
      
      // Probabilité de rupture de stock
      const stockoutProbability = Math.min(100, Math.max(0, 100 - (predictedDaysRemaining * 10)));
      
      // Niveau de stock optimal (buffer de sécurité)
      const safetyBuffer = Math.ceil(adjustedConsumption * 7); // 7 jours de buffer
      const optimalStockLevel = Math.ceil(adjustedConsumption * 30) + safetyBuffer;
      
      // Impact coût si rupture
      const avgSellingPrice = item.salePrice || 0;
      const dailyRevenueLoss = adjustedConsumption * avgSellingPrice;
      const costImpact = dailyRevenueLoss * Math.max(0, 7 - predictedDaysRemaining);
      
      // Date de restockage suggérée (avec buffer de sécurité)
      const restockDate = new Date();
      const bufferDays = velocityTrend === 'increasing' ? 10 : 5;
      restockDate.setDate(restockDate.getDate() + Math.max(0, predictedDaysRemaining - bufferDays));
      
      // Quantité de restockage optimisée
      const suggestedRestockQuantity = Math.max(
        optimalStockLevel - item.quantity,
        item.threshold || 10
      );
      
      // Niveau de risque affiné
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (predictedDaysRemaining <= 3 || stockoutProbability > 80) riskLevel = 'high';
      else if (predictedDaysRemaining <= 7 || stockoutProbability > 50) riskLevel = 'medium';
      
      return {
        itemId: item.id,
        itemName: item.name,
        category: item.category || 'Non catégorisé',
        currentStock: item.quantity,
        averageConsumption7d,
        averageConsumption30d,
        predictedDaysRemaining,
        suggestedRestockDate: restockDate.toDateString(),
        suggestedRestockQuantity,
        riskLevel,
        seasonalityFactor,
        velocityTrend,
        stockoutProbability,
        optimalStockLevel,
        costImpact
      };
    });

    // Trier par niveau de risque puis par jours restants
    return predictions.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      }
      return a.predictedDaysRemaining - b.predictedDaysRemaining;
    });
  }, [getSales, getInventory]);
  
  // Envoyer des notifications pour les prédictions à haut risque
  useEffect(() => {
    predictions.forEach(prediction => {
      const notifKey = `${prediction.itemId}_${prediction.riskLevel}`;
      
      if (prediction.riskLevel === 'high' && !notifiedPredictionsRef.current.has(notifKey)) {
        notifiedPredictionsRef.current.add(notifKey);
        
        sendSystemMessage(
          'warning',
          'Alerte stock critique',
          `${prediction.itemName}: Stock critique - ${prediction.predictedDaysRemaining} jour(s) restant(s). Réapprovisionner ${prediction.suggestedRestockQuantity} unités.`,
          'high'
        );
      } else if (prediction.riskLevel === 'medium' && !notifiedPredictionsRef.current.has(notifKey)) {
        notifiedPredictionsRef.current.add(notifKey);
        
        sendSystemMessage(
          'info',
          'Prévision de stock',
          `${prediction.itemName}: Stock faible prévu dans ${prediction.predictedDaysRemaining} jours. Quantité suggérée: ${prediction.suggestedRestockQuantity} unités.`,
          'medium'
        );
      }
      
      // Nettoyer les anciennes notifications si le niveau de risque a changé
      if (prediction.riskLevel === 'low') {
        ['high', 'medium'].forEach(level => {
          notifiedPredictionsRef.current.delete(`${prediction.itemId}_${level}`);
        });
      }
    });
  }, [predictions]);
  
  return { predictions };
};
