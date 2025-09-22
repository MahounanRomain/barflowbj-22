
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatDisplayDate } from "@/lib/dateUtils";

interface RecentSalesProps {
  sales: any[];
  formatFCFA: (amount: number) => string;
  onDeleteSale: (saleId: string) => void;
}

export const RecentSales: React.FC<RecentSalesProps> = ({
  sales,
  formatFCFA,
  onDeleteSale,
}) => {
  return (
    <Card className="p-4">
      <h3 className="font-medium mb-3">Ventes récentes</h3>
      
      {sales.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucune vente enregistrée. Commencez par enregistrer votre première vente !
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sales.slice().reverse().slice(0, 20).map(sale => (
            <div key={sale.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <span className="font-medium block truncate">{sale.item}</span>
                <div className="text-xs text-muted-foreground">
                  {sale.quantity} × {formatFCFA(sale.unitPrice)} - {sale.date ? formatDisplayDate(sale.date) : 'Date non définie'}
                  {sale.sellerName && <span className="ml-2 block sm:inline">• Vendeur: {sale.sellerName}</span>}
                  {sale.tableName && <span className="ml-2 block sm:inline">• Table: {sale.tableName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="font-medium text-green-600">{formatFCFA(sale.total)}</span>
                <div className="flex gap-1">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600 hover:text-red-800">
                        <Trash2 size={12} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette vente ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera définitivement la vente de {sale.item} et restaurera le stock correspondant.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteSale(sale.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
