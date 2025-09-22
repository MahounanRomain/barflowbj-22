
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTableBalance } from "@/hooks/useTableBalance";
import { Clock, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffTableSelectorProps {
  staff: any[];
  tables: any[];
  selectedStaff: string;
  selectedTable: string;
  onStaffChange: (staffId: string) => void;
  onTableChange: (tableId: string) => void;
}

export const StaffTableSelector: React.FC<StaffTableSelectorProps> = ({
  staff,
  tables,
  selectedStaff,
  selectedTable,
  onStaffChange,
  onTableChange,
}) => {
  const { getTableBalance, formatCurrency } = useTableBalance();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={12} className="text-success" />;
      case 'occupied': return <Clock size={12} className="text-warning" />;
      case 'reserved': return <AlertCircle size={12} className="text-info" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Libre';
      case 'occupied': return 'Occupée';
      case 'reserved': return 'Réservée';
      default: return '';
    }
  };
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="staff">Vendeur</Label>
        <Select value={selectedStaff} onValueChange={onStaffChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un vendeur" />
          </SelectTrigger>
          <SelectContent>
            {staff.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {staff.length === 1 && (
          <p className="text-xs text-muted-foreground">
            Vendeur sélectionné automatiquement
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="table">Table (optionnel)</Label>
        <Select value={selectedTable} onValueChange={onTableChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune table</SelectItem>
            {tables.map((table) => {
              const balance = table.status === 'occupied' ? getTableBalance(table.id) : null;
              
              return (
                <SelectItem key={table.id} value={table.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{table.name}</span>
                      {getStatusIcon(table.status)}
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
                    </div>
                    {balance && balance.totalAmount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <DollarSign size={10} />
                        {formatCurrency(balance.totalAmount)}
                      </div>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        {selectedTable && selectedTable !== "none" && (
          (() => {
            const selectedTableData = tables.find(t => t.id === selectedTable);
            const balance = selectedTableData?.status === 'occupied' ? getTableBalance(selectedTable) : null;
            
            return (
              <div className="text-xs text-muted-foreground space-y-1">
                {selectedTableData && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTableData.status)}
                    <span>Statut: {getStatusLabel(selectedTableData.status)}</span>
                  </div>
                )}
                {balance && balance.totalAmount > 0 && (
                  <div className="p-2 bg-muted/50 rounded border border-primary/20">
                    <div className="font-medium text-foreground">Solde actuel:</div>
                    <div className="font-bold text-primary">{formatCurrency(balance.totalAmount)}</div>
                    <div className="text-xs">{balance.itemCount} articles • {balance.sales.length} commandes</div>
                  </div>
                )}
              </div>
            );
          })()
        )}
        
        {tables.length === 1 && (
          <p className="text-xs text-muted-foreground">
            Table sélectionnée automatiquement
          </p>
        )}
      </div>
    </>
  );
};
