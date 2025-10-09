import { useEffect, useState, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface DailyResetState {
  lastResetDate: string;
  isResetting: boolean;
}

export const useDailyReset = () => {
  const [resetState, setResetState] = useState<DailyResetState>({
    lastResetDate: '',
    isResetting: false
  });
  const { toast } = useToast();

  const resetDailyData = useCallback(() => {
    console.log('🔄 Réinitialisation quotidienne en cours...');
    
    setResetState(prev => ({ ...prev, isResetting: true }));
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Archiver les données du jour précédent
      const currentSales = storage.load('sales') || [];
      const dailyArchive = storage.load('dailyArchive') || {};
      
      // Sauvegarder les ventes de la veille
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      
      const yesterdaySales = Array.isArray(currentSales) ? currentSales.filter((sale: any) => 
        sale.date === yesterdayKey
      ) : [];
      
      if (yesterdaySales.length > 0) {
        dailyArchive[yesterdayKey] = {
          sales: yesterdaySales,
          totalRevenue: yesterdaySales.reduce((sum: number, sale: any) => sum + sale.total, 0),
          totalTransactions: yesterdaySales.length,
          archivedAt: new Date().toISOString()
        };
        storage.save('dailyArchive', dailyArchive);
      }

      // Reset daily counters and prepare for new day
      storage.save('lastDailyReset', today);
      
      setResetState({
        lastResetDate: today,
        isResetting: false
      });

      // Notification de réinitialisation seulement à minuit
      const now = new Date();
      const isNearMidnight = now.getHours() === 0 && now.getMinutes() < 5;
      
      if (isNearMidnight) {
        toast({
          title: "🌅 Nouvelle journée",
          description: `Données quotidiennes réinitialisées pour le ${new Date().toLocaleDateString('fr-FR')}`,
        });
      }

      // Dispatch events for all modules to sync
      ['dailyReset', 'salesChanged', 'inventoryChanged', 'cashBalanceChanged'].forEach(event => {
        window.dispatchEvent(new CustomEvent(event, { 
          detail: { date: today, timestamp: new Date().toISOString(), type: 'daily-reset' }
        }));
      });

      console.log('✅ Réinitialisation quotidienne terminée');
      
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation quotidienne:', error);
      setResetState(prev => ({ ...prev, isResetting: false }));
      
      toast({
        title: "❌ Erreur de réinitialisation",
        description: "Impossible de réinitialiser les données quotidiennes.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const checkForDailyReset = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = storage.load('lastDailyReset') || '';
    
    if (lastReset !== today) {
      console.log(`🔍 Réinitialisation nécessaire: dernier reset ${lastReset}, aujourd'hui ${today}`);
      resetDailyData();
      return true;
    } else {
      setResetState(prev => ({ ...prev, lastResetDate: lastReset }));
      return false;
    }
  }, [resetDailyData]);

  const scheduleMidnightReset = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 100); // 00:00:00.100 AM - juste après minuit
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    console.log(`⏰ Prochaine réinitialisation programmée dans ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
    
    return setTimeout(() => {
      console.log('🕛 Exécution de la réinitialisation à minuit');
      resetDailyData();
      // Reprogrammer pour le lendemain
      scheduleMidnightReset();
    }, msUntilMidnight);
  }, [resetDailyData]);

  useEffect(() => {
    // Vérifier si une réinitialisation est nécessaire au démarrage
    checkForDailyReset();
    
    // Programmer la réinitialisation à minuit
    const timeoutId = scheduleMidnightReset();
    
    // Vérifier périodiquement (toutes les 15 minutes pour être plus réactif)
    const intervalId = setInterval(checkForDailyReset, 15 * 60 * 1000);

    // Listen to visibility change to check when user returns
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForDailyReset();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForDailyReset, scheduleMidnightReset]);

  return {
    resetState,
    resetDailyData,
    checkForDailyReset
  };
};