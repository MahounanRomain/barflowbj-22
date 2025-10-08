import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info, Package, ShoppingCart } from 'lucide-react';

const NotificationToast = () => {
  const { notifications } = useNotifications();

  useEffect(() => {
    // Afficher un toast uniquement pour les notifications de haute priorité récentes
    const latestNotification = notifications[0];
    
    if (!latestNotification || latestNotification.read) return;
    
    const notificationTime = new Date(latestNotification.timestamp).getTime();
    const now = Date.now();
    const timeDiff = now - notificationTime;
    
    // Seulement afficher si la notification a moins de 2 secondes
    if (timeDiff > 2000) return;

    const getIcon = () => {
      switch (latestNotification.type) {
        case 'success':
          return <CheckCircle2 className="w-5 h-5 text-success" />;
        case 'error':
          return <XCircle className="w-5 h-5 text-destructive" />;
        case 'warning':
          return <AlertTriangle className="w-5 h-5 text-warning" />;
        case 'info':
          return <Info className="w-5 h-5 text-info" />;
        case 'inventory':
          return <Package className="w-5 h-5 text-primary" />;
        case 'sales':
          return <ShoppingCart className="w-5 h-5 text-success" />;
        default:
          return <Info className="w-5 h-5" />;
      }
    };

    // Afficher uniquement les notifications de priorité moyenne ou haute
    if (latestNotification.priority === 'high' || latestNotification.priority === 'medium') {
      toast.custom((t) => (
        <div className={`
          flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-background
          ${latestNotification.priority === 'high' ? 'border-destructive' : 'border-border'}
        `}>
          {getIcon()}
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{latestNotification.title}</h4>
            <p className="text-sm text-muted-foreground">{latestNotification.message}</p>
          </div>
        </div>
      ), {
        duration: latestNotification.priority === 'high' ? 8000 : 5000,
      });
    }
  }, [notifications]);

  return null;
};

export default NotificationToast;
