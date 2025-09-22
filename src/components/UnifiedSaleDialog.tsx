import { useState, useEffect } from "react";
import { Plus, Package, ShoppingCart, X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalData } from "@/hooks/useLocalData";
import { useNotifications } from '@/hooks/useNotifications';
import { useTableBalance } from '@/hooks/useTableBalance';
import { useToast } from "@/hooks/use-toast";
import { getTodayDateString } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/utils";
import { CommonItemSelector } from "./sale/CommonItemSelector";
import { StaffTableSelector } from "./sale/StaffTableSelector";

interface SaleItem {
  id: string;
  inventoryId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

const UnifiedSaleDialog = () => {
  const { getInventory, updateInventoryItem, addSale, getStaff, getTables } = useLocalData();
  const { addNotification } = useNotifications();
  const { setTableStatus } = useTableBalance();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [saleMode, setSaleMode] = useState<"single" | "multiple">("single");
  const [inventory, setInventory] = useState([]);
  const [staff, setStaff] = useState([]);
  const [tables, setTables] = useState([]);

  // États communs
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [saleDate, setSaleDate] = useState(getTodayDateString());

  // États pour vente simple
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);

  // États pour ventes multiples
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      const inventoryData = getInventory();
      const staffData = getStaff().filter(member => member.isActive);
      const tablesData = getTables().filter(table => table.isActive);
      
      setInventory(inventoryData);
      setStaff(staffData);
      setTables(tablesData);

