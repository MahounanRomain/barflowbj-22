import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { Package, TrendingUp, AlertTriangle, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StackedNotificationProps {
  notifications: any[];
  onDismiss: () => void;
}

const StackedNotificationDisplay: React.FC<StackedNotificationProps> = ({ 
  notifications, 
  onDismiss 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <Package size={16} />;
      case 'high_sales': return <TrendingUp size={16} />;
      case 'table_update': return <Bell size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'text-yellow-500 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20';
      default: return 'text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  // Auto-expand after 2 seconds if not manually expanded
  useEffect(() => {
    if (!isExpanded && notifications.length > 1) {
      const timer = setTimeout(() => {
        setShowAll(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, notifications.length]);

  const visibleNotifications = showAll || isExpanded ? notifications : [notifications[0]];
  const hiddenCount = notifications.length - 1;

  return (
    <div className="relative max-w-md">
      {/* Stacked background cards */}
      {notifications.length > 1 && !isExpanded && (
        <div className="absolute inset-0">
          <div className="absolute top-1 left-1 w-full h-full bg-background/60 border border-border/60 rounded-lg" />
          <div className="absolute top-2 left-2 w-full h-full bg-background/40 border border-border/40 rounded-lg" />
        </div>
      )}

      {/* Main notification container */}
      <div 
        className={cn(
          "relative bg-background border border-border rounded-lg shadow-lg transition-all duration-300 ease-out",
          isExpanded ? "p-2 space-y-2" : "p-4",
          "cursor-pointer hover:shadow-xl"
        )}
        onClick={() => {
          if (notifications.length > 1) {
            setIsExpanded(!isExpanded);
            setShowAll(true);
          }
        }}
      >
        {/* Header with count */}
        {notifications.length > 1 && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {isExpanded ? 'Notifications' : `${notifications.length} notifications`}
            </span>
            {notifications.length > 1 && (
              <div className="flex items-center space-x-1">
                {!isExpanded && hiddenCount > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    +{hiddenCount}
                  </span>
                )}
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </div>
        )}

        {/* Notifications list */}
        <div className={cn(
          "space-y-2 transition-all duration-300",
          isExpanded ? "max-h-96 overflow-y-auto" : ""
        )}>
          {visibleNotifications.map((notification, index) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start space-x-3 transition-all duration-200",
                isExpanded ? cn(
                  "p-3 rounded-lg border",
                  getPriorityColor(notification.priority)
                ) : "",
                index > 0 && !isExpanded ? "hidden" : ""
              )}
            >
              <div className={cn(
                "flex-shrink-0 mt-0.5",
                notification.priority === 'high' ? 'text-red-500' :
                notification.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
              )}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-sm text-foreground">
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                {isExpanded && (
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      try {
                        const date = new Date(notification.timestamp);
                        return isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleTimeString('fr-FR');
                      } catch (error) {
                        return 'Date invalide';
                      }
                    })()}
                  </p>
                )}
              </div>

              {notification.priority === 'high' && (
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>

        {/* Footer actions */}
        {isExpanded && (
          <div className="flex justify-end pt-2 border-t border-border/50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Fermer tout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StackedNotificationToast = () => {
  const { notifications } = useNotifications();
  const [displayedNotifications, setDisplayedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Filtrer les notifications récentes de haute priorité non affichées
    const recentHighPriorityNotifications = notifications.filter(notification => {
      if (notification.read || notification.priority !== 'high') return false;
      
      try {
        const notificationTime = new Date(notification.timestamp).getTime();
        const now = new Date().getTime();
        
        // Vérifier que la date est valide
        if (isNaN(notificationTime)) return false;
        
        const timeDiff = now - notificationTime;
        
        // Notification récente (moins de 3 secondes) et pas encore affichée
        return timeDiff < 3000 && timeDiff >= 0 && !displayedNotifications.has(notification.id);
      } catch (error) {
        console.warn('Erreur lors de la validation du timestamp:', error);
        return false;
      }
    });

    if (recentHighPriorityNotifications.length > 0) {
      // Marquer comme affichées
      const newDisplayed = new Set(displayedNotifications);
      recentHighPriorityNotifications.forEach(notif => newDisplayed.add(notif.id));
      setDisplayedNotifications(newDisplayed);

      // Afficher le toast empilé
      toast.custom(
        (t) => (
          <StackedNotificationDisplay
            notifications={recentHighPriorityNotifications}
            onDismiss={() => toast.dismiss(t)}
          />
        ),
        {
          duration: 8000,
          position: 'top-right'
        }
      );
    }
  }, [notifications, displayedNotifications]);

  // Nettoyer les notifications affichées après 30 secondes
  useEffect(() => {
    const cleanup = setInterval(() => {
      const thirtySecondsAgo = Date.now() - 30000;
      const validNotifications = new Set(
        Array.from(displayedNotifications).filter(id => {
          const notification = notifications.find(n => n.id === id);
          if (!notification) return false;
          try {
            const timestamp = new Date(notification.timestamp).getTime();
            return !isNaN(timestamp) && timestamp > thirtySecondsAgo;
          } catch (error) {
            return false;
          }
        })
      );
      setDisplayedNotifications(validNotifications);
    }, 30000);

    return () => clearInterval(cleanup);
  }, [displayedNotifications, notifications]);

  return null;
};

export default StackedNotificationToast;