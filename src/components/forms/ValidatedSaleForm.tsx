import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addSaleSchema, type AddSaleData, saleItemSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';

interface ValidatedSaleFormProps {
  inventory: Array<{ id: string; name: string; price: number; quantity: number }>;
  onSubmit: (data: AddSaleData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ValidatedSaleForm: React.FC<ValidatedSaleFormProps> = ({
  inventory,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [selectedItems, setSelectedItems] = useState<Array<{
    inventoryId: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>>([]);

  const form = useForm<AddSaleData>({
    resolver: zodResolver(addSaleSchema),
    defaultValues: {
      items: [],
      total: 0,
      paymentMethod: 'cash',
    },
  });

  const addItem = useCallback((inventoryId: string) => {
    const inventoryItem = inventory.find(item => item.id === inventoryId);
    if (!inventoryItem) return;

    const existingItem = selectedItems.find(item => item.inventoryId === inventoryId);
    if (existingItem) {
      // Increase quantity
      setSelectedItems(items => items.map(item => 
        item.inventoryId === inventoryId 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      // Add new item
      const newItem = {
        inventoryId,
        name: inventoryItem.name,
        quantity: 1,
        price: inventoryItem.price,
        total: inventoryItem.price,
      };
      setSelectedItems(items => [...items, newItem]);
    }
  }, [inventory, selectedItems]);

  const removeItem = useCallback((inventoryId: string) => {
    setSelectedItems(items => items.filter(item => item.inventoryId !== inventoryId));
  }, []);

  const updateQuantity = useCallback((inventoryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(inventoryId);
      return;
    }

    setSelectedItems(items => items.map(item => 
      item.inventoryId === inventoryId 
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ));
  }, [removeItem]);

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      form.setError('items', { message: 'Au moins un article est requis' });
      return;
    }

    const saleData: AddSaleData = {
      items: selectedItems,
      total: totalAmount,
      tableNumber: form.getValues('tableNumber'),
      staffMember: form.getValues('staffMember'),
      paymentMethod: form.getValues('paymentMethod'),
    };

    onSubmit(saleData);
    setSelectedItems([]);
    form.reset();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Nouvelle vente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Item Selection */}
        <div>
          <label className="text-sm font-medium">Ajouter des articles</label>
          <Select onValueChange={addItem}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un article" />
            </SelectTrigger>
            <SelectContent>
              {inventory.filter(item => item.quantity > 0).map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} - {item.price}€ (Stock: {item.quantity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Articles sélectionnés</label>
            <div className="space-y-2">
              {selectedItems.map(item => (
                <div key={item.inventoryId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {item.price}€ x {item.quantity} = {item.total.toFixed(2)}€
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.inventoryId, parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item.inventoryId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-right font-bold text-lg">
              Total: {totalAmount.toFixed(2)}€
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tableNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de table (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Ex: 5"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staffMember"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personnel (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du serveur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Méthode de paiement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="card">Carte</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || selectedItems.length === 0}
              >
                {isLoading ? 'Enregistrement...' : `Valider la vente (${totalAmount.toFixed(2)}€)`}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};