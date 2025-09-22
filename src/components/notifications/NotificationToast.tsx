import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { Package, TrendingUp, AlertTriangle, Bell } from 'lucide-react';

// Composant pour afficher automatiquement les notifications importantes comme des toasts
const NotificationToast = () => {
  const { notifications } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    // Filtrer les notifications non lues de haute priorité récentes (moins de 5 secondes)
    const recentHighPriorityNotifications = notifications.filter(notification => {
      if (notification.read || notification.priority !== 'high') return false;
      
      try {
        const notificationTime = new Date(notification.timestamp).getTime();
        const now = new Date().getTime();
        
        // Vérifier que la date est valide
        if (isNaN(notificationTime)) return false;
        
        const timeDiff = now - notificationTime;
        
        // Notification récente (moins de 5 secondes) et pas encore affichée comme toast
        return timeDiff < 5000 && timeDiff >= 0 && !notification.id.includes('toast_shown');
      } catch (error) {
        console.warn('Erreur lors de la validation du timestamp:', error);
        return false;
      }
    });

    // Afficher un toast pour chaque notification de haute priorité
    recentHighPriorityNotifications.forEach(notification => {
      const getIcon = () => {
        switch (notification.type) {
          case 'low_stock': return <Package size={16} />;
          case 'high_sales': return <TrendingUp size={16} />;
          case 'table_update': return <Bell size={16} />;
          default: return <AlertTriangle size={16} />;
        }
      };

      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.priority === 'high' ? 'destructive' : 'default',
        duration: 6000, // 6 secondes
      });
    });
  }, [notifications, toast]);

  // Ce composant ne rend rien visuellement, il gère juste les toasts
  return null;
};

export default NotificationToast;