import React, { useRef, useState } from "react";
import { Database, Download, Upload, CheckCircle, AlertTriangle, Info } from "lucide-react";
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
        title: "Export terminé",
        description: `Fichier ${result.fileName} généré — ${result.totalKeys} éléments sauvegardés.`,
      });
    } catch (error) {
      toast({
        title: "Échec de l'export",
        description: "Impossible de générer le fichier. Réessayez.",
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
        title: "Format non pris en charge",
        description: "Sélectionnez un fichier au format JSON.",
        variant: "destructive"
      });
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const validation = validateImportData(data);
      setImportInfo(validation.info);

      if (!validation.valid && validation.warnings.length > 0) {
        toast({
          title: "Attention",
          description: validation.warnings.join(', '),
        });
      }

      if (data.exportInfo && data.completeLocalStorage) {
        const result = importCompleteData(data);
        toast({
          title: result.success ? "Import réussi" : "Échec de l'import",
          description: result.message,
          variant: result.success ? "default" : "destructive"
        });
        if (result.success) {
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
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
          title: "Données importées",
          description: `${importedCount} élément${importedCount > 1 ? 's' : ''} restauré${importedCount > 1 ? 's' : ''} depuis ${file.name}.`,
        });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Fichier illisible",
        description: "Le fichier sélectionné est invalide ou corrompu. Vérifiez qu'il s'agit d'un export BarFlow.",
        variant: "destructive"
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Sauvegarde et restauration</CardTitle>
            <CardDescription className="text-sm">Exportez ou importez l'intégralité de vos données</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Status */}
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Données synchronisées</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Vos données sont sauvegardées dans le cloud et accessibles sur tous vos appareils.
            </p>
          </div>

          {/* Import info */}
          {importInfo && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs space-y-1">
                <div className="font-semibold">Dernière importation :</div>
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
              Exporter toutes les données
            </Button>

            <Button onClick={onExport} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export standard (JSON)
            </Button>

            <Button onClick={handleImportClick} variant="secondary" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Restaurer depuis un fichier
            </Button>
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              L'import remplacera vos données actuelles. Pensez à exporter une sauvegarde avant de restaurer un fichier.
            </AlertDescription>
          </Alert>

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
