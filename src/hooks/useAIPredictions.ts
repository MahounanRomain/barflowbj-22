import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SaleRecord, InventoryItem } from '@/lib/storage';

export interface SalesPrediction {
  date: string;
  expectedRevenue: number;
  confidence: number;
}

export interface InventorySuggestion {
  item: string;
  suggestedOrder: number;
  reason: string;
}

export interface Anomaly {
  type: string;
  item: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export const useAIPredictions = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [suggestions, setSuggestions] = useState<InventorySuggestion[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  const getSalesPredictions = useCallback(async (sales: SaleRecord[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-predictions', {
        body: { sales, type: 'sales_prediction' }
      });

      if (error) throw error;

      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      setPredictions(parsed.predictions || []);
      
      toast({
        title: '📈 Prédictions générées',
        description: `${parsed.predictions?.length || 0} prédictions pour les prochains jours`,
      });

      return parsed;
    } catch (error) {
      console.error('Error getting predictions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer les prédictions',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getInventorySuggestions = useCallback(async (inventory: InventoryItem[], sales: SaleRecord[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-predictions', {
        body: { inventory, sales, type: 'inventory_suggestions' }
      });

      if (error) throw error;

      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      setSuggestions(parsed.suggestions || []);
      
      toast({
        title: '💡 Suggestions générées',
        description: `${parsed.suggestions?.length || 0} recommandations de commande`,
      });

      return parsed;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer les suggestions',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const detectAnomalies = useCallback(async (inventory: InventoryItem[], sales: SaleRecord[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-predictions', {
        body: { inventory, sales, type: 'anomaly_detection' }
      });

      if (error) throw error;

      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      setAnomalies(parsed.anomalies || []);
      
      const highSeverity = parsed.anomalies?.filter((a: Anomaly) => a.severity === 'high').length || 0;
      
      if (highSeverity > 0) {
        toast({
          title: '⚠️ Anomalies détectées',
          description: `${highSeverity} anomalies critiques trouvées`,
          variant: 'destructive',
        });
      }

      return parsed;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de détecter les anomalies',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    predictions,
    suggestions,
    anomalies,
    getSalesPredictions,
    getInventorySuggestions,
    detectAnomalies,
  };
};
