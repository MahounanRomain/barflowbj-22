
import { useMemo } from 'react';
import { useLocalData } from '@/hooks/useLocalData';

interface ProductProfitability {
  itemName: string;
  category: string;
  totalSales: number;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  averageSellingPrice: number;
  profitPerUnit: number;
}

interface CategoryProfitability {
  category: string;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  itemCount: number;
}

export const useProfitabilityAnalysis = (dateFilter?: { type: string; preset?: string; startDate?: string; endDate?: string }) => {
  const { getSales, getInventory } = useLocalData();
  
  const analysis = useMemo(() => {
    const sales = getSales();
    const inventory = getInventory();
    
    // Filtrer les ventes selon le filtre de date si fourni
    let filteredSales = sales;
    if (dateFilter && dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
      });
    } else if (dateFilter && dateFilter.type === 'preset') {
      const today = new Date();
      let startDate: Date;
      
      switch (dateFilter.preset) {
        case '7d':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0); // Toutes les données
      }
      
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate;
      });
    }
    
    // Calculer la rentabilité par produit
    const productAnalysis: Record<string, ProductProfitability> = {};
    let totalGlobalRevenue = 0;
    let totalGlobalCost = 0;
    let totalGlobalProfit = 0;
    
    filteredSales.forEach(sale => {
      const inventoryItem = inventory.find(item => item.name === sale.item);
      const purchasePrice = inventoryItem?.purchasePrice || 0;
      const category = inventoryItem?.category || 'Non catégorisé';
      
      // Calculs globaux
      totalGlobalRevenue += sale.total;
      totalGlobalCost += sale.quantity * purchasePrice;
      
      if (!productAnalysis[sale.item]) {
        productAnalysis[sale.item] = {
          itemName: sale.item,
          category,
          totalSales: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          profitMargin: 0,
          averageSellingPrice: 0,
          profitPerUnit: 0
        };
      }
      
      const product = productAnalysis[sale.item];
      product.totalSales += 1;
      product.totalQuantity += sale.quantity;
      product.totalRevenue += sale.total;
      product.totalCost += sale.quantity * purchasePrice;
    });
    
    totalGlobalProfit = totalGlobalRevenue - totalGlobalCost;
    
    // Finaliser les calculs pour les produits
    Object.values(productAnalysis).forEach(product => {
      product.totalProfit = product.totalRevenue - product.totalCost;
      product.profitMargin = product.totalRevenue > 0 
        ? (product.totalProfit / product.totalRevenue) * 100 
        : 0;
      product.averageSellingPrice = product.totalQuantity > 0 
        ? product.totalRevenue / product.totalQuantity 
        : 0;
      product.profitPerUnit = product.totalQuantity > 0 
        ? product.totalProfit / product.totalQuantity 
        : 0;
    });
    
    // Calculer la rentabilité par catégorie
    const categoryAnalysis: Record<string, CategoryProfitability> = {};
    
    Object.values(productAnalysis).forEach(product => {
      if (!categoryAnalysis[product.category]) {
        categoryAnalysis[product.category] = {
          category: product.category,
          totalRevenue: 0,
          totalProfit: 0,
          profitMargin: 0,
          itemCount: 0
        };
      }
      
      const category = categoryAnalysis[product.category];
      category.totalRevenue += product.totalRevenue;
      category.totalProfit += product.totalProfit;
      category.itemCount += 1;
    });
    
    // Finaliser les calculs pour les catégories
    Object.values(categoryAnalysis).forEach(category => {
      category.profitMargin = category.totalRevenue > 0 
        ? (category.totalProfit / category.totalRevenue) * 100 
        : 0;
    });
    
    // Calculer les métriques de performance
    const performanceMetrics = {
      totalRevenue: totalGlobalRevenue,
      totalCost: totalGlobalCost,
      totalProfit: totalGlobalProfit,
      globalProfitMargin: totalGlobalRevenue > 0 ? (totalGlobalProfit / totalGlobalRevenue) * 100 : 0,
      averageOrderValue: filteredSales.length > 0 ? totalGlobalRevenue / filteredSales.length : 0,
      totalTransactions: filteredSales.length,
      bestPerformingCategory: Object.values(categoryAnalysis)
        .sort((a, b) => b.totalProfit - a.totalProfit)[0] || null,
      worstPerformingCategory: Object.values(categoryAnalysis)
        .sort((a, b) => a.totalProfit - b.totalProfit)[0] || null,
      topRevenueProduct: Object.values(productAnalysis)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || null,
      topProfitProduct: Object.values(productAnalysis)
        .sort((a, b) => b.totalProfit - a.totalProfit)[0] || null,
      profitabilityTrend: totalGlobalProfit > 0 ? 'positive' : totalGlobalProfit < 0 ? 'negative' : 'neutral'
    };
    
    return {
      products: Object.values(productAnalysis).sort((a, b) => b.totalProfit - a.totalProfit),
      categories: Object.values(categoryAnalysis).sort((a, b) => b.totalProfit - a.totalProfit),
      summary: performanceMetrics
    };
  }, [getSales, getInventory, dateFilter]);
  
  return analysis;
};
