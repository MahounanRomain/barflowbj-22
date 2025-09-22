import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SimpleNumericInput } from '@/components/ui/simple-numeric-input';
import { useLocalData } from '@/hooks/useLocalData';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';

interface RestockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  };
}

const RestockDialog: React.FC<RestockDialogProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const { updateInventoryItem, createInventoryHistoryEntry } = useLocalData();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const restockQuantity = parseFloat(quantity);
    if (!restockQuantity || restockQuantity <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une quantité valide",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newQuantity = item.quantity + restockQuantity;
      
      // Update inventory item
      updateInventoryItem(item.id, {
        quantity: newQuantity
      });

      // Create history entry
      createInventoryHistoryEntry({
        action: 'stock_adjusted',
        itemId: item.id,
        itemName: item.name,
        quantityChange: {
          from: item.quantity,
          to: newQuantity,
          amount: restockQuantity
        },
        reason: reason || 'Réapprovisionnement'
      });

      toast({
        title: "✅ Stock réapprovisionné",
        description: `${restockQuantity} ${item.unit} ajouté(s) au stock de ${item.name}`,
      });

      // Reset form
      setQuantity('');
      setReason('');
      onClose();
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Une erreur s'est produite lors du réapprovisionnement",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuantity('');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Réapprovisionner {item.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Stock actuel</div>
            <div className="font-semibold text-lg">
              {item.quantity} {item.unit}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité à ajouter *</Label>
            <SimpleNumericInput
              id="quantity"
              value={quantity}
              onValueChange={setQuantity}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motif (optionnel)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motif du réapprovisionnement..."
              rows={2}
            />
          </div>

          {quantity && parseFloat(quantity) > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-700 dark:text-green-300">
                Nouveau stock après réapprovisionnement
              </div>
              <div className="font-semibold text-green-800 dark:text-green-200">
                {item.quantity + parseFloat(quantity)} {item.unit}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? "Réapprovisionnement..." : "Réapprovisionner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestockDialog;