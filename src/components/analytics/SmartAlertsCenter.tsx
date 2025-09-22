
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useSmartAlerts } from '@/hooks/useSmartAlerts';

const SmartAlertsCenter = () => {
  const { alerts } = useSmartAlerts();
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Bell className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock': return '📦';
      case 'sales': return '💰';
      case 'profit': return '📈';
      case 'performance': return '👥';
      default: return '🔔';
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'À l\'instant';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      if (isNaN(date.getTime())) return 'À l\'instant';
      
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'À l\'instant';
      if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 0) return `Il y a ${diffHours}h`;
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      
      // Pour les dates plus anciennes, afficher la date formatée
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' à ' + date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'À l\'instant';
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          Centre d'Alertes Intelligentes
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </h3>
      </div>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
          <p className="text-muted-foreground">Aucune alerte active</p>
          <p className="text-sm text-muted-foreground mt-1">Tout semble fonctionner normalement</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/10' :
                alert.severity === 'warning' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/10' :
                'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getTypeIcon(alert.type)}</span>
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {getSeverityIcon(alert.severity)}
                      <span className="ml-1 capitalize">{alert.severity}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                    {alert.actionRequired && (
                      <Badge variant="outline" className="text-xs">
                        Action requise
                      </Badge>
                    )}
                  </div>
                </div>
                {alert.actionRequired && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-4"
                    onClick={() => {
                      if (alert.type === 'stock' && alert.itemId) {
                        const id = encodeURIComponent(alert.itemId);
                        import('@/pages/Inventory').then(() => {
                          window.history.pushState({}, '', `/inventory?focus=${id}&action=restock#restock`);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        });
                      }
                    }}
                  >
                    Traiter
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default SmartAlertsCenter;
