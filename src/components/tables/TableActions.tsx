
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table } from '@/lib/storage';
import { TableBalance } from '@/hooks/useTableBalance';

interface TableActionsProps {
  table: Table;
  balance: TableBalance | null;
  onStatusChange: (tableId: string, newStatus: 'available' | 'occupied') => void;
  formatCurrency: (amount: number) => string;
}

export const TableActions = memo<TableActionsProps>(({ 
  table, 
  balance, 
  onStatusChange, 
  formatCurrency 
}) => {
  return (
    <div className="flex flex-wrap gap-1">
      {table.status !== 'available' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="text-success hover:text-success"
            >
              <CheckCircle size={14} className="mr-1" />
              Libérer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Libérer la table ?</AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous libérer la table "{table.name}" ?
                {balance && balance.totalAmount > 0 && (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <div className="font-medium">Solde actuel:</div>
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(balance.totalAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {balance.itemCount} articles • {balance.sales.length} commandes
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onStatusChange(table.id, 'available')}
                className="bg-success hover:bg-success/90"
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {table.status !== 'occupied' && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-warning hover:text-warning"
          onClick={() => onStatusChange(table.id, 'occupied')}
        >
          <Clock size={14} className="mr-1" />
          Occuper
        </Button>
      )}
    </div>
  );
});

TableActions.displayName = 'TableActions';
