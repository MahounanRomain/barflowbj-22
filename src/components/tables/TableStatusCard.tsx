
import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Receipt,
  DollarSign,
  Table as TableIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableBalance } from '@/hooks/useTableBalance';
import { Table } from '@/lib/storage';

interface TableStatusCardProps {
  table: Table;
  balance: TableBalance | null;
  onStatusChange: (tableId: string, newStatus: 'available' | 'occupied') => void;
  formatCurrency: (amount: number) => string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'text-success';
    case 'occupied': return 'text-warning';
    case 'reserved': return 'text-info';
    default: return 'text-muted-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'available': return <CheckCircle size={16} />;
    case 'occupied': return <Clock size={16} />;
    case 'reserved': return <AlertCircle size={16} />;
    default: return <TableIcon size={16} />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return 'Libre';
    case 'occupied': return 'Occupée';
    case 'reserved': return 'Réservée';
    default: return 'Inconnu';
  }
};

export const TableStatusCard = memo<TableStatusCardProps>(({ 
  table, 
  balance, 
  onStatusChange, 
  formatCurrency 
}) => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              table.status === 'available' && "bg-success/10",
              table.status === 'occupied' && "bg-warning/10", 
              table.status === 'reserved' && "bg-info/10"
            )}>
              <div className={getStatusColor(table.status)}>
                {getStatusIcon(table.status)}
              </div>
            </div>
            <div>
              <h4 className="font-medium">{table.name}</h4>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    table.status === 'available' && "bg-success/10 text-success",
                    table.status === 'occupied' && "bg-warning/10 text-warning",
                    table.status === 'reserved' && "bg-info/10 text-info"
                  )}
                >
                  {getStatusLabel(table.status)}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users size={12} />
                  {table.capacity} places
                </span>
              </div>
            </div>
          </div>
          
          {balance && (
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatCurrency(balance.totalAmount)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Receipt size={10} />
                {balance.sales.length} commandes
              </div>
            </div>
          )}
        </div>

        {balance && balance.totalAmount > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <DollarSign size={14} className="text-primary" />
              Détail du solde
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• {balance.itemCount} articles commandés</div>
              <div>• {balance.sales.length} commandes au total</div>
              <div>• Dernière mise à jour: {new Date(balance.lastUpdated).toLocaleTimeString('fr-FR')}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});

TableStatusCard.displayName = 'TableStatusCard';
