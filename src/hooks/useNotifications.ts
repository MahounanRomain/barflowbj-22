import { useContext } from 'react';
import { NotificationContext } from '@/contexts/NotificationContext';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  
  return context;
};

// Helper function pour envoyer des messages système personnalisés
export const sendSystemMessage = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  priority: 'high' | 'medium' | 'low' = 'medium'
) => {
  window.dispatchEvent(
    new CustomEvent('systemMessage', {
      detail: { type, title, message, priority }
    })
  );
};
