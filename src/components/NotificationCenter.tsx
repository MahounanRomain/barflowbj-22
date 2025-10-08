
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bell, AlertTriangle, TrendingUp, Users, Package, Trash2, FileX } from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

const NotificationCenter = () => {
  const { getInventory, getSales, getSettings } = useLocalData();
  const { 
    notifications, 
    addNotification, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    unreadCount,
    formatTimestamp
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <Package size={16} className="text-orange-500" />;
      case 'high_sales': return <TrendingUp size={16} className="text-green-500" />;
      case 'staff_activity': return <Users size={16} className="text-blue-500" />;
      case 'damage_report': return <FileX size={16} className="text-purple-500" />;
      default: return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  const generateSystemNotifications = () => {
    const inventory = getInventory();
    const sales = getSales();
    const settings = getSettings();

    if (settings?.lowStockAlerts) {
      inventory.forEach(item => {
        if (item.quantity <= item.threshold) {
          // Check if notification already exists for this item
          const existingNotification = notifications.find(n => 
            n.type === 'low_stock' && 
            n.relatedItemId === item.id &&
            !n.read
          );

          if (!existingNotification) {
            addNotification(
              'low_stock',
              'Stock bas',
              `${item.name} (${item.quantity} restants)`,
              item.quantity === 0 ? 'high' : 'medium',
              true,
              item.id,
              48 // Expire dans 48h
            );
          }
        }
      });
    }

    // Notifications pour ventes élevées (dernières 24h)
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const recentSales = sales.filter(sale => new Date(sale.createdAt || sale.date) > yesterday);
    
    if (recentSales.length > 10) {
      // Check if notification already exists for high sales today
      const existingNotification = notifications.find(n => 
        n.type === 'high_sales' && 
        n.timestamp.startsWith(today.toISOString().split('T')[0]) &&
        !n.read
      );

      if (!existingNotification) {
        addNotification(
          'high_sales',
          'Forte activité',
          `${recentSales.length} ventes dans les dernières 24h`,
          'medium',
          true,
          undefined,
          24 // Expire dans 24h
        );
      }
    }
  };

  useEffect(() => {
    // Générer immédiatement au montage
    generateSystemNotifications();
    
    // Vérifier toutes les 5 minutes
    const interval = setInterval(generateSystemNotifications, 300000);
    
    // Écouter les changements dans les données
    const handleDataChange = () => {
      console.log('🔔 Données changées, regénération des notifications');
      generateSystemNotifications();
    };
    
    window.addEventListener('inventoryChanged', handleDataChange);
    window.addEventListener('salesChanged', handleDataChange);
    window.addEventListener('settingsChanged', handleDataChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('inventoryChanged', handleDataChange);
      window.removeEventListener('salesChanged', handleDataChange);
      window.removeEventListener('settingsChanged', handleDataChange);
    };
  }, [notifications, addNotification]); // Inclure les dépendances nécessaires

  const handleRemoveNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative h-9 w-9 rounded-full p-0">
          <Bell size={18} className="text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 p-0 text-xs font-bold",
                "flex items-center justify-center min-w-[20px]",
                "border-2 border-background shadow-lg",
                "animate-pulse bg-red-500 text-white"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              Notifications
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                Tout marquer lu
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={48} className="mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">
                Aucune notification
              </p>
              <p className="text-sm text-muted-foreground/70">
                Vous êtes à jour !
              </p>
            </div>
          ) : (
            notifications.map(notification => (
              <Card 
                key={notification.id}
                className={cn(
                  "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
                  !notification.read && "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                      <Badge 
                        variant={notification.priority === 'high' ? 'destructive' : notification.priority === 'medium' ? 'default' : 'secondary'}
                        className={cn(
                          "text-xs flex-shrink-0 font-medium",
                          notification.priority === 'high' && "bg-red-500 text-white animate-pulse"
                        )}
                      >
                        {notification.priority === 'high' ? 'Urgent' : 
                         notification.priority === 'medium' ? 'Moyen' : 'Faible'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-2 flex items-center justify-between">
                      <span>
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleRemoveNotification(e, notification.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
