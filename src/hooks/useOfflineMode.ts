
import * as React from 'react';
const { useState, useEffect } = React;

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // L'utilisateur vient de se reconnecter
        console.log('Connexion rétablie');
        setShowNotification(true);
        
        // Masquer la notification après 5 secondes
        setTimeout(() => {
          setShowNotification(false);
          setWasOffline(false);
        }, 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowNotification(true);
      console.log('Mode hors-ligne activé');
      
      // Masquer la notification après 5 secondes
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    showNotification
  };
};
