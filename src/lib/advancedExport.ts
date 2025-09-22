import * as XLSX from 'xlsx';
import { storage, InventoryItem, StaffMember, SaleRecord, BarSettings } from './storage';

interface ExportOptions {
  includeArchived?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  format?: 'xlsx' | 'csv' | 'json';
  includePredictions?: boolean;
  includeAnalytics?: boolean;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported?: {
    inventory?: number;
    staff?: number;
    sales?: number;
  };
  errors?: string[];
}

// Fonction pour récupérer les données avec filtres avancés
const getFilteredData = (options: ExportOptions = {}) => {
  const inventory = storage.load<InventoryItem[]>('inventory') || [];
  const staff = storage.load<StaffMember[]>('staff') || [];
  const sales = storage.load<SaleRecord[]>('sales') || [];
  const settings = storage.load<BarSettings>('settings') || {
    barName: 'Mon Bar',
    address: 'Adresse du bar',
    phone: 'Téléphone du bar',
    darkMode: true,
    notifications: true,
    lowStockAlerts: true
  };

  // Filtrer les ventes par période si spécifiée
  let filteredSales = sales;
  if (options.dateRange) {
    filteredSales = sales.filter(sale => 
      sale.date >= options.dateRange!.start && sale.date <= options.dateRange!.end
    );
  }

  // Calculer les analyses avancées si demandées
  const analytics = options.includeAnalytics ? calculateAdvancedAnalytics(filteredSales, inventory) : null;

  // Calculer les prédictions si demandées
  const predictions = options.includePredictions ? calculateStockPredictions(filteredSales, inventory) : null;

  return {
    inventory,
    staff: options.includeArchived ? staff : staff.filter(s => s.isActive),
    sales: filteredSales,
    settings,
    analytics,
    predictions
  };
};

const calculateAdvancedAnalytics = (sales: SaleRecord[], inventory: InventoryItem[]) => {
  // Analyse des ventes par catégorie
  const categoryAnalysis: Record<string, { revenue: number; quantity: number; items: number }> = {};
  
  sales.forEach(sale => {
    const inventoryItem = inventory.find(item => item.name === sale.item);
    const category = inventoryItem?.category || 'Non catégorisé';
    
    if (!categoryAnalysis[category]) {
      categoryAnalysis[category] = { revenue: 0, quantity: 0, items: 0 };
    }
    
    categoryAnalysis[category].revenue += sale.total;
    categoryAnalysis[category].quantity += sale.quantity;
  });

  // Compter les articles par catégorie
  const itemsByCategory: Record<string, number> = {};
  inventory.forEach(item => {
    const category = item.category || 'Non catégorisé';
    itemsByCategory[category] = (itemsByCategory[category] || 0) + 1;
  });

  Object.keys(categoryAnalysis).forEach(category => {
    categoryAnalysis[category].items = itemsByCategory[category] || 0;
  });

  // Analyse des tendances temporelles
  const dailyTrends: Record<string, number> = {};
  sales.forEach(sale => {
    dailyTrends[sale.date] = (dailyTrends[sale.date] || 0) + sale.total;
  });

  // Analyse des performances par article
  const itemPerformance: Record<string, { 
    totalRevenue: number; 
    totalQuantity: number; 
    averagePrice: number;
    frequency: number;
  }> = {};

  sales.forEach(sale => {
    if (!itemPerformance[sale.item]) {
      itemPerformance[sale.item] = {
        totalRevenue: 0,
        totalQuantity: 0,
        averagePrice: 0,
        frequency: 0
      };
    }
    
    itemPerformance[sale.item].totalRevenue += sale.total;
    itemPerformance[sale.item].totalQuantity += sale.quantity;
    itemPerformance[sale.item].frequency += 1;
  });

  // Calculer le prix moyen pour chaque article
  Object.keys(itemPerformance).forEach(item => {
    const perf = itemPerformance[item];
    perf.averagePrice = perf.totalQuantity > 0 ? perf.totalRevenue / perf.totalQuantity : 0;
  });

  return {
    categoryAnalysis,
    dailyTrends,
    itemPerformance,
    totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
    totalTransactions: sales.length,
    averageOrderValue: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0
  };
};

const calculateStockPredictions = (sales: SaleRecord[], inventory: InventoryItem[]) => {
  const predictions: Array<{
    item: string;
    currentStock: number;
    dailyConsumption: number;
    daysRemaining: number;
    recommendedReorder: string;
    riskLevel: 'low' | 'medium' | 'high';
  }> = [];

  inventory.forEach(item => {
    const itemSales = sales.filter(sale => sale.item === item.name);
    
    // Calculer la consommation quotidienne moyenne
    const totalDays = sales.length > 0 ? 
      Math.max(1, Math.ceil((new Date().getTime() - new Date(sales[0].date).getTime()) / (1000 * 60 * 60 * 24))) : 1;
    
    const totalConsumption = itemSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const dailyConsumption = totalConsumption / totalDays;
    
    const daysRemaining = dailyConsumption > 0 ? Math.floor(item.quantity / dailyConsumption) : 999;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (daysRemaining <= 3 || item.quantity <= 0) riskLevel = 'high';
    else if (daysRemaining <= 7 || item.quantity <= item.threshold) riskLevel = 'medium';

    const reorderDate = new Date();
    reorderDate.setDate(reorderDate.getDate() + Math.max(0, daysRemaining - 3));

    predictions.push({
      item: item.name,
      currentStock: item.quantity,
      dailyConsumption: Math.round(dailyConsumption * 100) / 100,
      daysRemaining,
      recommendedReorder: reorderDate.toISOString().split('T')[0],
      riskLevel
    });
  });

  return predictions.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return a.daysRemaining - b.daysRemaining;
  });
};

export const exportAdvancedData = (options: ExportOptions = {}) => {
  const data = getFilteredData(options);
  const workbook = XLSX.utils.book_new();
  
  // Feuille 1: Inventaire avec analyses
  const inventoryData = data.inventory.map(item => {
    const prediction = data.predictions?.find(p => p.item === item.name);
    return {
      'ID': item.id,
      'Nom': item.name,
      'Catégorie': item.category,
      'Quantité': item.quantity,
      'Unité': item.unit,
      'Seuil': item.threshold,
      'Prix de vente (XOF)': item.salePrice,
      'Valeur stock (XOF)': item.quantity * item.salePrice,
      'Statut': item.quantity <= 0 ? 'Rupture' : 
                item.quantity <= item.threshold ? 'Stock faible' : 'En stock',
      'Conso. quotidienne': prediction?.dailyConsumption || 0,
      'Jours restants': prediction?.daysRemaining || 999,
      'Niveau de risque': prediction?.riskLevel || 'low',
      'Réappro. suggéré': prediction?.recommendedReorder || '',
      'Créé le': item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : ''
    };
  });
  
  const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventaire Analysé');

  // Feuille 2: Ventes avec analyses
  if (data.sales.length > 0) {
    const salesData = data.sales.map(sale => ({
      'ID': sale.id,
      'Date': sale.date,
      'Heure': sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString('fr-FR') : '',
      'Article': sale.item,
      'Catégorie': data.inventory.find(i => i.name === sale.item)?.category || 'Non catégorisé',
      'Quantité': sale.quantity,
      'Prix unitaire (XOF)': sale.unitPrice,
      'Total (XOF)': sale.total,
      'Marge (XOF)': sale.total - (sale.quantity * (data.inventory.find(i => i.name === sale.item)?.salePrice || 0) * 0.6), // Estimation marge 40%
    }));
    
    const salesSheet = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Ventes Détaillées');
  }

  // Feuille 3: Analytics par catégorie
  if (data.analytics) {
    const categoryData = Object.entries(data.analytics.categoryAnalysis).map(([category, analysis]) => ({
      'Catégorie': category,
      'Revenus (XOF)': analysis.revenue,
      'Quantité vendue': analysis.quantity,
      'Nombre d\'articles': analysis.items,
      'Revenus moyens/article': analysis.items > 0 ? Math.round(analysis.revenue / analysis.items) : 0,
      'Prix moyen de vente': analysis.quantity > 0 ? Math.round(analysis.revenue / analysis.quantity) : 0
    }));
    
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Analyse par Catégorie');
  }

  // Feuille 4: Performance des articles
  if (data.analytics) {
    const performanceData = Object.entries(data.analytics.itemPerformance)
      .sort(([,a], [,b]) => b.totalRevenue - a.totalRevenue)
      .slice(0, 50) // Top 50 articles
      .map(([item, perf]) => ({
        'Article': item,
        'Revenus totaux (XOF)': perf.totalRevenue,
        'Quantité vendue': perf.totalQuantity,
        'Prix moyen (XOF)': Math.round(perf.averagePrice),
        'Fréquence ventes': perf.frequency,
        'Revenus/vente': Math.round(perf.totalRevenue / perf.frequency)
      }));
    
    const performanceSheet = XLSX.utils.json_to_sheet(performanceData);
    XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Performance Articles');
  }

  // Feuille 5: Prédictions de stock
  if (data.predictions && data.predictions.length > 0) {
    const predictionsData = data.predictions.map(pred => ({
      'Article': pred.item,
      'Stock actuel': pred.currentStock,
      'Consommation quotidienne': pred.dailyConsumption,
      'Jours restants': pred.daysRemaining,
      'Date réapprovisionnement': pred.recommendedReorder,
      'Niveau de risque': pred.riskLevel,
      'Action recommandée': pred.riskLevel === 'high' ? 'URGENT - Réapprovisionner' :
                          pred.riskLevel === 'medium' ? 'Planifier réapprovisionnement' :
                          'Surveillance'
    }));
    
    const predictionsSheet = XLSX.utils.json_to_sheet(predictionsData);
    XLSX.utils.book_append_sheet(workbook, predictionsSheet, 'Prédictions Stock');
  }

  // Générer le nom du fichier
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const fileName = `Export_Avance_${dateStr}_${timeStr}.xlsx`;
  
  // Télécharger
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};

export const importFromExcel = async (file: File): Promise<ImportResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    const result: ImportResult = {
      success: true,
      message: '',
      imported: { inventory: 0, staff: 0, sales: 0 },
      errors: []
    };

    // Import inventaire
    if (workbook.SheetNames.includes('Inventaire') || workbook.SheetNames.includes('Inventaire Analysé')) {
      const sheetName = workbook.SheetNames.find(name => name.includes('Inventaire')) || '';
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const currentInventory = storage.load<InventoryItem[]>('inventory') || [];
      let importedCount = 0;
      
      data.forEach((row: any) => {
        try {
          const item: InventoryItem = {
            id: String(Date.now() + Math.random()),
            name: row['Nom'] || row['Article'] || '',
            category: row['Catégorie'] || 'Général',
            quantity: Number(row['Quantité']) || 0,
            stock: Number(row['Quantité']) || 0,
            unit: row['Unité'] || 'unité',
            threshold: Number(row['Seuil'] || row['Seuil d\'alerte']) || 5,
            salePrice: Number(row['Prix de vente (XOF)'] || row['Prix (XOF)']) || 0,
            purchasePrice: Number(row['Prix d\'achat (XOF)']) || Number(row['Prix de vente (XOF)'] || row['Prix (XOF)']) * 0.7 || 0,
            containerType: row['Type conteneur'] || 'unité',
            minQuantity: Number(row['Quantité minimale']) || Number(row['Seuil'] || row['Seuil d\'alerte']) || 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          if (item.name && item.salePrice > 0) {
            // Vérifier si l'article existe déjà
            const existingIndex = currentInventory.findIndex(existing => existing.name === item.name);
            if (existingIndex >= 0) {
              // Mettre à jour
              currentInventory[existingIndex] = { ...currentInventory[existingIndex], ...item, id: currentInventory[existingIndex].id };
            } else {
              // Ajouter nouveau
              currentInventory.push(item);
            }
            importedCount++;
          }
        } catch (error) {
          result.errors?.push(`Erreur ligne inventaire: ${error}`);
        }
      });
      
      storage.save('inventory', currentInventory);
      result.imported!.inventory = importedCount;
    }

    // Import personnel
    if (workbook.SheetNames.includes('Personnel')) {
      const worksheet = workbook.Sheets['Personnel'];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const currentStaff = storage.load<StaffMember[]>('staff') || [];
      let importedCount = 0;
      
      data.forEach((row: any) => {
        try {
          const staff: StaffMember = {
            id: String(Date.now() + Math.random()),
            name: row['Nom'] || '',
            role: row['Poste'] || row['Role'] || 'Employé',
            email: row['Email'] || '',
            phone: row['Téléphone'] || row['Phone'] || '',
            isActive: row['Statut'] !== 'Inactif',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          if (staff.name) {
            const existingIndex = currentStaff.findIndex(existing => existing.name === staff.name);
            if (existingIndex >= 0) {
              currentStaff[existingIndex] = { ...currentStaff[existingIndex], ...staff, id: currentStaff[existingIndex].id };
            } else {
              currentStaff.push(staff);
            }
            importedCount++;
          }
        } catch (error) {
          result.errors?.push(`Erreur ligne personnel: ${error}`);
        }
      });
      
      storage.save('staff', currentStaff);
      result.imported!.staff = importedCount;
    }

    result.message = `Import réussi: ${result.imported.inventory} articles, ${result.imported.staff} employés importés.`;
    
    if (result.errors && result.errors.length > 0) {
      result.message += ` ${result.errors.length} erreurs détectées.`;
    }

    return result;
    
  } catch (error) {
    return {
      success: false,
      message: `Erreur lors de l'import: ${error}`,
      errors: [String(error)]
    };
  }
};

export const exportToJSON = (options: ExportOptions = {}) => {
  const data = getFilteredData(options);
  
  const exportData = {
    exportInfo: {
      timestamp: new Date().toISOString(),
      version: '2.0',
      options
    },
    ...data
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `bar-data-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  return exportFileDefaultName;
};

export const importFromJSON = async (file: File): Promise<ImportResult> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Valider la structure
    if (!data.inventory && !data.staff && !data.sales) {
      throw new Error('Format JSON non valide');
    }

    let importedInventory = 0;
    let importedStaff = 0;
    let importedSales = 0;

    if (data.inventory && Array.isArray(data.inventory)) {
      storage.save('inventory', data.inventory);
      importedInventory = data.inventory.length;
    }

    if (data.staff && Array.isArray(data.staff)) {
      storage.save('staff', data.staff);
      importedStaff = data.staff.length;
    }

    if (data.sales && Array.isArray(data.sales)) {
      storage.save('sales', data.sales);
      importedSales = data.sales.length;
    }

    if (data.settings) {
      storage.save('settings', data.settings);
    }

    return {
      success: true,
      message: `Import JSON réussi: ${importedInventory} articles, ${importedStaff} employés, ${importedSales} ventes`,
      imported: {
        inventory: importedInventory,
        staff: importedStaff,
        sales: importedSales
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `Erreur import JSON: ${error}`,
      errors: [String(error)]
    };
  }
};