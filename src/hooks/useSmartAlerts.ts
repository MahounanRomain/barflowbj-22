import React, { useState, useEffect } from 'react';
import { useLocalData } from '@/hooks/useLocalData';

export interface SmartAlert {
  id: string;
  type: 'stock' | 'sales' | 'profit' | 'performance';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  actionRequired: boolean;
  itemId?: string;
  threshold?: number;
  currentValue?: number;
}

export const useSmartAlerts = () => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const { getSales, getInventory, getStaff } = useLocalData();

  const generateAlerts = () => {
    const sales = getSales();
    const inventory = getInventory();
    const now = new Date().toISOString();

    // Construire d'abord la liste d'alertes actives sans se baser sur l'état courant
    const draftAlerts: SmartAlert[] = [];

    // Alertes de stock
    inventory.forEach((item) => {
      const threshold = Number(item.threshold) || 5;
      const quantity = Number(item.quantity) || 0;

      if (quantity <= 0) {
        draftAlerts.push({
          id: `stock-out-${item.id}`,
          type: 'stock',
          severity: 'critical',
          title: 'Rupture de stock détectée',
          description: `${item.name} est en rupture de stock`,
          timestamp: now,
          actionRequired: true,
          itemId: item.id,
          threshold,
          currentValue: quantity,
        });
      } else if (quantity <= threshold) {
        draftAlerts.push({
          id: `stock-low-${item.id}`,
          type: 'stock',
          severity: 'warning',
          title: 'Stock faible détecté',
          description: `${item.name} nécessite un réapprovisionnement (${quantity} ${item.unit} restant)`,
          timestamp: now,
          actionRequired: true,
          itemId: item.id,
          threshold,
          currentValue: quantity,
        });
      }
    });

    // Alertes de ventes - comparaison avec la moyenne
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = sales
      .filter((sale) => sale.date === today)
      .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

    // Moyenne des 7 derniers jours (hors aujourd'hui)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (i + 1));
      return d.toISOString().split('T')[0];
    });

    const averageRevenue =
      last7Days
        .map((d) =>
          sales
            .filter((s) => s.date === d)
            .reduce((sum, s) => sum + Number(s.total || 0), 0)
        )
        .reduce((a, b) => a + b, 0) / 7;

    if (sales.length > 7 && todayRevenue < averageRevenue * 0.5) {
      draftAlerts.push({
        id: 'sales-low',
        type: 'sales',
        severity: 'warning',
        title: 'Baisse significative des ventes',
        description: `Les ventes d'aujourd'hui sont en baisse de ${Math.round(
          (1 - todayRevenue / averageRevenue) * 100
        )}% par rapport à la moyenne`,
        timestamp: now,
        actionRequired: false,
        currentValue: todayRevenue,
        threshold: averageRevenue,
      });
    }

    // Fusionner avec les alertes précédentes pour préserver les timestamps d'origine
    setAlerts((prev) =>
      draftAlerts.map((a) => {
        const existing = prev.find((p) => p.id === a.id);
        return { ...a, timestamp: existing?.timestamp || a.timestamp };
      })
    );
  };

  useEffect(() => {
    generateAlerts();
    
    // Régénérer les alertes toutes les 5 minutes
    const interval = setInterval(generateAlerts, 5 * 60 * 1000);
    
    // Écouter les changements de données
    const handleDataChange = () => {
      setTimeout(generateAlerts, 100); // Petit délai pour s'assurer que les données sont à jour
    };
    
    window.addEventListener('salesChanged', handleDataChange);
    window.addEventListener('inventoryChanged', handleDataChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('salesChanged', handleDataChange);
      window.removeEventListener('inventoryChanged', handleDataChange);
    };
  }, []);

  return {
    alerts,
    generateAlerts
  };
};