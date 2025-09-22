
import * as XLSX from 'xlsx';
import { storage, InventoryItem, StaffMember, SaleRecord, BarSettings } from './storage';

// Fonction pour récupérer les vraies données stockées localement
const getBarData = () => {
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

  // Calculer les statistiques de ventes
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => sale.date === today);
  const dailySales = {
    today: todaySales.reduce((sum, sale) => sum + sale.total, 0),
    week: 0, // Ici vous pouvez calculer les ventes de la semaine
    month: 0  // Ici vous pouvez calculer les ventes du mois
  };

  // Calculer les articles les plus vendus
  const itemSales: Record<string, { sales: number; revenue: number }> = {};
  sales.forEach(sale => {
    if (!itemSales[sale.item]) {
      itemSales[sale.item] = { sales: 0, revenue: 0 };
    }
    itemSales[sale.item].sales += sale.quantity;
    itemSales[sale.item].revenue += sale.total;
  });

  const topItems = Object.entries(itemSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  return {
    inventory,
    staff,
    sales,
    reports: {
      dailySales,
      topItems
    },
    settings
  };
};

export const exportToExcel = () => {
  const data = getBarData();
  
  // Créer un nouveau classeur
  const workbook = XLSX.utils.book_new();
  
  // Feuille 1: Inventaire
  const inventorySheet = XLSX.utils.json_to_sheet(
    data.inventory.map(item => ({
      'ID': item.id,
      'Nom': item.name,
      'Catégorie': item.category,
      'Quantité': item.quantity,
      'Unité': item.unit,
      'Seuil d\'alerte': item.threshold,
      'Prix de vente (XOF)': item.salePrice,
      'Statut': item.quantity <= 0 ? 'Rupture de stock' : 
               item.quantity <= item.threshold ? 'Stock faible' : 'En stock',
      'Créé le': item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '',
      'Modifié le': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('fr-FR') : ''
    }))
  );
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventaire');
  
  // Feuille 2: Personnel
  const staffSheet = XLSX.utils.json_to_sheet(
    data.staff.map(member => ({
      'ID': member.id,
      'Nom': member.name,
      'Poste': member.role,
      'Email': member.email || '',
      'Téléphone': member.phone || '',
      'Statut': member.isActive ? 'Actif' : 'Inactif',
      'Créé le': member.createdAt ? new Date(member.createdAt).toLocaleDateString('fr-FR') : '',
      'Modifié le': member.updatedAt ? new Date(member.updatedAt).toLocaleDateString('fr-FR') : ''
    }))
  );
  XLSX.utils.book_append_sheet(workbook, staffSheet, 'Personnel');
  
  // Feuille 3: Ventes détaillées
  const salesSheet = XLSX.utils.json_to_sheet(
    data.sales.map(sale => ({
      'ID': sale.id,
      'Date': sale.date,
      'Article': sale.item,
      'Quantité': sale.quantity,
      'Prix unitaire (XOF)': sale.unitPrice,
      'Total (XOF)': sale.total,
      'Créé le': sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('fr-FR') : ''
    }))
  );
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Ventes');
  
  // Feuille 4: Résumé des ventes
  const salesSummaryData = [
    { 'Période': 'Aujourd\'hui', 'Montant (XOF)': data.reports.dailySales.today },
    { 'Période': 'Cette semaine', 'Montant (XOF)': data.reports.dailySales.week },
    { 'Période': 'Ce mois', 'Montant (XOF)': data.reports.dailySales.month },
    {},
    { 'Période': 'Articles les plus vendus', 'Montant (XOF)': '' },
    ...data.reports.topItems.map(item => ({
      'Période': item.name,
      'Montant (XOF)': `${item.sales} vendus - ${item.revenue} XOF`
    }))
  ];
  const salesSummarySheet = XLSX.utils.json_to_sheet(salesSummaryData);
  XLSX.utils.book_append_sheet(workbook, salesSummarySheet, 'Résumé Ventes');
  
  // Feuille 5: Informations du bar
  const barInfoData = [
    { 'Propriété': 'Nom du bar', 'Valeur': data.settings.barName },
    { 'Propriété': 'Adresse', 'Valeur': data.settings.address },
    { 'Propriété': 'Téléphone', 'Valeur': data.settings.phone },
    { 'Propriété': 'Date d\'export', 'Valeur': new Date().toLocaleDateString('fr-FR') },
    { 'Propriété': 'Heure d\'export', 'Valeur': new Date().toLocaleTimeString('fr-FR') },
    { 'Propriété': 'Nombre d\'articles en stock', 'Valeur': data.inventory.length },
    { 'Propriété': 'Nombre d\'employés', 'Valeur': data.staff.filter(s => s.isActive).length },
    { 'Propriété': 'Nombre de ventes', 'Valeur': data.sales.length }
  ];
  const barInfoSheet = XLSX.utils.json_to_sheet(barInfoData);
  XLSX.utils.book_append_sheet(workbook, barInfoSheet, 'Infos Bar');
  
  // Générer le nom du fichier avec la date
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const fileName = `Export_Bar_${dateStr}.xlsx`;
  
  // Télécharger le fichier
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};

// Fonction pour générer un rapport quotidien automatique
export const generateDailyReport = () => {
  const data = getBarData();
  const today = new Date().toISOString().split('T')[0];
  
  // Créer un nouveau classeur pour le rapport quotidien
  const workbook = XLSX.utils.book_new();
  
  // Filtrer les ventes du jour
  const todaySales = data.sales.filter(sale => sale.date === today);
  
  // Feuille 1: Ventes du jour
  const dailySalesSheet = XLSX.utils.json_to_sheet(
    todaySales.map(sale => ({
      'Heure': sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString('fr-FR') : '',
      'Article': sale.item,
      'Quantité': sale.quantity,
      'Prix unitaire (XOF)': sale.unitPrice,
      'Total (XOF)': sale.total
    }))
  );
  XLSX.utils.book_append_sheet(workbook, dailySalesSheet, 'Ventes du jour');
  
  // Feuille 2: Résumé quotidien
  const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);
  
  const dailySummaryData = [
    { 'Métrique': 'Date du rapport', 'Valeur': today },
    { 'Métrique': 'Chiffre d\'affaires total', 'Valeur': `${totalSales} XOF` },
    { 'Métrique': 'Nombre total d\'articles vendus', 'Valeur': totalItems },
    { 'Métrique': 'Nombre de transactions', 'Valeur': todaySales.length },
    { 'Métrique': 'Panier moyen', 'Valeur': todaySales.length > 0 ? `${(totalSales / todaySales.length).toFixed(0)} XOF` : '0 XOF' }
  ];
  
  const dailySummarySheet = XLSX.utils.json_to_sheet(dailySummaryData);
  XLSX.utils.book_append_sheet(workbook, dailySummarySheet, 'Résumé quotidien');
  
  // Générer le nom du fichier
  const fileName = `Rapport_Quotidien_${today}.xlsx`;
  
  // Télécharger le fichier
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};
