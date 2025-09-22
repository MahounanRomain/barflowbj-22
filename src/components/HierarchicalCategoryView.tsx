import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { Category, InventoryItem } from '@/lib/storage';

const HierarchicalCategoryView = () => {
  const { getCategories, getInventory } = useLocalData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadData = () => {
      setCategories(getCategories());
      setInventory(getInventory());
    };

    loadData();

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('categoriesChanged', handleDataChange);
    window.addEventListener('inventoryChanged', handleDataChange);

    return () => {
      window.removeEventListener('categoriesChanged', handleDataChange);
      window.removeEventListener('inventoryChanged', handleDataChange);
    };
  }, [getCategories, getInventory]);

  const hierarchicalData = useMemo(() => {
    const parentCategories = categories.filter(cat => cat.isParent);
    
    return parentCategories.map(parent => {
      const childCategories = categories.filter(cat => cat.parentId === parent.id);
      const directItems = inventory.filter(item => item.category === parent.name);
      
      // Calculate items in child categories
      const childItems = childCategories.reduce((acc, child) => {
        const childInventory = inventory.filter(item => item.category === child.name);
        return [...acc, ...childInventory];
      }, []);

      const allItems = [...directItems, ...childItems];
      const totalValue = allItems.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      
      return {
        ...parent,
        children: childCategories,
        directItems,
        childItems,
        allItems,
        totalValue,
        totalQuantity: allItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    });
  }, [categories, inventory]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Catégories Principales</h2>
      </div>

      {hierarchicalData.map(parent => {
        const isExpanded = expandedCategories.includes(parent.id);
        
        return (
          <Card key={parent.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleCategory(parent.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: parent.color }}
                  />
                  <CardTitle className="text-lg">{parent.name}</CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-sm">
                    {parent.totalQuantity} articles
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Valeur totale</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {parent.totalValue.toLocaleString('fr-SN', { 
                        style: 'currency', 
                        currency: 'XOF', 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 0 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 space-y-3">
                {parent.children.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Sous-catégories ({parent.children.length})
                    </div>
                    {parent.children.map(child => {
                      const childInventory = inventory.filter(item => item.category === child.name);
                      const childValue = childInventory.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
                      
                      return (
                        <Card key={child.id} className="bg-muted/20">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: child.color }}
                                />
                                <span className="font-medium">{child.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {childInventory.length} articles
                                </Badge>
                              </div>
                              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                {childValue.toLocaleString('fr-SN', { 
                                  style: 'currency', 
                                  currency: 'XOF', 
                                  minimumFractionDigits: 0, 
                                  maximumFractionDigits: 0 
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Aucune sous-catégorie définie
                  </div>
                )}

                {parent.directItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Articles directs ({parent.directItems.length})
                    </div>
                    <div className="grid gap-2">
                      {parent.directItems.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.quantity} {item.unit}
                          </Badge>
                        </div>
                      ))}
                      {parent.directItems.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{parent.directItems.length - 3} autres articles
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}

      {hierarchicalData.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Package size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">Aucune catégorie principale</p>
            <p className="text-xs text-muted-foreground">
              Les catégories Sobebra et Cave à vin seront créées automatiquement
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HierarchicalCategoryView;