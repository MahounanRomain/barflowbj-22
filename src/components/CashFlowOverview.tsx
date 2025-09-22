
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useCashData } from '@/hooks/useCashData';
import { useSalesData } from '@/hooks/useSalesData';

const CashFlowOverview = () => {
  const { getCashBalance, getCashTransactions } = useCashData();
  const { getSales } = useSalesData();

  const cashBalance = getCashBalance();
  const transactions = getCashTransactions();
  const sales = getSales();

  // Calcul des revenus et dépenses du jour
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.timestamp.startsWith(today));
  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpenses = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-card to-accent/5 border shadow-lg">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-500" />
        Trésorerie aujourd'hui
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Entrées</span>
          </div>
          <p className="text-lg font-bold text-green-600">
            {formatXOF(todayIncome)}
          </p>
        </div>
        
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Sorties</span>
          </div>
          <p className="text-lg font-bold text-red-600">
            {formatXOF(todayExpenses)}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Solde actuel</span>
          <span className="text-lg font-bold">
            {cashBalance ? formatXOF(cashBalance.currentAmount) : formatXOF(0)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CashFlowOverview;
