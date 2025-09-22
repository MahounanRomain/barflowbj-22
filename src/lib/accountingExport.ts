
import { SaleRecord, InventoryItem } from '@/lib/storage';
import * as XLSX from 'xlsx';

interface AccountingEntry {
  date: string;
  reference: string;
  account: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  piece: string;
}

interface AccountingExportOptions {
  startDate: string;
  endDate: string;
  format: 'excel' | 'csv' | 'json';
  includeVAT: boolean;
  vatRate: number;
}

export const generateAccountingExport = (
  sales: SaleRecord[],
  inventory: InventoryItem[],
  options: AccountingExportOptions
) => {
  const entries: AccountingEntry[] = [];
  
  // Filtrer les ventes par période
  const filteredSales = sales.filter(
    sale => sale.date >= options.startDate && sale.date <= options.endDate
  );
  
  filteredSales.forEach((sale, index) => {
    const saleRef = `VTE${sale.date.replace(/-/g, '')}${String(index + 1).padStart(3, '0')}`;
    const inventoryItem = inventory.find(item => item.name === sale.item);
    
    // Écriture de vente (Débit Client / Crédit Vente)
    const saleAmount = options.includeVAT ? sale.total : sale.total / (1 + options.vatRate / 100);
    const vatAmount = options.includeVAT ? sale.total - saleAmount : 0;
    
    // Compte Client (411)
    entries.push({
      date: sale.date,
      reference: saleRef,
      account: '411000',
      accountName: 'Clients',
      debit: sale.total,
      credit: 0,
      description: `Vente ${sale.item} - ${sale.sellerName}`,
      piece: saleRef
    });
    
    // Compte Vente (701)
    entries.push({
      date: sale.date,
      reference: saleRef,
      account: '701000',
      accountName: 'Ventes de marchandises',
      debit: 0,
      credit: saleAmount,
      description: `Vente ${sale.item}`,
      piece: saleRef
    });
    
    // TVA si applicable
    if (options.includeVAT && vatAmount > 0) {
      entries.push({
        date: sale.date,
        reference: saleRef,
        account: '445710',
        accountName: 'TVA collectée',
        debit: 0,
        credit: vatAmount,
        description: `TVA sur vente ${sale.item}`,
        piece: saleRef
      });
    }
    
    // Coût des marchandises vendues si prix d'achat disponible
    if (inventoryItem?.purchasePrice) {
      const costAmount = sale.quantity * inventoryItem.purchasePrice;
      
      // Compte Achat (607)
      entries.push({
        date: sale.date,
        reference: saleRef,
        account: '607000',
        accountName: 'Achats de marchandises',
        debit: costAmount,
        credit: 0,
        description: `Coût ${sale.item}`,
        piece: saleRef
      });
      
      // Compte Stock (37)
      entries.push({
        date: sale.date,
        reference: saleRef,
        account: '370000',
        accountName: 'Stocks de marchandises',
        debit: 0,
        credit: costAmount,
        description: `Sortie stock ${sale.item}`,
        piece: saleRef
      });
    }
  });
  
  return entries;
};

export const exportToExcel = (entries: AccountingEntry[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(entries);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Comptabilité');
  
  // Formatage des colonnes
  const columnWidths = [
    { wch: 12 }, // Date
    { wch: 15 }, // Référence
    { wch: 10 }, // Compte
    { wch: 25 }, // Nom du compte
    { wch: 12 }, // Débit
    { wch: 12 }, // Crédit
    { wch: 30 }, // Description
    { wch: 15 }  // Pièce
  ];
  worksheet['!cols'] = columnWidths;
  
  XLSX.writeFile(workbook, filename);
};

export const exportToCsv = (entries: AccountingEntry[], filename: string) => {
  const headers = ['Date', 'Reference', 'Account', 'AccountName', 'Debit', 'Credit', 'Description', 'Piece'];
  const csvContent = [
    headers.join(';'),
    ...entries.map(entry => [
      entry.date,
      entry.reference,
      entry.account,
      entry.accountName,
      entry.debit.toFixed(2),
      entry.credit.toFixed(2),
      `"${entry.description}"`,
      entry.piece
    ].join(';'))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const validateAccountingEntries = (entries: AccountingEntry[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const debitTotal = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const creditTotal = entries.reduce((sum, entry) => sum + entry.credit, 0);
  
  // Vérification de l'équilibre comptable
  if (Math.abs(debitTotal - creditTotal) > 0.01) {
    errors.push(`Déséquilibre comptable: Débit ${debitTotal.toFixed(2)} ≠ Crédit ${creditTotal.toFixed(2)}`);
  }
  
  // Vérification des comptes
  entries.forEach((entry, index) => {
    if (!entry.account || entry.account.length < 6) {
      errors.push(`Ligne ${index + 1}: Numéro de compte invalide`);
    }
    if (!entry.description.trim()) {
      errors.push(`Ligne ${index + 1}: Description manquante`);
    }
    if (entry.debit < 0 || entry.credit < 0) {
      errors.push(`Ligne ${index + 1}: Montants négatifs non autorisés`);
    }
    if (entry.debit > 0 && entry.credit > 0) {
      errors.push(`Ligne ${index + 1}: Une ligne ne peut pas avoir débit ET crédit`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
