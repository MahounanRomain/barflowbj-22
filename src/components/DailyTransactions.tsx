
import React from "react";
import { X, Clock, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Transaction {
  id: string;
  date: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt?: string;
  sellerName?: string;
}

interface DailyTransactionsProps {
  date: Date;
  transactions: Transaction[];
  onClose: () => void;
}

const DailyTransactions: React.FC<DailyTransactionsProps> = ({
  date,
  transactions,
  onClose,
}) => {
  // Formatage en XOF
  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculer le total des transactions du jour
  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalItems = transactions.reduce((sum, transaction) => sum + transaction.quantity, 0);

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg">
          Transactions du {format(date, "dd MMMM yyyy", { locale: fr })}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucune transaction pour cette date</p>
          </div>
        ) : (
          <>
            {/* Résumé du jour */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatXOF(totalRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">Chiffre d'affaires</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {transactions.length}
                </div>
                <div className="text-xs text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {totalItems}
                </div>
                <div className="text-xs text-muted-foreground">Articles vendus</div>
              </div>
            </div>

            {/* Liste des transactions */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground mb-3">
                Détail des transactions
              </h4>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-card border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{transaction.item}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock size={12} />
                        {transaction.createdAt 
                          ? format(new Date(transaction.createdAt), "HH:mm", { locale: fr })
                          : "N/A"
                        }
                        {transaction.sellerName && (
                          <span>• {transaction.sellerName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{formatXOF(transaction.total)}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.quantity} × {formatXOF(transaction.unitPrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyTransactions;
