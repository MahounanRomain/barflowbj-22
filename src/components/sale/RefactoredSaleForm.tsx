import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ShoppingCart, X, Check } from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { useToast } from '@/hooks/use-toast';
import { StaffTableSelector } from '@/components/sale/StaffTableSelector';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SaleItem {
  id: string;
  inventoryId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
  availableStock: number;
}

interface RefactoredSaleFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  title: string;
  multiple?: boolean;
}

export const RefactoredSaleForm: React.FC<RefactoredSaleFormProps> = ({
  onSubmit,
  onCancel,
  title,
  multiple = false
}) => {
  const { getInventory, getStaff, getTables, addSale, updateInventoryItem } = useLocalData();
  const { toast } = useToast();

  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const inventory = getInventory();
  const staff = getStaff().filter(member => member.isActive);
  const tables = getTables().filter(table => table.isActive);

  // Auto-select staff if only one active
  useEffect(() => {
    if (staff.length === 1) {
      setSelectedStaff(staff[0].id);
    }
  }, [staff]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const hasStock = item.quantity > 0;
    return matchesSearch && matchesCategory && hasStock;
  });

  const addItemToSale = (inventoryItem: any) => {
    const existingItem = saleItems.find(item => item.inventoryId === inventoryItem.id);
    
    if (existingItem) {
      if (existingItem.quantity >= inventoryItem.quantity) {
        toast({
          title: "Stock insuffisant",
          description: `Stock disponible: ${inventoryItem.quantity}`,
          variant: "destructive"
        });
        return;
      }
      
      setSaleItems(prev => prev.map(item =>
        item.inventoryId === inventoryItem.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        id: Date.now().toString(),
        inventoryId: inventoryItem.id,
        name: inventoryItem.name,
        quantity: 1,
        unitPrice: inventoryItem.salePrice,
        total: inventoryItem.salePrice,
        category: inventoryItem.category,
        availableStock: inventoryItem.quantity
      };
      setSaleItems(prev => [...prev, newItem]);
    }
    setSearchTerm(''); // Clear search after adding
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromSale(itemId);
      return;
    }

    setSaleItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const clampedQuantity = Math.min(newQuantity, item.availableStock);
        return {
          ...item,
          quantity: clampedQuantity,
          total: clampedQuantity * item.unitPrice
        };
      }
      return item;
    }));
  };

  const removeItemFromSale = (itemId: string) => {
    setSaleItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return saleItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async () => {
    if (saleItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un article",
        variant: "destructive"
      });
      return;
    }

    if (!selectedStaff) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un membre du personnel",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const item of saleItems) {
        // Add sale record
        await addSale({
          date: saleDate,
          item: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          sellerId: selectedStaff,
          sellerName: staff.find(s => s.id === selectedStaff)?.name || ''
        });

        // Update inventory
        const inventoryItem = inventory.find(inv => inv.id === item.inventoryId);
        if (inventoryItem) {
          await updateInventoryItem(item.inventoryId, {
            ...inventoryItem,
            quantity: inventoryItem.quantity - item.quantity,
            updatedAt: new Date().toISOString()
          });
        }
      }

      // Note: Table status update would be handled separately

      toast({
        title: "Succès",
        description: `${multiple ? 'Ventes' : 'Vente'} enregistrée${multiple ? 's' : ''} avec succès`,
        variant: "default"
      });

      // Reset form
      setSaleItems([]);
      setSelectedStaff(staff.length === 1 ? staff[0].id : '');
      setSelectedTable('');
      setSearchTerm('');
      
      onSubmit();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' XOF';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {formatCurrency(getTotalAmount())}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Item Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Sélection d'articles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and filters */}
            <div className="space-y-3">
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'Tous' : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Items list */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredInventory.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => addItemToSale(item)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.category}</span>
                        <span>Stock: {item.quantity}</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(item.salePrice)}
                        </span>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                ))}
                
                {filteredInventory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun article trouvé
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Sale Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Résumé de la vente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sale Details */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="saleDate">Date de vente</Label>
                <Input
                  id="saleDate"
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </div>

              <StaffTableSelector
                staff={staff}
                tables={tables}
                selectedStaff={selectedStaff}
                selectedTable={selectedTable}
                onStaffChange={setSelectedStaff}
                onTableChange={setSelectedTable}
              />
            </div>

            <Separator />

            {/* Selected Items */}
            <div>
              <Label className="text-base font-semibold">Articles sélectionnés</Label>
              <ScrollArea className="h-[250px] mt-2">
                <div className="space-y-2">
                  {saleItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="flex-1">
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItemFromSale(item.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {saleItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun article sélectionné
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Total and Actions */}
            <div className="space-y-4">
              <div className="text-right">
                <p className="text-lg font-bold">
                  Total: {formatCurrency(getTotalAmount())}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Valider
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};