import { useMemo, useCallback } from 'react';
import { useOptimizedQuery, useOptimizedMutation } from './useOptimizedQuery';
import { useOptimizedLocalData } from './useOptimizedLocalData';
import { SaleRecord } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export const useOptimizedSales = () => {
  const { optimizedGet, optimizedSave } = useOptimizedLocalData();

  // Query pour charger les ventes avec cache
  const { data: sales = [], isLoading, refetch } = useOptimizedQuery<SaleRecord[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      return optimizedGet<SaleRecord[]>('sales', []);
    },
    staleTime: 1 * 60 * 1000, // 1 minute (plus court car données plus dynamiques)
  });

  // Mutation pour ajouter une vente
  const addSaleMutation = useOptimizedMutation<SaleRecord, SaleRecord>(
    async (newSale) => {
      const current = optimizedGet<SaleRecord[]>('sales', []);
      const updated = [...current, newSale];
      optimizedSave('sales', updated);
      return newSale;
    },
    {
      onSuccess: () => {
        toast({ title: 'Vente enregistrée' });
      },
      invalidateQueries: [['sales'], ['inventory']],
    }
  );

  // Statistiques calculées avec memoization
  const todaySales = useMemo(() => {
    const today = new Date();
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isWithinInterval(saleDate, {
        start: startOfDay(today),
        end: endOfDay(today)
      });
    });
  }, [sales]);

  const todayRevenue = useMemo(() => 
    todaySales.reduce((sum, sale) => sum + sale.total, 0),
    [todaySales]
  );

  const totalRevenue = useMemo(() => 
    sales.reduce((sum, sale) => sum + sale.total, 0),
    [sales]
  );

  const salesByDate = useMemo(() => {
    const grouped = new Map<string, SaleRecord[]>();
    sales.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString();
      const existing = grouped.get(date) || [];
      grouped.set(date, [...existing, sale]);
    });
    return grouped;
  }, [sales]);

  const salesByStaff = useMemo(() => {
    const grouped = new Map<string, SaleRecord[]>();
    sales.forEach(sale => {
      const existing = grouped.get(sale.sellerId) || [];
      grouped.set(sale.sellerId, [...existing, sale]);
    });
    return grouped;
  }, [sales]);

  const topSellingItems = useMemo(() => {
    const itemSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    sales.forEach(sale => {
      const existing = itemSales.get(sale.item) || { name: sale.item, quantity: 0, revenue: 0 };
      itemSales.set(sale.item, {
        name: sale.item,
        quantity: existing.quantity + sale.quantity,
        revenue: existing.revenue + sale.total
      });
    });

    return Array.from(itemSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [sales]);

  // Fonctions callback optimisées
  const addSale = useCallback((sale: SaleRecord) => {
    addSaleMutation.mutate(sale);
  }, [addSaleMutation]);

  const getSalesByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isWithinInterval(saleDate, { start: startDate, end: endDate });
    });
  }, [sales]);

  const getSalesByStaffId = useCallback((staffId: string) => {
    return sales.filter(sale => sale.sellerId === staffId);
  }, [sales]);

  return {
    sales,
    isLoading,
    todaySales,
    todayRevenue,
    totalRevenue,
    salesByDate,
    salesByStaff,
    topSellingItems,
    addSale,
    getSalesByDateRange,
    getSalesByStaffId,
    refetch,
  };
};
