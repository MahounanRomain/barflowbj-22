import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLocalData } from '@/hooks/useLocalData';
import { useToast } from '@/components/ui/use-toast';
import { History, Search, Undo2, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProcessedRestockEntry {
  id: string;
  itemId: string;
  itemName: string;
  quantityFrom: number;
  quantityTo: number;
  quantityChange: number;
  timestamp: string;
  reason?: string;
  originalEntry: any;
}

const OptimizedRestockHistory: React.FC = () => {
  const { getInventoryHistory, updateInventoryItem, getInventory } = useLocalData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get inventory for reference
  const inventory = getInventory();
  
  // Completely new approach: process and deduplicate using Map
  const restockHistory = useMemo(() => {
    const allHistory = getInventoryHistory();
    console.log('📋 Total history entries:', allHistory.length);
    
    // Filter stock adjustments with quantity increases
    const stockAdjustments = allHistory.filter(entry => {
      const isStockAdjusted = entry.action === 'stock_adjusted';
      const hasQuantityChange = entry.changes && entry.changes.quantity;
      const isIncrease = hasQuantityChange && entry.changes.quantity.to > entry.changes.quantity.from;
      
      return isStockAdjusted && hasQuantityChange && isIncrease;
    });

    console.log('📈 Stock adjustments (increases):', stockAdjustments.length);

    // Use Map for precise deduplication
    const restockMap = new Map<string, ProcessedRestockEntry>();

    stockAdjustments.forEach(entry => {
      // Create a processed entry
      const processed: ProcessedRestockEntry = {
        id: `${entry.itemId}-${entry.changes.quantity.from}-${entry.changes.quantity.to}-${entry.timestamp}`,
        itemId: entry.itemId,
        itemName: entry.itemName,
        quantityFrom: entry.changes.quantity.from,
        quantityTo: entry.changes.quantity.to,
        quantityChange: entry.changes.quantity.to - entry.changes.quantity.from,
        timestamp: entry.timestamp,
        reason: entry.reason,
        originalEntry: entry
      };

      // Use composite key for deduplication
      const key = `${processed.itemId}-${processed.quantityFrom}-${processed.quantityTo}-${Math.floor(new Date(processed.timestamp).getTime() / 60000)}`; // Group by minute
      
      // Only keep the first occurrence
      if (!restockMap.has(key)) {
        restockMap.set(key, processed);
      }
    });

    // Convert Map to array and sort
    const uniqueRestocks = Array.from(restockMap.values());
    console.log('✅ Unique restocks after deduplication:', uniqueRestocks.length);

    return uniqueRestocks.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [getInventoryHistory]);

  // Filter history based on search term
  const filteredHistory = useMemo(() => {
    if (!searchTerm) return restockHistory;
    
    const searchLower = searchTerm.toLowerCase();
    return restockHistory.filter(entry =>
      entry.itemName.toLowerCase().includes(searchLower) ||
      (entry.reason && entry.reason.toLowerCase().includes(searchLower))
    );
  }, [restockHistory, searchTerm]);

  // Paginate results
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const handleUndoRestock = (entry: ProcessedRestockEntry) => {
    try {
      const item = inventory.find(inv => inv.id === entry.itemId);
      if (!item) {
        toast({
          title: "❌ Erreur",
          description: "Article non trouvé dans l'inventaire",
          variant: "destructive"
        });
        return;
      }

      // Revert to previous quantity
      updateInventoryItem(entry.itemId, {
        quantity: entry.quantityFrom
      });

      toast({
        title: "✅ Réapprovisionnement annulé",
        description: `Stock de ${entry.itemName} restauré à ${entry.quantityFrom}`,
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Erreur lors de l'annulation du réapprovisionnement",
        variant: "destructive"
      });
    }
  };

  if (restockHistory.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun historique de réapprovisionnement</h3>
            <p className="text-muted-foreground">
              Les réapprovisionnements apparaîtront ici une fois effectués.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des Réapprovisionnements (Optimisé)
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom d'article ou motif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => {
            setItemsPerPage(parseInt(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 par page</SelectItem>
              <SelectItem value="10">10 par page</SelectItem>
              <SelectItem value="20">20 par page</SelectItem>
              <SelectItem value="50">50 par page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {paginatedHistory.map((entry) => (
          <div 
            key={entry.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{entry.itemName}</span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    +{entry.quantityChange}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(entry.timestamp), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </div>
                  
                  <div>
                    {entry.quantityFrom} → {entry.quantityTo}
                  </div>
                </div>
                
                {entry.reason && (
                  <div className="text-xs text-muted-foreground mt-1 italic">
                    "{entry.reason}"
                  </div>
                )}
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler le réapprovisionnement</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action va restaurer le stock de "{entry.itemName}" à sa valeur précédente ({entry.quantityFrom}). Cette action ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleUndoRestock(entry)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Confirmer l'annulation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages} ({filteredHistory.length} entrées)
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizedRestockHistory;
