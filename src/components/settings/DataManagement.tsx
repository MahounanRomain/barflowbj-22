
import React, { useRef } from "react";
import { Database, Download, Upload, CheckCircle, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLocalData } from "@/hooks/useLocalData";

interface DataManagementProps {
  onExport: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ onExport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { importData, getSettings, getInventory, getSales, getStaff } = useLocalData();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith('.json')) {
      toast({
        title: "❌ Format incorrect",
        description: "Veuillez sélectionner un fichier JSON valide.",
        variant: "destructive"
      });
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validation des données importées - accepter tous types d'exports
      if (!data.settings && !data.inventory && !data.sales && !data.staff && !data.completeLocalStorage && !data.metadata) {
        toast({
          title: "❌ Données invalides",
          description: "Le fichier ne contient pas de données BarFlowTrack valides.",
          variant: "destructive"
        });
        return;
      }

      let importedCount = 0;

      // Import complet depuis completeLocalStorage si disponible (export v2.2.0+)
      if (data.completeLocalStorage) {
        Object.keys(data.completeLocalStorage).forEach(key => {
          try {
            importData(key, data.completeLocalStorage[key]);
            importedCount++;
          } catch (error) {
            console.warn(`Erreur lors de l'import de ${key}:`, error);
          }
        });
      } else {
        // Import des données individuelles (anciens exports)
        if (data.settings) { importData('settings', data.settings); importedCount++; }
        if (data.inventory) { importData('inventory', data.inventory); importedCount++; }
        if (data.sales) { importData('sales', data.sales); importedCount++; }
        if (data.staff) { importData('staff', data.staff); importedCount++; }
        if (data.categories) { importData('categories', data.categories); importedCount++; }
        if (data.tables) { importData('tables', data.tables); importedCount++; }
        if (data.notifications) { importData('notifications', data.notifications); importedCount++; }
        if (data.cashBalance) { importData('cashBalance', data.cashBalance); importedCount++; }
        if (data.cashTransactions) { importData('cashTransactions', data.cashTransactions); importedCount++; }
        if (data.inventoryHistory) { importData('inventoryHistory', data.inventoryHistory); importedCount++; }
      }

      toast({
        title: "✅ Import complet réussi",
        description: `${importedCount} éléments importés avec succès depuis ${file.name}`,
      });

      // Recharger la page pour synchroniser toutes les données
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "❌ Erreur d'import",
        description: "Impossible de lire le fichier. Vérifiez qu'il s'agit d'un fichier JSON valide.",
        variant: "destructive"
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDataSummary = () => {
    const inventory = getInventory();
    const sales = getSales();
    const staff = getStaff();
    
    return {
      inventory: inventory.length,
      sales: sales.length,
      staff: staff.length,
      totalValue: sales.reduce((sum, sale) => sum + sale.total, 0)
    };
  };

  const summary = getDataSummary();

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Gestion des données</CardTitle>
            <CardDescription className="text-sm">Export et import de vos données</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">

          {/* Status */}
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Données stockées localement</span>
            </div>
            <p className="text-xs text-success/80">
              Vos données sont sécurisées dans votre navigateur
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button onClick={onExport} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Exporter toutes les données (JSON)
            </Button>
            
            <Button onClick={handleImportClick} variant="secondary" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Importer des données (JSON)
            </Button>
          </div>

          {/* Avertissement import */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Import :</strong> Les données importées remplaceront les données actuelles. 
              Exportez d'abord vos données actuelles par sécurité.
            </AlertDescription>
          </Alert>

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileImport}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};
