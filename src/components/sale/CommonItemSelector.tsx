import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CommonItemSelectorProps {
  inventory: any[];
  selectedItem: string;
  onItemChange: (itemId: string) => void;
  placeholder?: string;
}

export const CommonItemSelector: React.FC<CommonItemSelectorProps> = ({
  inventory,
  selectedItem,
  onItemChange,
  placeholder = "Choisir un article..."
}) => {
  return (
    <Select value={selectedItem} onValueChange={onItemChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {inventory.length === 0 ? (
          <SelectItem value="none" disabled>
            Aucun article disponible
          </SelectItem>
        ) : (
          inventory.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              <div className="flex items-center justify-between w-full">
                <span>{item.name}</span>
                <Badge variant="outline" className="ml-2">
                  {item.quantity} {item.unit}
                </Badge>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};