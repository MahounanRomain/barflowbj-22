
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SaleItemSelectorProps {
  inventory: any[];
  selectedItem: string;
  quantity: number;
  onItemChange: (itemId: string) => void;
  onQuantityChange: (quantity: number) => void;
}

export const SaleItemSelector: React.FC<SaleItemSelectorProps> = ({
  inventory,
  selectedItem,
  quantity,
  onItemChange,
  onQuantityChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const selectedInventoryItem = inventory.find(item => item.id === selectedItem);

  // Filtrer les articles selon le terme de recherche
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  return (
    <>
      <div className="space-y-3">
        <Label htmlFor="item" className="flex items-center gap-2">
          <Package size={16} />
          Article à vendre
        </Label>
        
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedItem} onValueChange={onItemChange}>
          <SelectTrigger className="min-h-[50px]">
            <SelectValue placeholder="Sélectionner un article" />
          </SelectTrigger>
          <SelectContent className="max-h-80 overflow-y-auto">
            {filteredInventory.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Package size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun article trouvé</p>
              </div>
            ) : (
              filteredInventory.map((item) => (
                <SelectItem key={item.id} value={item.id} className="focus:bg-accent focus:text-accent-foreground py-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Stock: {item.quantity} {item.unit}</span>
                        <span className="font-medium text-primary">
                          {formatCurrency(item.salePrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedInventoryItem && (
        <div className="space-y-3 p-4 border rounded-lg bg-accent/10">
          <div className="flex items-center justify-between">
            <Label htmlFor="quantity" className="text-sm font-medium">Quantité</Label>
            <span className="text-xs text-muted-foreground">Max: {selectedInventoryItem.quantity}</span>
          </div>
          
          <NumericInput
            id="quantity"
            value={quantity}
            onChange={(value) => onQuantityChange(Math.max(1, Math.min(value, selectedInventoryItem.quantity)))}
            className="text-center font-medium"
          />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-background rounded border">
              <p className="text-muted-foreground">Prix unitaire</p>
              <p className="font-semibold">{formatCurrency(selectedInventoryItem.salePrice)}</p>
            </div>
            <div className="text-center p-2 bg-primary/10 rounded border border-primary/20">
              <p className="text-muted-foreground">Total</p>
              <p className="font-bold text-primary text-lg">
                {formatCurrency(quantity * selectedInventoryItem.salePrice)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
