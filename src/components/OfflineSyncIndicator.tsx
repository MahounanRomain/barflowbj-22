import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const OfflineSyncIndicator = () => {
  const { isOnline, isSyncing, syncProgress, queueLength } = useOfflineSync();

  // Don't show if online and nothing to sync
  if (isOnline && !isSyncing && queueLength === 0) {
    return null;
  }

  // Show offline status with pending changes
  if (!isOnline && queueLength > 0) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96">
        <Alert className="bg-warning/90 text-warning-foreground border-warning backdrop-blur-sm">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Mode hors-ligne - {queueLength} modification(s) en attente
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show syncing progress
  if (isSyncing) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96">
        <Alert className="bg-primary/90 text-primary-foreground border-primary backdrop-blur-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription className="ml-2 space-y-2">
            <div className="flex items-center justify-between">
              <span>Synchronisation en cours...</span>
              <span className="text-sm">{Math.round(syncProgress)}%</span>
            </div>
            <Progress value={syncProgress} className="h-1" />
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};

export default OfflineSyncIndicator;
