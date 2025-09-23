
import { useCallback } from 'react';
import { storage, CashBalance, CashTransaction } from '@/lib/storage';

export const useCashData = () => {
  const getCashBalance = useCallback((): CashBalance | null => {
    return storage.load<CashBalance>('cashBalance');
  }, []);

  const setCashBalance = useCallback((amount: number) => {
    const cashBalance: CashBalance = {
      id: Date.now().toString(),
      initialAmount: amount,
      currentAmount: amount,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    storage.save('cashBalance', cashBalance);
    window.dispatchEvent(new CustomEvent('cashBalanceChanged'));
    return cashBalance;
  }, []);

  const updateCashBalance = useCallback((newAmount: number) => {
    const current = getCashBalance();
    if (current) {
      const updated: CashBalance = {
        ...current,
        currentAmount: newAmount,
        lastUpdated: new Date().toISOString()
      };
      storage.save('cashBalance', updated);
      window.dispatchEvent(new CustomEvent('cashBalanceChanged'));
      return updated;
    }
    return null;
  }, [getCashBalance]);

  const getCashTransactions = useCallback((): CashTransaction[] => {
    return storage.load<CashTransaction[]>('cashTransactions') || [];
  }, []);

  const addCashTransaction = useCallback((transaction: Omit<CashTransaction, 'id' | 'timestamp'>) => {
    const transactions = getCashTransactions();
    const newTransaction: CashTransaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    transactions.push(newTransaction);
    storage.save('cashTransactions', transactions);

    // Update cash balance
    const currentBalance = getCashBalance();
    if (currentBalance) {
      const newAmount = transaction.type === 'income' 
        ? currentBalance.currentAmount + transaction.amount
        : currentBalance.currentAmount - transaction.amount;
      updateCashBalance(newAmount);
    }

    window.dispatchEvent(new CustomEvent('cashTransactionsChanged'));
    return newTransaction;
  }, [getCashTransactions, getCashBalance, updateCashBalance]);

  const deleteCashTransaction = useCallback((id: string) => {
    const transactions = getCashTransactions();
    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    const updatedTransactions = transactions.filter(t => t.id !== id);
    storage.save('cashTransactions', updatedTransactions);

    // Reverse the cash balance update
    const currentBalance = getCashBalance();
    if (currentBalance) {
      const newAmount = transactionToDelete.type === 'income' 
        ? currentBalance.currentAmount - transactionToDelete.amount
        : currentBalance.currentAmount + transactionToDelete.amount;
      updateCashBalance(newAmount);
    }

    window.dispatchEvent(new CustomEvent('cashTransactionsChanged'));
  }, [getCashTransactions, getCashBalance, updateCashBalance]);

  return {
    getCashBalance,
    setCashBalance,
    updateCashBalance,
    getCashTransactions,
    addCashTransaction,
    deleteCashTransaction,
  };
};
