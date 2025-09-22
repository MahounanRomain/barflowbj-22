
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { generateAccountingExport, exportToExcel, exportToCsv, validateAccountingEntries } from '@/lib/accountingExport';
import { useToast } from '@/hooks/use-toast';

const AccountingExport = () => {
  const { getSales, getInventory } = useLocalData();
  const { toast } = useToast();
  
  const [exportOptions, setExportOptions] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'excel' as 'excel' | 'csv' | 'json',
    includeVAT: false,
    vatRate: 18
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<{ date: string; entries: number } | null>(null);
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const sales = getSales();
      const inventory = getInventory();
      
      const entries = generateAccountingExport(sales, inventory, exportOptions);
      
      if (entries.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucune vente trouvée pour la période sélectionnée",
          variant: "destructive"
        });
        return;
      }
      
      // Validation des écritures
      const validation = validateAccountingEntries(entries);
      if (!validation.isValid) {
        toast({
          title: "Erreur de validation",
          description: validation.errors.join(', '),
          variant: "destructive"
        });
        return;
      }
      
      // Export selon le format choisi
      const filename = `comptabilite_${exportOptions.startDate}_${exportOptions.endDate}`;
      
      if (exportOptions.format === 'excel') {
        exportToExcel(entries, `${filename}.xlsx`);
      } else if (exportOptions.format === 'csv') {
        exportToCsv(entries, `${filename}.csv`);
      } else {
        // JSON export
        const jsonData = JSON.stringify(entries, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      setLastExport({
        date: new Date().toISOString(),
        entries: entries.length
      });
      
      toast({
        title: "Export réussi",
        description: `${entries.length} écritures comptables exportées`
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const updateOption = (key: string, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-500" />
        Export Comptable Standard
      </h3>
      
      <div className="space-y-6">
        {/* Paramètres de période */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              type="date"
              value={exportOptions.startDate}
              onChange={(e) => updateOption('startDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Date de fin</Label>
            <Input
              id="endDate"
              type="date"
              value={exportOptions.endDate}
              onChange={(e) => updateOption('endDate', e.target.value)}
            />
          </div>
        </div>
        
        {/* Paramètres d'export */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Format d'export</Label>
            <Select value={exportOptions.format} onValueChange={(value) => updateOption('format', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vatRate">Taux de TVA (%)</Label>
            <Input
              id="vatRate"
              type="number"
              min="0"
              max="100"
              value={exportOptions.vatRate}
              onChange={(e) => updateOption('vatRate', Number(e.target.value))}
              disabled={!exportOptions.includeVAT}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="includeVAT"
              checked={exportOptions.includeVAT}
              onCheckedChange={(checked) => updateOption('includeVAT', checked)}
            />
            <Label htmlFor="includeVAT">Inclure TVA</Label>
          </div>
        </div>
        
        {/* Informations sur l'export */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Format d'export comptable
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Plan comptable général français</li>
            <li>• Équilibrage automatique Débit/Crédit</li>
            <li>• Références des pièces générées</li>
            <li>• Suivi des coûts des marchandises vendues</li>
            {exportOptions.includeVAT && <li>• Calculs TVA automatiques</li>}
          </ul>
        </div>
        
        {/* Dernier export */}
        {lastExport && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                Dernier export: {new Date(lastExport.date).toLocaleString('fr-FR')} 
                ({lastExport.entries} écritures)
              </span>
            </div>
          </div>
        )}
        
        {/* Bouton d'export */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            L'export respecte les normes comptables françaises
          </div>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Export en cours...' : 'Exporter'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AccountingExport;
