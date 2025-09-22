
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface SaleItem {
  id: string;
  inventoryId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SaleItemManagerProps {
  inventory: any[];
  saleItems: SaleItem[];
  newItem: string;
  newQuantity: number;
  onNewItemChange: (itemId: string) => void;
  onNewQuantityChange: (quantity: number) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
}

export const SaleItemManager: React.FC<SaleItemManagerProps> = ({
  inventory,
  saleItems,
  newItem,
  newQuantity,
  onNewItemChange,
  onNewQuantityChange,
  onAddItem,
  onRemoveItem,
}) => {
  const getTotalAmount = () => {
    return saleItems.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div className="space-y-4">
      {/* Ajouter un article */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Ajouter un article</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Article</Label>
            <Select value={newItem} onValueChange={onNewItemChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {inventory.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.quantity} {item.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantité</Label>
            <NumericInput
              value={newQuantity}
              onChange={(value) => onNewQuantityChange(Math.max(1, value))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={onAddItem} disabled={!newItem} className="w-full">
              <Plus size={16} className="mr-1" />
              Ajouter
            </Button>
          </div>
        </div>
      </Card>

      {/* Liste des articles ajoutés */}
      {saleItems.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Articles à vendre ({saleItems.length})</h4>
          <div className="space-y-2">
            {saleItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity} × {item.unitPrice} FCFA
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.total} FCFA</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between items-center font-medium">
              <span>Total:</span>
              <span>{getTotalAmount()} FCFA</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
