import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Package, Zap, Star, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EnhancedSaleItemSelectorProps {
  inventory: any[];
  selectedItem: string;
  quantity: number;
  onItemChange: (itemId: string) => void;
  onQuantityChange: (quantity: number) => void;
}

export const EnhancedSaleItemSelector: React.FC<EnhancedSaleItemSelectorProps> = ({
  inventory,
  selectedItem,
  quantity,
  onItemChange,
  onQuantityChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const selectedInventoryItem = inventory.find(item => item.id === selectedItem);

  // Obtenir les catégories uniques
  const categories = useMemo(() => {
    const cats = Array.from(new Set(inventory.map(item => item.category))).sort();
    return [{ value: "all", label: "Toutes catégories" }, ...cats.map(cat => ({ value: cat, label: cat }))];
  }, [inventory]);

  // Filtrer les articles selon le terme de recherche et la catégorie
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.barcode && item.barcode.includes(searchTerm));
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory && item.quantity > 0; // Seulement les articles en stock
    }).sort((a, b) => {
      // Trier par popularité (nombre de ventes) puis par nom
      const aPopularity = a.totalSold || 0;
      const bPopularity = b.totalSold || 0;
      if (aPopularity !== bPopularity) return bPopularity - aPopularity;
      return a.name.localeCompare(b.name);
    });
  }, [inventory, searchTerm, selectedCategory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatus = (item: any) => {
    const stockPercentage = (item.quantity / (item.threshold * 2)) * 100;
    if (stockPercentage <= 25) return { color: "destructive", label: "Stock critique" };
    if (stockPercentage <= 50) return { color: "warning", label: "Stock faible" };
    return { color: "success", label: "Stock suffisant" };
  };

  const quickQuantities = [1, 2, 5, 10];

  return (
    <div className="space-y-4">
      {/* Header avec icône */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <ShoppingCart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <Label className="text-base font-semibold">Sélection d'Article</Label>
          <p className="text-sm text-muted-foreground">Choisissez l'article à vendre</p>
        </div>
      </div>

      {/* Filtres de recherche et catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Rechercher par nom, catégorie ou code-barres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sélecteur d'article principal */}
      <Card className="p-1">
        <Select value={selectedItem} onValueChange={onItemChange}>
          <SelectTrigger className="min-h-[60px] border-0 shadow-none">
            <SelectValue placeholder="Sélectionner un article" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {filteredInventory.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Package size={32} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">Aucun article trouvé</p>
                <p className="text-sm">Essayez un autre terme de recherche</p>
              </div>
            ) : (
              filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                const isPopular = (item.totalSold || 0) > 10;
                
                return (
                  <SelectItem key={item.id} value={item.id} className="p-3 h-auto">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.name}</span>
                          {isPopular && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Stock: {item.quantity} {item.unit}</span>
                          <Badge variant={stockStatus.color === "success" ? "default" : stockStatus.color === "warning" ? "secondary" : "destructive"} className="text-xs">
                            {stockStatus.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-semibold text-primary">
                            {formatCurrency(item.salePrice)}
                          </span>
                          {item.totalSold && (
                            <span className="text-xs text-muted-foreground">
                              • {item.totalSold} vendus
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
      </Card>

      {/* Section quantité - améliorée */}
      {selectedInventoryItem && (
        <Card className="p-4 bg-gradient-to-r from-card to-accent/5 border-primary/20">
          <div className="space-y-4">
            {/* Info produit sélectionné */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedInventoryItem.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedInventoryItem.category} • Stock: {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="font-semibold">
                {formatCurrency(selectedInventoryItem.salePrice)}/unité
              </Badge>
            </div>

            {/* Sélection rapide de quantité */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Quantité rapide</Label>
              <div className="flex gap-2 mb-3">
                {quickQuantities.filter(q => q <= selectedInventoryItem.quantity).map((q) => (
                  <Button
                    key={q}
                    variant={quantity === q ? "default" : "outline"}
                    size="sm"
                    onClick={() => onQuantityChange(q)}
                    className="flex-1"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input quantité personnalisée */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="quantity" className="text-sm font-medium">Quantité personnalisée</Label>
                <span className="text-xs text-muted-foreground">Max: {selectedInventoryItem.quantity}</span>
              </div>
              
              <NumericInput
                id="quantity"
                value={quantity}
                onChange={(value) => onQuantityChange(Math.max(1, Math.min(value, selectedInventoryItem.quantity)))}
                className="text-center font-medium h-12 text-lg"
                min={1}
                max={selectedInventoryItem.quantity}
              />
            </div>

            {/* Récapitulatif total */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Prix unitaire</p>
                <p className="font-semibold">{formatCurrency(selectedInventoryItem.salePrice)}</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="font-bold text-primary text-lg">
                  {formatCurrency(quantity * selectedInventoryItem.salePrice)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};