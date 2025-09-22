
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalData } from '@/hooks/useLocalData';
import { History, User, Calendar, Package } from 'lucide-react';
import { InventoryHistoryEntry } from '@/lib/storage';

const InventoryHistory = () => {
  const { getInventoryHistory } = useLocalData();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<InventoryHistoryEntry[]>([]);

  useEffect(() => {
    if (open) {
      const historyData = getInventoryHistory();
      setHistory(historyData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
  }, [open, getInventoryHistory]);

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'created': return 'default';
      case 'updated': return 'secondary';
      case 'deleted': return 'destructive';
      case 'stock_adjusted': return 'outline';
      default: return 'default';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created': return 'Créé';
      case 'updated': return 'Modifié';
      case 'deleted': return 'Supprimé';
      case 'stock_adjusted': return 'Stock ajusté';
      default: return action;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderChanges = (changes: Record<string, { from: any; to: any }>) => {
    return Object.entries(changes).map(([field, { from, to }]) => (
      <div key={field} className="text-xs text-muted-foreground">
        <span className="font-medium">{field}:</span> {from} → {to}
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="px-2">
          <History size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historique des Modifications</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucun historique disponible</p>
            </div>
          ) : (
            history.map(entry => (
              <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Package size={16} className="text-muted-foreground" />
                    <span className="font-medium text-sm">{entry.itemName}</span>
                    <Badge variant={getActionBadgeVariant(entry.action)} className="text-xs">
                      {getActionLabel(entry.action)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User size={12} />
                    <span>{entry.userName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{formatTimestamp(entry.timestamp)}</span>
                  </div>
                </div>
                
                {Object.keys(entry.changes).length > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Modifications:</div>
                    {renderChanges(entry.changes)}
                  </div>
                )}
                
                {entry.reason && (
                  <div className="border-t pt-2">
                    <div className="text-xs">
                      <span className="font-medium text-muted-foreground">Raison:</span> {entry.reason}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryHistory;
