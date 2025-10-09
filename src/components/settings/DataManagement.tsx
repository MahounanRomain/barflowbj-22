
import React, { useRef, useState } from "react";
import { Database, Download, Upload, CheckCircle, FileText, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocalData } from "@/hooks/useLocalData";
import { exportCompleteData, importCompleteData, validateImportData } from "@/lib/comprehensiveExport";

interface DataManagementProps {
  onExport: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ onExport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importInfo, setImportInfo] = useState<any>(null);
  const { toast } = useToast();
  const { importData, getSettings, getInventory, getSales, getStaff } = useLocalData();

  const handleCompleteExport = () => {
    try {
      const result = exportCompleteData();
      toast({
        title: "✅ Export complet réussi",
        description: `${result.fileName} - ${result.totalKeys} éléments exportés`,
      });
    } catch (error) {
      toast({
        title: "❌ Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    }
  };

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
      
      // Validate import data
      const validation = validateImportData(data);
      setImportInfo(validation.info);

      if (!validation.valid && validation.warnings.length > 0) {
        toast({
          title: "⚠️ Avertissement",
          description: validation.warnings.join(', '),
        });
      }

      // Use comprehensive import if new format detected
      if (data.exportInfo && data.completeLocalStorage) {
        const result = importCompleteData(data);
        
        toast({
          title: result.success ? "✅ Import complet réussi" : "❌ Erreur d'import",
          description: result.message,
          variant: result.success ? "default" : "destructive"
        });

        if (result.success) {
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        // Legacy import for old formats
        let importedCount = 0;

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
          if (data.notifications) { importData('app_notifications', data.notifications); importedCount++; }
          if (data.cashBalance) { importData('cashBalance', data.cashBalance); importedCount++; }
          if (data.cashTransactions) { importData('cashTransactions', data.cashTransactions); importedCount++; }
          if (data.inventoryHistory) { importData('inventoryHistory', data.inventoryHistory); importedCount++; }
        }

        toast({
          title: "✅ Import réussi",
          description: `${importedCount} éléments importés depuis ${file.name}`,
        });

        setTimeout(() => window.location.reload(), 1500);
      }

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

          {/* Data summary */}
          {importInfo && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs space-y-1">
                <div className="font-semibold">Dernière importation détectée:</div>
                <div className="flex gap-2 flex-wrap">
                  {importInfo.inventoryCount && <Badge variant="secondary">{importInfo.inventoryCount} articles</Badge>}
                  {importInfo.salesCount && <Badge variant="secondary">{importInfo.salesCount} ventes</Badge>}
                  {importInfo.staffCount && <Badge variant="secondary">{importInfo.staffCount} employés</Badge>}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button onClick={handleCompleteExport} variant="default" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Complet v3.0 (Recommandé)
            </Button>

            <Button onClick={onExport} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Standard (JSON)
            </Button>
            
            <Button onClick={handleImportClick} variant="secondary" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Importer des données
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
