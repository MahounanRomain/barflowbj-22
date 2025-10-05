import { formatDateForStorage } from './dateUtils';

export interface DateFilter {
  type: 'preset' | 'custom';
  preset?: '7d' | '14d' | '21d' | '30d' | '90d' | 'monthly' | 'yearly' | 'all';
  startDate?: string;
  endDate?: string;
  label: string;
  month?: string;
  year?: string;
}

/**
 * Filtre les ventes selon une période de dates de manière cohérente
 * Cette fonction garantit que tous les filtres de dates utilisent la même logique
 */
export function filterSalesByDateRange<T extends { date: string }>(
  allSales: T[],
  dateFilter: DateFilter
): T[] {
  // Filtre personnalisé avec dates de début et fin
  if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
    return allSales.filter(sale => 
      sale.date >= dateFilter.startDate! && sale.date <= dateFilter.endDate!
    );
  }
  
  // Filtre "Toutes les données"
  if (dateFilter.preset === 'all') {
    return allSales;
  }
  
  // Filtre mensuel - utilise le format YYYY-MM
  if (dateFilter.preset === 'monthly' && dateFilter.month) {
    return allSales.filter(sale => sale.date.startsWith(dateFilter.month!));
  }
  
  // Filtre annuel - utilise le format YYYY
  if (dateFilter.preset === 'yearly' && dateFilter.year) {
    return allSales.filter(sale => sale.date.startsWith(dateFilter.year!));
  }
  
  // Filtres par nombre de jours (7d, 14d, 21d, 30d, 90d)
  let days = 30; // défaut
  switch (dateFilter.preset) {
    case '7d': days = 7; break;
    case '14d': days = 14; break;
    case '21d': days = 21; break;
    case '30d': days = 30; break;
    case '90d': days = 90; break;
  }
  
  // Calcul de la date de coupure
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffString = formatDateForStorage(cutoffDate);
  
  return allSales.filter(sale => sale.date >= cutoffString);
}

/**
 * Calcule la période de comparaison pour l'analyse
 */
export function calculatePeriodDates(dateFilter: DateFilter): { start: string; end: string } {
  // Période personnalisée
  if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
    return {
      start: dateFilter.startDate,
      end: dateFilter.endDate
    };
  }
  
  // Filtre mensuel
  if (dateFilter.preset === 'monthly' && dateFilter.month) {
    const [year, month] = dateFilter.month.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // Dernier jour du mois
    
    return {
      start: formatDateForStorage(startDate),
      end: formatDateForStorage(endDate)
    };
  }
  
  // Filtre annuel
  if (dateFilter.preset === 'yearly' && dateFilter.year) {
    const year = parseInt(dateFilter.year);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return {
      start: formatDateForStorage(startDate),
      end: formatDateForStorage(endDate)
    };
  }
  
  // Filtres par nombre de jours
  let days = 30;
  switch (dateFilter.preset) {
    case '7d': days = 7; break;
    case '14d': days = 14; break;
    case '21d': days = 21; break;
    case '30d': days = 30; break;
    case '90d': days = 90; break;
    case 'all':
      // Pour "all", retourner une période très large
      return {
        start: '1970-01-01',
        end: formatDateForStorage(new Date())
      };
  }
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    start: formatDateForStorage(startDate),
    end: formatDateForStorage(endDate)
  };
}

/**
 * Calcule les statistiques de vente pour une période donnée
 */
export function calculateSalesStats<T extends { date: string; total: number; quantity: number }>(
  sales: T[]
): {
  totalRevenue: number;
  totalSales: number;
  totalQuantity: number;
  averageOrderValue: number;
} {
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const totalSales = sales.length;
  const totalQuantity = sales.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0);
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  return {
    totalRevenue,
    totalSales,
    totalQuantity,
    averageOrderValue
  };
}
