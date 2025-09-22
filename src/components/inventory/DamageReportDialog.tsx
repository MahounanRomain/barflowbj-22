import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, Save, X, Sparkles, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLocalData } from '@/hooks/useLocalData';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { getTodayDateString } from '@/lib/dateUtils';
import { CommonItemSelector } from '../sale/CommonItemSelector';

interface DamageReport {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: string;
  description?: string;
  reportedBy: string;
  date: string;
  timestamp: string;
  lossValue: number;
}

const DamageReportDialog = () => {
  const { getInventory, updateInventoryItem, getStaff } = useLocalData();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [staff, setStaff] = useState([]);
  
  // Form states
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');

  const reasons = [
    'Bouteille cassée',
    'Produit périmé',
    'Contamination',
    'Défaut de fabrication',
    'Accident de manipulation',
    'Vol/Casse client',
    'Autre'
  ];

  useEffect(() => {
    if (open) {
      setInventory(getInventory());
      const activeStaff = getStaff().filter(member => member.isActive);
      setStaff(activeStaff);
      
      // Auto-sélection du premier staff si un seul disponible
      if (activeStaff.length === 1) {
        setReportedBy(activeStaff[0].id);
      }
    }
  }, [open, getInventory, getStaff]);

  const resetForm = () => {
    setSelectedItem('');
    setQuantity(1);
    setReason('');
    setDescription('');
    setReportedBy('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem || !reason || !reportedBy) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const item = inventory.find(inv => inv.id === selectedItem);
    if (!item) {
      toast({
        title: "Erreur",
        description: "Article non trouvé",
        variant: "destructive",
      });
      return;
    }

    if (quantity > item.quantity) {
      toast({
        title: "Quantité invalide",
        description: `Quantité disponible: ${item.quantity} ${item.unit}`,
        variant: "destructive",
      });
      return;
    }

    const staffMember = staff.find(s => s.id === reportedBy);
    const lossValue = quantity * (item.purchasePrice || 0);

    try {
      // 1. Créer le rapport de dégât
      const damageReport: DamageReport = {
        id: `damage_${Date.now()}`,
        itemId: selectedItem,
        itemName: item.name,
        quantity,
        reason,
        description,
        reportedBy: staffMember?.name || "Inconnu",
        date: getTodayDateString(),
        timestamp: new Date().toISOString(),
        lossValue
      };

      // 2. Sauvegarder le rapport
      const { storage } = await import('@/lib/storage');
      const existingReports: DamageReport[] = storage.load('damageReports') || [];
      storage.save('damageReports', [...existingReports, damageReport]);

      // 3. Mettre à jour le stock
      updateInventoryItem(selectedItem, { 
        quantity: item.quantity - quantity 
      });

      // 4. Ajouter une notification
      addNotification(
        'damage_report',
        'Produits endommagés déclarés',
        `${quantity} ${item.unit} de ${item.name} - Perte: ${formatCurrency(lossValue)}`,
        'medium',
        true,
        selectedItem,
        48
      );

      // 5. Déclencher les événements
      window.dispatchEvent(new CustomEvent('inventoryChanged'));
      window.dispatchEvent(new CustomEvent('damageReported', { detail: damageReport }));

      toast({
        title: "✅ Rapport enregistré",
        description: `${quantity} ${item.unit} de ${item.name} déclaré(s) endommagé(s)`,
      });

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'enregistrer le rapport",
        variant: "destructive",
      });
    }
  };

  const selectedItemData = inventory.find(item => item.id === selectedItem);
  const estimatedLoss = selectedItemData ? quantity * (selectedItemData.purchasePrice || 0) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" variant="destructive">
          <AlertTriangle size={16} />
          <span className="hidden sm:inline font-medium">Déclarer Dégâts</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <div>
              <span>Déclaration de Produits Endommagés</span>
              <DialogDescription className="mt-1">
                Déclarez les boissons endommagées pour ajuster automatiquement le stock
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Article endommagé */}
          <div className="space-y-2">
            <Label htmlFor="item-select" className="text-base font-medium">
              Article endommagé *
            </Label>
            <CommonItemSelector
              inventory={inventory}
              selectedItem={selectedItem}
              onItemChange={setSelectedItem}
              placeholder="Choisir un article..."
            />
          </div>

          {/* Quantité endommagée */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base font-medium">
              Quantité endommagée *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedItemData?.quantity || 1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Entrer la quantité..."
            />
          </div>

          {/* Raison du dégât */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-base font-medium">
              Raison du dégât *
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une raison..." />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description optionnelle */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Description (optionnel)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter des détails sur l'incident..."
              rows={3}
            />
          </div>

          {/* Rapporté par */}
          <div className="space-y-2">
            <Label htmlFor="reported-by" className="text-base font-medium">
              Rapporté par *
            </Label>
            <Select value={reportedBy} onValueChange={setReportedBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le rapporteur..." />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Récapitulatif */}
          {selectedItemData && quantity > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-medium mb-2">Récapitulatif</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Article:</span>
                  <span className="font-medium">{selectedItemData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantité:</span>
                  <span className="font-medium">{quantity} {selectedItemData.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stock disponible:</span>
                  <span className="font-medium">{selectedItemData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valeur de la perte:</span>
                  <span className="font-medium text-destructive">
                    {formatCurrency(estimatedLoss)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="gap-2"
            >
              <X size={16} />
              Annuler
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!selectedItem || !reason || !reportedBy}
              className="gap-2"
            >
              <Save size={16} />
              Enregistrer le Rapport
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DamageReportDialog;