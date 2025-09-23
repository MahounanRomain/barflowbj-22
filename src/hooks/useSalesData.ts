
import { useCallback } from 'react';
import { storage, SaleRecord, CashTransaction, CashBalance } from '@/lib/storage';

export const useSalesData = () => {
  const getSales = useCallback((): SaleRecord[] => {
    return storage.load<SaleRecord[]>('sales') || [];
  }, []);

  const saveSales = useCallback((sales: SaleRecord[]) => {
    storage.save('sales', sales);
  }, []);

  const addSale = useCallback((sale: Omit<SaleRecord, 'id' | 'createdAt'>) => {
    const sales = getSales();
    const newSale: SaleRecord = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      // S'assurer que la date de vente est présente, sinon utiliser la date d'aujourd'hui
      date: sale.date || new Date().toISOString().split('T')[0]
    };
    sales.push(newSale);
    saveSales(sales);

    // Automatically add cash income
    const cashTransactions = storage.load<CashTransaction[]>('cashTransactions') || [];
    const cashTransaction: CashTransaction = {
      id: `sale_${newSale.id}`,
      type: 'income',
      amount: newSale.total,
      description: `Vente - ${newSale.item} (x${newSale.quantity})`,
      category: 'sales',
      relatedSaleId: newSale.id,
      timestamp: new Date().toISOString()
    };
    cashTransactions.push(cashTransaction);
    storage.save('cashTransactions', cashTransactions);

    // Update cash balance
    const cashBalance = storage.load<CashBalance>('cashBalance');
    if (cashBalance) {
      cashBalance.currentAmount += newSale.total;
      cashBalance.lastUpdated = new Date().toISOString();
      storage.save('cashBalance', cashBalance);
    }

    // Trigger real-time updates
    window.dispatchEvent(new CustomEvent('salesChanged'));
    window.dispatchEvent(new CustomEvent('cashTransactionsChanged'));
    window.dispatchEvent(new CustomEvent('cashBalanceChanged'));

    return newSale;
  }, [getSales, saveSales]);

  return {
    getSales,
    addSale,
    saveSales,
  };
};
