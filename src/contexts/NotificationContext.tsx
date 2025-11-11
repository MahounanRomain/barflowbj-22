import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'inventory' | 'sales' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  source?: string;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markMultipleAsRead: (ids: string[]) => void;
  removeMultiple: (ids: string[]) => void;
  isLoading: boolean;
  error: string | null;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 100;
const NOTIFICATION_CACHE_TIME = 5000; // 5 seconds to prevent duplicate notifications

// Validation helper
const validateNotification = (notification: Partial<Notification>): boolean => {
  try {
    return Boolean(
      notification.type &&
      notification.title &&
      notification.message &&
      notification.priority &&
      ['success', 'error', 'warning', 'info', 'inventory', 'sales', 'system'].includes(notification.type) &&
      ['high', 'medium', 'low'].includes(notification.priority)
    );
  } catch {
    return false;
  }
};

// Safe storage operations
const safeGetStorage = (key: string): Notification[] => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(validateNotification);
  } catch (error) {
    console.error('Error reading notifications from storage:', error);
    return [];
  }
};

const safeSetStorage = (key: string, value: Notification[]): boolean => {
  try {
    const validated = value.filter(validateNotification);
    localStorage.setItem(key, JSON.stringify(validated));
    return true;
  } catch (error) {
    console.error('Error saving notifications to storage:', error);
    toast.error('Impossible de sauvegarder les notifications');
    return false;
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(safeGetStorage(STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recentNotificationsRef = React.useRef<Map<string, number>>(new Map());

  // Sauvegarder dans localStorage avec gestion d'erreurs
  useEffect(() => {
    safeSetStorage(STORAGE_KEY, notifications);
  }, [notifications]);

  // Event listeners pour les notifications importantes uniquement
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addNotification({
        type: 'error',
        title: 'Erreur système',
        message: event.message || 'Une erreur est survenue',
        priority: 'high',
        source: 'system'
      });
    };

    const handleSystemMessage = (event: CustomEvent) => {
      const { type, title, message, priority } = event.detail;
      addNotification({
        type: type || 'system',
        title: title || 'Message système',
        message: message || '',
        priority: priority || 'medium',
        source: 'system'
      });
    };

    // Enregistrer seulement les event listeners pour erreurs et messages système
    window.addEventListener('error', handleError);
    window.addEventListener('systemMessage', handleSystemMessage as EventListener);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('systemMessage', handleSystemMessage as EventListener);
    };
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    try {
      // Validate notification
      if (!validateNotification(notification)) {
        console.error('Invalid notification data:', notification);
        setError('Notification invalide');
        return;
      }

      // Create a unique key for deduplication
      const notificationKey = `${notification.type}_${notification.title}_${notification.source || ''}`;
      const now = Date.now();
      const lastTimestamp = recentNotificationsRef.current.get(notificationKey);
      
      // Prevent duplicate notifications within cache time
      if (lastTimestamp && (now - lastTimestamp) < NOTIFICATION_CACHE_TIME) {
        return;
      }
      
      // Update cache
      recentNotificationsRef.current.set(notificationKey, now);
      
      // Clean old cache entries
      recentNotificationsRef.current.forEach((timestamp, key) => {
        if (now - timestamp > NOTIFICATION_CACHE_TIME) {
          recentNotificationsRef.current.delete(key);
        }
      });

      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false
      };

      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        return updated;
      });
      
      setError(null);
    } catch (error) {
      console.error('Error adding notification:', error);
      setError('Impossible d\'ajouter la notification');
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    try {
      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Impossible de marquer la notification comme lue');
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    try {
      setIsLoading(true);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Error marking all as read:', error);
      setError('Impossible de marquer toutes les notifications comme lues');
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    try {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error removing notification:', error);
      setError('Impossible de supprimer la notification');
    }
  }, []);

  const clearAll = useCallback(() => {
    try {
      setIsLoading(true);
      setNotifications([]);
      recentNotificationsRef.current.clear();
      toast.success('Toutes les notifications ont été effacées');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      setError('Impossible d\'effacer les notifications');
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markMultipleAsRead = useCallback((ids: string[]) => {
    try {
      setIsLoading(true);
      setNotifications(prev =>
        prev.map(notif => ids.includes(notif.id) ? { ...notif, read: true } : notif)
      );
      toast.success(`${ids.length} notification${ids.length > 1 ? 's' : ''} marquée${ids.length > 1 ? 's' : ''} comme lue${ids.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error marking multiple as read:', error);
      setError('Impossible de marquer les notifications comme lues');
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMultiple = useCallback((ids: string[]) => {
    try {
      setIsLoading(true);
      setNotifications(prev => prev.filter(notif => !ids.includes(notif.id)));
      toast.success(`${ids.length} notification${ids.length > 1 ? 's' : ''} supprimée${ids.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error removing multiple notifications:', error);
      setError('Impossible de supprimer les notifications');
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        markMultipleAsRead,
        removeMultiple,
        isLoading,
        error
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
