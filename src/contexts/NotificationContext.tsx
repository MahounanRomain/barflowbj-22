import React, { createContext, useState, useEffect, useCallback } from 'react';

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
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 100;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Event listeners pour capturer toutes les modifications
  useEffect(() => {
    const handleInventoryChange = () => {
      addNotification({
        type: 'inventory',
        title: 'Inventaire mis à jour',
        message: 'Les données d\'inventaire ont été modifiées',
        priority: 'low',
        source: 'inventory'
      });
    };

    const handleSalesChange = () => {
      addNotification({
        type: 'sales',
        title: 'Vente enregistrée',
        message: 'Une nouvelle vente a été ajoutée',
        priority: 'low',
        source: 'sales'
      });
    };

    const handleCashChange = () => {
      addNotification({
        type: 'info',
        title: 'Caisse mise à jour',
        message: 'Le solde de caisse a été modifié',
        priority: 'low',
        source: 'cash'
      });
    };

    const handleTableChange = () => {
      addNotification({
        type: 'info',
        title: 'Tables mises à jour',
        message: 'L\'état des tables a changé',
        priority: 'low',
        source: 'tables'
      });
    };

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

    // Enregistrer tous les event listeners
    window.addEventListener('inventoryChanged', handleInventoryChange);
    window.addEventListener('salesChanged', handleSalesChange);
    window.addEventListener('cashTransactionsChanged', handleCashChange);
    window.addEventListener('cashBalanceChanged', handleCashChange);
    window.addEventListener('tablesChanged', handleTableChange);
    window.addEventListener('error', handleError);
    window.addEventListener('systemMessage', handleSystemMessage as EventListener);

    return () => {
      window.removeEventListener('inventoryChanged', handleInventoryChange);
      window.removeEventListener('salesChanged', handleSalesChange);
      window.removeEventListener('cashTransactionsChanged', handleCashChange);
      window.removeEventListener('cashBalanceChanged', handleCashChange);
      window.removeEventListener('tablesChanged', handleTableChange);
      window.removeEventListener('error', handleError);
      window.removeEventListener('systemMessage', handleSystemMessage as EventListener);
    };
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
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
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
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
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