      // Auto-sélection
      if (staffData.length === 1) {
        setSelectedStaff(staffData[0].id);
      }
      if (tablesData.length === 1) {
        setSelectedTable(tablesData[0].id);
      } else if (tablesData.length === 0) {
        setSelectedTable("none");
      }
    }
  }, [open, getInventory, getStaff, getTables]);

  const resetForm = () => {
    setSelectedItem("");
    setQuantity(1);
    setNewItem("");
    setNewQuantity(1);
    setSaleItems([]);
    setSelectedStaff("");
    setSelectedTable("");
    setSaleDate(getTodayDateString());
  };

  const handleAddItemToMultiple = () => {
    if (!newItem) return;

    const inventoryItem = inventory.find(item => item.id === newItem);
    if (!inventoryItem) return;

    // Vérifier le stock
    const existingItemIndex = saleItems.findIndex(item => item.inventoryId === newItem);
    const existingQuantity = existingItemIndex >= 0 ? saleItems[existingItemIndex].quantity : 0;
    const totalQuantity = existingQuantity + newQuantity;

    if (totalQuantity > inventoryItem.quantity) {
      toast({
        title: "Stock insuffisant",
        description: `Quantité totale demandée (${totalQuantity}) dépasse le stock disponible (${inventoryItem.quantity})`,
        variant: "destructive",
      });
      return;
    }

    if (existingItemIndex >= 0) {
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].quantity = totalQuantity;
      updatedItems[existingItemIndex].total = totalQuantity * inventoryItem.salePrice;
      setSaleItems(updatedItems);
    } else {
      const newSaleItem: SaleItem = {
        id: Date.now().toString(),
        inventoryId: inventoryItem.id,
        name: inventoryItem.name,
        quantity: newQuantity,
        unitPrice: inventoryItem.salePrice,
        total: newQuantity * inventoryItem.salePrice,
        category: inventoryItem.category || "Autre"
      };
      setSaleItems([...saleItems, newSaleItem]);
    }

    setNewItem("");
    setNewQuantity(1);
  };

  const removeItemFromSale = (itemId: string) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return saleItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleMode === "single") {
      handleSingleSale();
    } else {
      handleMultipleSales();
    }
  };

  const handleSingleSale = () => {
    if (!selectedItem || !selectedStaff) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un article et un vendeur",
        variant: "destructive",
      });
      return;
    }

    const item = inventory.find(inv => inv.id === selectedItem);
    if (!item || item.quantity < quantity) {
      toast({
        title: "Stock insuffisant",
        description: `Il ne reste que ${item?.quantity || 0} ${item?.unit || 'unités'} en stock`,
        variant: "destructive",
      });
      return;
    }

    const staffMember = staff.find(s => s.id === selectedStaff);
    const table = selectedTable && selectedTable !== "none" ? tables.find(t => t.id === selectedTable) : null;

    const saleData = {
      item: item.name,
      quantity,
      unitPrice: item.salePrice,
      total: quantity * item.salePrice,
      sellerId: selectedStaff,
      sellerName: staffMember?.name || "Inconnu",
      tableId: selectedTable && selectedTable !== "none" ? selectedTable : undefined,
      tableName: table?.name || undefined,
      date: saleDate,
    };

    addSale(saleData);
    updateInventoryItem(selectedItem, { quantity: item.quantity - quantity });
    handlePostSaleActions(saleData, table);

    toast({
      title: "✨ Vente enregistrée",
      description: `${quantity} ${item.unit} de ${item.name} vendu(s)`,
    });

    resetForm();
    setOpen(false);
  };

  const handleMultipleSales = () => {
    if (saleItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un article",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStaff) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un vendeur",
        variant: "destructive",
      });
      return;
    }

    const staffMember = staff.find(s => s.id === selectedStaff);
    const table = tables.find(t => t.id === selectedTable);

    saleItems.forEach(item => {
      const inventoryItem = inventory.find(inv => inv.id === item.inventoryId);
      if (inventoryItem) {
        const saleData = {
          item: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          sellerId: selectedStaff,
          sellerName: staffMember?.name || "Inconnu",
          tableId: selectedTable && selectedTable !== "none" ? selectedTable : undefined,
          tableName: table?.name || undefined,
          date: saleDate,
        };

        addSale(saleData);
        updateInventoryItem(item.inventoryId, {
          quantity: inventoryItem.quantity - item.quantity
        });
      }
    });

    if (table && table.status !== 'occupied' && selectedTable !== "none") {
      setTableStatus(selectedTable, 'occupied');
    }

    toast({
      title: "✨ Ventes enregistrées",
      description: `${saleItems.length} vente(s) pour un total de ${formatCurrency(getTotalAmount())}`,
    });

    resetForm();
    setOpen(false);
  };

  const handlePostSaleActions = (saleData: any, table: any) => {
    // Occuper la table
    if (table && table.status !== 'occupied') {
      setTableStatus(selectedTable, 'occupied');
      addNotification(
        'table_update',
        'Table occupée',
        `${table.name} automatiquement occupée`,
        'low',
        false,
        table.id,
        12
      );
    }

    // Notification vente importante
    if (saleData.total > 10000) {
      addNotification(
        'high_sales',
        'Vente importante',
        `Vente de ${formatCurrency(saleData.total)} - ${saleData.item}`,
        'medium',
        false,
        undefined,
        24
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 hover-lift">
          <Plus size={16} />
          <span className="hidden sm:inline font-medium">Nouvelle Vente</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <ShoppingCart size={20} className="text-primary" />
            </div>
            <div>
              <span>Point de Vente</span>
              <DialogDescription className="mt-1">
                Enregistrez vos ventes rapidement et efficacement
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={saleMode} onValueChange={(value) => setSaleMode(value as "single" | "multiple")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <ShoppingCart size={16} />
              Vente Simple
            </TabsTrigger>
            <TabsTrigger value="multiple" className="gap-2">
              <Package size={16} />
              Panier Multiple
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date commune */}
            <div className="space-y-2">
              <Label htmlFor="sale-date" className="text-base font-medium">
                Date de la vente
              </Label>
              <Input
                id="sale-date"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                max={getTodayDateString()}
              />
            </div>

            <TabsContent value="single" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Article à vendre *
                  </Label>
                  <CommonItemSelector
                    inventory={inventory}
                    selectedItem={selectedItem}
                    onItemChange={setSelectedItem}
                    placeholder="Sélectionner un article..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-base font-medium">
                    Quantité *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={inventory.find(item => item.id === selectedItem)?.quantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="Entrer la quantité..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="multiple" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Article
                    </Label>
                    <CommonItemSelector
                      inventory={inventory}
                      selectedItem={newItem}
                      onItemChange={setNewItem}
                      placeholder="Sélectionner un article..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-quantity" className="text-base font-medium">
                      Quantité
                    </Label>
                    <Input
                      id="new-quantity"
                      type="number"
                      min="1"
                      max={inventory.find(item => item.id === newItem)?.quantity || 1}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Number(e.target.value))}
                      placeholder="Entrer la quantité..."
                    />
                  </div>
                  
                  <Button 
                    type="button"
                    onClick={handleAddItemToMultiple} 
                    disabled={!newItem}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter au panier
                  </Button>
                </div>

                {/* Panier */}
                {saleItems.length > 0 && (
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-primary" />
                        <span className="font-medium">Panier de vente</span>
                        <Badge variant="secondary">{saleItems.length}</Badge>
                      </div>
                      <span className="font-bold text-primary">
                        {formatCurrency(getTotalAmount())}
                      </span>
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {saleItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {formatCurrency(item.total)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemFromSale(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Sélecteur de vendeur et table */}
            <StaffTableSelector
              staff={staff}
              tables={tables}
              selectedStaff={selectedStaff}
              selectedTable={selectedTable}
              onStaffChange={setSelectedStaff}
              onTableChange={setSelectedTable}
            />

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
                disabled={
                  !selectedStaff ||
                  (saleMode === "single" ? !selectedItem : saleItems.length === 0)
                }
                className="gap-2"
              >
                <Save size={16} />
                {saleMode === "single" ? "Enregistrer la Vente" : `Valider (${formatCurrency(getTotalAmount())})`}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedSaleDialog;