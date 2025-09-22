
import React, { useState } from "react";
import { Package, Edit, Trash2, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EditInventoryDialog from "@/components/inventory/EditInventoryDialog";
import DeleteInventoryDialog from "@/components/inventory/DeleteInventoryDialog";
import RestockDialog from "@/components/inventory/RestockDialog";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface InventoryItemProps {
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
  categories?: Category[];
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  id,
  name,
  category,
  quantity,
  unit,
  threshold,
  purchasePrice = 0,
  salePrice = 0,
  containerType,
  minQuantity,
  categories = [],
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestockDialog, setShowRestockDialog] = useState(false);

  const isLowStock = quantity <= threshold;
  const isOutOfStock = quantity === 0;

  // Find category data for styling
  const categoryData = categories.find(cat => cat.name === category);

  const getStockStatus = () => {
    if (isOutOfStock) {
      return { label: "Épuisé", variant: "destructive" as const, color: "text-red-600" };
    }
    if (isLowStock) {
      return { label: "Stock faible", variant: "secondary" as const, color: "text-orange-600" };
    }
    return { label: "En stock", variant: "default" as const, color: "text-green-600" };
  };

  const status = getStockStatus();

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${
        isOutOfStock ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' :
        isLowStock ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20' :
        'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
      }`}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Header avec icône, nom et prix total */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isOutOfStock ? 'bg-red-100 dark:bg-red-900/50' :
                isLowStock ? 'bg-orange-100 dark:bg-orange-900/50' :
                'bg-green-100 dark:bg-green-900/50'
              }`}>
                <Package className={`w-4 h-4 ${status.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg break-words">{name}</h3>
                {categoryData && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 mt-1"
                    style={{ 
                      backgroundColor: `${categoryData.color}20`, 
                      color: categoryData.color, 
                      borderColor: `${categoryData.color}40` 
                    }}
                  >
                    {categoryData.name}
                  </Badge>
                )}
              </div>
              {salePrice > 0 && (
                <div className="text-sm font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                  {(quantity * salePrice).toLocaleString('fr-SN', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              )}
            </div>

            {/* Informations du stock et prix */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Stock: </span>
                <span className={`font-semibold ${status.color}`}>
                  {quantity} {unit}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Seuil: </span>
                <span className="font-medium">{threshold} {unit}</span>
              </div>
              {purchasePrice > 0 && (
                <div>
                  <span className="text-muted-foreground">Prix d'achat: </span>
                  <span className="font-medium">{purchasePrice.toLocaleString('fr-SN', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {salePrice > 0 && (
                <div>
                  <span className="text-muted-foreground">Prix de vente: </span>
                  <span className="font-medium">{salePrice.toLocaleString('fr-SN', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>

            {/* Footer avec status et boutons d'action alignés horizontalement */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
                {isLowStock && (
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <AlertTriangle size={14} />
                    <span className="text-xs">Réapprovisionner</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRestockDialog(true)}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                  title="Réapprovisionner"
                >
                  <Plus size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="h-8 w-8 p-0"
                  title="Modifier"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditInventoryDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        item={{
          id,
          name,
          category,
          quantity,
          unit,
          threshold,
          purchasePrice,
          salePrice,
          containerType,
          minQuantity,
        }}
      />

      <DeleteInventoryDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        itemId={id}
        itemName={name}
      />

      <RestockDialog
        isOpen={showRestockDialog}
        onClose={() => setShowRestockDialog(false)}
        item={{
          id,
          name,
          quantity,
          unit,
        }}
      />
    </>
  );
};

export default InventoryItem;
