import { formatDateForStorage } from './dateUtils';

export interface DateRange {
  start: string; // Format YYYY-MM-DD
  end: string;   // Format YYYY-MM-DD
}

/**
 * Utilitaires centralisés pour gérer les filtres de dates de manière cohérente dans toute l'application
 */

export const getDateRangeForPreset = (preset: string): DateRange => {
  const now = new Date();
  const today = formatDateForStorage(now);
  
  switch (preset) {
    case '7d': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { start: formatDateForStorage(start), end: today };
    }
    case '14d': {
      const start = new Date(now);
      start.setDate(start.getDate() - 14);
      return { start: formatDateForStorage(start), end: today };
    }
    case '30d': {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { start: formatDateForStorage(start), end: today };
    }
    case 'thisWeek': {
      const start = new Date(now);
      start.setDate(start.getDate() - now.getDay());
      return { start: formatDateForStorage(start), end: today };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: formatDateForStorage(start), end: today };
    }
    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: formatDateForStorage(start), end: today };
    }
    case 'allTime': {
      return { start: '2020-01-01', end: today };
    }
    default:
      return { start: today, end: today };
  }
};

export const getMonthDateRange = (yearMonth: string): DateRange => {
  const [year, month] = yearMonth.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  
  return {
    start: formatDateForStorage(start),
    end: formatDateForStorage(end)
  };
};

export const getYearDateRange = (year: number): DateRange => {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`
  };
};

export const filterSalesByDateRange = (sales: any[], range: DateRange): any[] => {
  return sales.filter(sale => {
    const saleDate = sale.date;
    return saleDate >= range.start && saleDate <= range.end;
  });
};

export const calculateTotals = (sales: any[]) => {
  return {
    revenue: sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
    count: sales.length,
    items: sales.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0)
  };
};
