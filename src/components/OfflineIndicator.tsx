
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { cn } from '@/lib/utils';

const OfflineIndicator = () => {
  const { isOnline, showNotification } = useOfflineMode();

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 pt-2">
      <Alert className={cn(
        "transition-all duration-500 animate-fade-in",
        isOnline 
          ? 'gradient-success text-white border-0 shadow-lg' 
          : 'gradient-warning text-white border-0 shadow-lg'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 animate-pulse" />
            ) : (
              <WifiOff className="h-4 w-4 animate-bounce" />
            )}
            <AlertDescription className="text-white font-medium text-sm">
              {isOnline 
                ? 'Connexion rétablie - Toutes les fonctionnalités sont disponibles'
                : 'Mode hors-ligne - Vos données sont sauvegardées localement'
              }
            </AlertDescription>
          </div>
          <div className="text-xs text-white/80 ml-2">
            5s
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default OfflineIndicator;
