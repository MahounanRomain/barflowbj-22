import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { useProfitabilityAnalysis } from '@/hooks/useProfitabilityAnalysis';

const ProfitabilityAnalysis = () => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  const { products, categories } = useProfitabilityAnalysis(dateRange ? {
    type: 'custom',
    startDate: dateRange.start,
    endDate: dateRange.end
  } : undefined);
  
  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const getMarginColor = (margin: number) => {
    if (margin >= 50) return 'text-green-600';
    if (margin >= 30) return 'text-blue-600';
    if (margin >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        Analyse de Rentabilité
      </h3>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Par Produit</TabsTrigger>
          <TabsTrigger value="categories">Par Catégorie</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de vente disponible</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 10).map((product, index) => (
                <div key={product.itemName} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-medium">#{index + 1}</span>
                      <h4 className="font-medium">{product.itemName}</h4>
                      <span className="text-sm text-muted-foreground">({product.category})</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.totalQuantity} vendus • Prix moy: {formatXOF(product.averageSellingPrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatXOF(product.totalProfit)}</div>
                    <div className={`text-sm font-medium ${getMarginColor(product.profitMargin)}`}>
                      {product.profitMargin.toFixed(1)}% marge
                    </div>
                    <div className="text-xs text-muted-foreground">
                      CA: {formatXOF(product.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée de catégorie disponible</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-medium">#{index + 1}</span>
                      <h4 className="font-medium">{category.category}</h4>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.itemCount} articles dans cette catégorie
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatXOF(category.totalProfit)}</div>
                    <div className={`text-sm font-medium ${getMarginColor(category.profitMargin)}`}>
                      {category.profitMargin.toFixed(1)}% marge
                    </div>
                    <div className="text-xs text-muted-foreground">
                      CA: {formatXOF(category.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ProfitabilityAnalysis;