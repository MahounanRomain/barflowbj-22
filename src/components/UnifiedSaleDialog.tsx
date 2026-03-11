import { useState, useEffect } from "react";
import { Plus, ShoppingCart, X, Save, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useTableBalance } from '@/hooks/useTableBalance';
import { useToast } from "@/hooks/use-toast";
import { sendSystemMessage } from '@/hooks/useNotifications';
import { getTodayDateString } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/utils";
import { CommonItemSelector } from "./sale/CommonItemSelector";
import { StaffTableSelector } from "./sale/StaffTableSelector";

interface CartItem {
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
  const { setTableStatus } = useTableBalance();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  // Common state
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [saleDate, setSaleDate] = useState(getTodayDateString());

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      const inventoryData = getInventory();
      const staffData = getStaff().filter((member: any) => member.isActive);
      const tablesData = getTables().filter((table: any) => table.isActive);
      
      setInventory(inventoryData);
      setStaff(staffData);
      setTables(tablesData);

      if (staffData.length === 1) setSelectedStaff(staffData[0].id);
      if (tablesData.length === 1) setSelectedTable(tablesData[0].id);
      else if (tablesData.length === 0) setSelectedTable("none");
    }
  }, [open, getInventory, getStaff, getTables]);

  const resetForm = () => {
    setSelectedItem("");
    setQuantity(1);
    setCartItems([]);
    setSelectedStaff("");
    setSelectedTable("");
    setSaleDate(getTodayDateString());
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    const inventoryItem = inventory.find((item: any) => item.id === selectedItem);
    if (!inventoryItem) return;

    const existingIndex = cartItems.findIndex(item => item.inventoryId === selectedItem);
    const existingQty = existingIndex >= 0 ? cartItems[existingIndex].quantity : 0;
    const totalQty = existingQty + quantity;

    if (totalQty > inventoryItem.quantity) {
      toast({
        title: "Stock insuffisant",
        description: `Quantité demandée (${totalQty}) dépasse le stock (${inventoryItem.quantity})`,
        variant: "destructive",
      });
      return;
    }

    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity = totalQty;
      updated[existingIndex].total = totalQty * inventoryItem.salePrice;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, {
        id: Date.now().toString(),
        inventoryId: inventoryItem.id,
        name: inventoryItem.name,
        quantity,
        unitPrice: inventoryItem.salePrice,
        total: quantity * inventoryItem.salePrice,
        category: inventoryItem.category || "Autre"
      }]);
    }

    setSelectedItem("");
    setQuantity(1);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, newQty: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;
    
    const inventoryItem = inventory.find((inv: any) => inv.id === item.inventoryId);
    if (!inventoryItem || newQty > inventoryItem.quantity || newQty < 1) return;

    setCartItems(cartItems.map(i => 
      i.id === itemId 
        ? { ...i, quantity: newQty, total: newQty * i.unitPrice }
        : i
    ));
  };

  const getCartTotal = () => cartItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({ title: "Panier vide", description: "Sélectionnez au moins un article avant de valider.", variant: "destructive" });
      return;
    }

    if (!selectedStaff) {
      toast({ title: "Vendeur manquant", description: "Indiquez qui réalise cette vente.", variant: "destructive" });
      return;
    }

    const staffMember = staff.find((s: any) => s.id === selectedStaff);
    const table = tables.find((t: any) => t.id === selectedTable);

    cartItems.forEach(item => {
      const inventoryItem = inventory.find((inv: any) => inv.id === item.inventoryId);
      if (inventoryItem) {
        addSale({
          item: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          sellerId: selectedStaff,
          sellerName: staffMember?.name || "Inconnu",
          tableId: selectedTable && selectedTable !== "none" ? selectedTable : undefined,
          tableName: table?.name || undefined,
          date: saleDate,
        });
        updateInventoryItem(item.inventoryId, {
          quantity: inventoryItem.quantity - item.quantity
        });
      }
    });

    if (table && table.status !== 'occupied' && selectedTable !== "none") {
      setTableStatus(selectedTable, 'occupied');
    }

    const totalAmount = getCartTotal();
    
    toast({
      title: "✅ Vente enregistrée",
      description: `${cartItems.length} article(s) — ${formatCurrency(totalAmount)}`,
    });

    sendSystemMessage(
      'sales',
      'Vente enregistrée',
      `${cartItems.length} article(s) vendu(s) pour ${formatCurrency(totalAmount)} par ${staffMember?.name || 'Inconnu'}`,
      'low'
    );

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 hover-lift">
          <Plus size={16} />
          <span className="hidden sm:inline font-medium">Nouvelle vente</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingCart size={20} className="text-primary" />
            </div>
            <div>
              <span>Point de vente</span>
              <DialogDescription className="mt-1">
                Ajoutez un ou plusieurs articles au panier, puis validez la vente
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="sale-date">Date</Label>
            <Input
              id="sale-date"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              max={getTodayDateString()}
            />
          </div>

          {/* Add item to cart */}
          <Card className="p-4 space-y-3 border-dashed">
            <Label className="font-medium">Ajouter un article</Label>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] gap-3 items-end">
              <div className="space-y-1.5">
                <CommonItemSelector
                  inventory={inventory}
                  selectedItem={selectedItem}
                  onItemChange={setSelectedItem}
                  placeholder="Sélectionner un article..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qty" className="text-xs text-muted-foreground">Qté</Label>
                <Input
                  id="qty"
                  type="number"
                  min="1"
                  max={inventory.find((item: any) => item.id === selectedItem)?.quantity || 999}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <Button 
                type="button"
                onClick={handleAddToCart} 
                disabled={!selectedItem}
                size="sm"
                className="gap-1"
              >
                <Plus size={14} />
                Ajouter
              </Button>
            </div>
          </Card>

          {/* Cart */}
          {cartItems.length > 0 && (
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-primary" />
                  <span className="font-medium">Panier</span>
                  <Badge variant="secondary" className="text-xs">{cartItems.length}</Badge>
                </div>
                <span className="font-bold text-primary text-lg">
                  {formatCurrency(getCartTotal())}
                </span>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.unitPrice)} / unité
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >−</Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >+</Button>
                      </div>
                      <span className="font-medium text-sm w-20 text-right">
                        {formatCurrency(item.total)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Staff & Table selector */}
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
              onClick={() => { resetForm(); setOpen(false); }}
              className="gap-2"
            >
              <X size={16} />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!selectedStaff || cartItems.length === 0}
              className="gap-2"
            >
              <Save size={16} />
              Valider ({formatCurrency(getCartTotal())})
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedSaleDialog;
