import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalData } from '@/hooks/useLocalData';
import { useToast } from '@/components/ui/use-toast';

interface EditInventoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    threshold: number;
    purchasePrice?: number;
    salePrice?: number;
    containerType?: string;
    minQuantity?: number;
    description?: string;
    barcode?: string;
    supplier?: string;
  };
}

const EditInventoryDialog: React.FC<EditInventoryDialogProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const { updateInventoryItem, getCategories } = useLocalData();
  const { toast } = useToast();
  
  const categories = getCategories();
  
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || '',
    description: item?.description || '',
    quantity: item?.quantity || 0,
    unit: item?.unit || '',
    threshold: item?.threshold || 0,
    minQuantity: item?.minQuantity || 0,
    purchasePrice: item?.purchasePrice || 0,
    salePrice: item?.salePrice || 0,
    containerType: item?.containerType || '',
    barcode: item?.barcode || '',
    supplier: item?.supplier || ''
  });

  React.useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        unit: item.unit || '',
        threshold: item.threshold || 0,
        minQuantity: item.minQuantity || 0,
        purchasePrice: item.purchasePrice || 0,
        salePrice: item.salePrice || 0,
        containerType: item.containerType || '',
        barcode: item.barcode || '',
        supplier: item.supplier || ''
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du produit est requis",
        variant: "destructive"
      });
      return;
    }

    if (formData.salePrice <= 0) {
      toast({
        title: "Erreur",
        description: "Le prix de vente doit être supérieur à 0",
        variant: "destructive"
      });
      return;
    }

    updateInventoryItem(item.id, {
      ...formData,
      quantity: Number(formData.quantity),
      threshold: Number(formData.threshold),
      minQuantity: Number(formData.minQuantity),
      purchasePrice: Number(formData.purchasePrice),
      salePrice: Number(formData.salePrice)
    });

    toast({
      title: "Succès",
      description: "Produit modifié avec succès"
    });

    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nom du produit"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(category => category.id && category.name).map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description du produit"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unité</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="ex: pièces, kg, L"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Seuil d'alerte</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                value={formData.threshold}
                onChange={(e) => handleChange('threshold', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minQuantity">Quantité minimum</Label>
              <Input
                id="minQuantity"
                type="number"
                min="0"
                value={formData.minQuantity}
                onChange={(e) => handleChange('minQuantity', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Prix d'achat</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Prix de vente *</Label>
              <Input
                id="salePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => handleChange('salePrice', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="containerType">Type de contenant</Label>
            <Input
              id="containerType"
              value={formData.containerType}
              onChange={(e) => handleChange('containerType', e.target.value)}
              placeholder="ex: Bouteille, Canette, Sac"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Code-barres</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => handleChange('barcode', e.target.value)}
              placeholder="Code-barres du produit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Fournisseur</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              placeholder="Nom du fournisseur"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Modifier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryDialog;
