import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';

export interface Notification {
  id: string;
  type: 'low_stock' | 'high_sales' | 'staff_activity' | 'system' | 'table_update' | 'damage_report';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedItemId?: string;
  expiresAt?: string;
  persistent?: boolean;
}

const NOTIFICATIONS_STORAGE_KEY = 'notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const savedNotifications = storage.load<Notification[]>(NOTIFICATIONS_STORAGE_KEY) || [];
    const currentTime = new Date().getTime();
    const validNotifications = savedNotifications.filter(notification => {
      if (!notification.expiresAt) return true;
      return new Date(notification.expiresAt).getTime() > currentTime;
    });
    
    setNotifications(validNotifications);
    
    if (validNotifications.length !== savedNotifications.length) {
      storage.save(NOTIFICATIONS_STORAGE_KEY, validNotifications);
    }
  }, []);

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    priority: Notification['priority'] = 'medium',
    persistent: boolean = true,
    relatedItemId?: string,
    expiresInHours?: number
  ) => {
    const now = new Date();
    const id = `${type}_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let expiresAt: string | undefined;
    if (expiresInHours) {
      const expirationDate = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
      expiresAt = expirationDate.toISOString();
    }
    
    const notification: Notification = {
      id, type, title, message,
      timestamp: now.toISOString(),
      read: false, priority, relatedItemId, expiresAt, persistent
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      if (persistent) {
        storage.save(NOTIFICATIONS_STORAGE_KEY, newNotifications);
      }
      return newNotifications;
    });

    return notification;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      storage.save(NOTIFICATIONS_STORAGE_KEY, updated.filter(n => n.persistent));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }));
      storage.save(NOTIFICATIONS_STORAGE_KEY, updated.filter(n => n.persistent));
      return updated;
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== id);
      storage.save(NOTIFICATIONS_STORAGE_KEY, updated.filter(n => n.persistent));
      return updated;
    });
  }, []);

  const removeNotificationsByEntity = useCallback((entityId: string, type?: Notification['type']) => {
    setNotifications(prev => {
      const updated = prev.filter(n => {
        if (n.relatedItemId !== entityId) return true;
        if (type && n.type !== type) return true;
        return false;
      });
      storage.save(NOTIFICATIONS_STORAGE_KEY, updated.filter(n => n.persistent));
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  const formatTimestamp = useCallback((timestamp: string) => {
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
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (error) {
      return 'À l\'instant';
    }
  }, []);

  const getStats = useCallback(() => ({
    unreadCount,
    totalCount: notifications.length,
    highPriorityCount: notifications.filter(n => !n.read && n.priority === 'high').length,
    hasUnread: unreadCount > 0,
    hasHighPriority: notifications.filter(n => !n.read && n.priority === 'high').length > 0
  }), [notifications, unreadCount]);

  return {
    notifications, addNotification, markAsRead, markAllAsRead, removeNotification,
    deleteNotification: removeNotification, clearReadNotifications: removeNotification,
    getStats, removeNotificationsByEntity, cleanupStockNotifications: removeNotificationsByEntity,
    unreadCount, formatTimestamp
  };
};