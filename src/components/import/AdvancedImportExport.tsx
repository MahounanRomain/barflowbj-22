import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Database,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  exportAdvancedData, 
  importFromExcel, 
  exportToJSON, 
  importFromJSON 
} from '@/lib/advancedExport';

const AdvancedImportExport: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Options d'export
  const [exportOptions, setExportOptions] = useState({
    includeArchived: false,
    includePredictions: true,
    includeAnalytics: true,
    format: 'xlsx' as 'xlsx' | 'json',
    dateRange: {
      enabled: false,
      start: '',
      end: ''
    }
  });

  const handleExport = async () => {
    setIsProcessing(true);
    
    try {
      const options = {
        includeArchived: exportOptions.includeArchived,
        includePredictions: exportOptions.includePredictions,
        includeAnalytics: exportOptions.includeAnalytics,
        format: exportOptions.format,
        ...(exportOptions.dateRange.enabled && exportOptions.dateRange.start && exportOptions.dateRange.end && {
          dateRange: {
            start: exportOptions.dateRange.start,
            end: exportOptions.dateRange.end
          }
        })
      };

      let fileName: string;
      
      if (exportOptions.format === 'xlsx') {
        fileName = exportAdvancedData(options);
      } else {
        fileName = exportToJSON(options);
      }
      
      toast({
        title: "Export réussi",
        description: `Fichier ${fileName} téléchargé avec succès`,
      });
      
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: `Impossible d'exporter: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  const handleImport = async (file: File) => {
    setIsProcessing(true);
    
    try {
      let result;
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        result = await importFromExcel(file);
      } else if (file.name.endsWith('.json')) {
        result = await importFromJSON(file);
      } else {
        throw new Error('Format de fichier non supporté. Utilisez .xlsx, .xls ou .json');
      }

      if (result.success) {
        toast({
          title: "Import réussi",
          description: result.message,
        });
        
        // Recharger la page pour rafraîchir les données
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({
          title: "Erreur d'import",
          description: result.message,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: `Impossible d'importer: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const setDateRangePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setExportOptions(prev => ({
      ...prev,
      dateRange: {
        enabled: true,
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Import / Export Avancé</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Export */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <h4 className="font-medium">Exporter les données</h4>
          </div>
          
          <div className="space-y-3">
            {/* Format */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Format</Label>
              <div className="flex gap-2">
                <Button
                  variant={exportOptions.format === 'xlsx' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'xlsx' }))}
                  className="flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  Excel
                </Button>
                <Button
                  variant={exportOptions.format === 'json' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'json' }))}
                  className="flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  JSON
                </Button>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Options d'export</Label>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Inclure employés inactifs</span>
                <Switch
                  checked={exportOptions.includeArchived}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeArchived: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Prédictions de stock</span>
                <Switch
                  checked={exportOptions.includePredictions}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includePredictions: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Analyses avancées</span>
                <Switch
                  checked={exportOptions.includeAnalytics}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeAnalytics: checked }))
                  }
                />
              </div>
            </div>

            {/* Plage de dates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Filtrer par période</Label>
                <Switch
                  checked={exportOptions.dateRange.enabled}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, enabled: checked }
                    }))
                  }
                />
              </div>
              
              {exportOptions.dateRange.enabled && (
                <>
                  <div className="flex gap-1 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setDateRangePreset(7)}>
                      7j
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRangePreset(30)}>
                      30j
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRangePreset(90)}>
                      90j
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="start-date" className="text-xs">Du</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={exportOptions.dateRange.start}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-xs">Au</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={exportOptions.dateRange.end}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={handleExport}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exporter
            </Button>
          </div>
        </div>

        {/* Section Import */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <h4 className="font-medium">Importer les données</h4>
          </div>
          
          <div className="space-y-3">
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.json"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              
              {isProcessing ? (
                <div className="space-y-2">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Traitement en cours...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour sélectionner un fichier
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formats supportés: Excel (.xlsx, .xls) ou JSON (.json)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Parcourir
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-muted/30 rounded p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium">Important :</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Les données existantes seront fusionnées/mises à jour</li>
                    <li>Les articles avec le même nom seront mis à jour</li>
                    <li>Sauvegardez vos données avant l'import</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Formats supportés */}
      <div className="space-y-3">
        <h5 className="font-medium text-sm">Formats supportés</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-sm">Excel (.xlsx, .xls)</p>
              <p className="text-xs text-muted-foreground">
                Format recommandé avec analyses complètes
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">Recommandé</Badge>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-sm">JSON (.json)</p>
              <p className="text-xs text-muted-foreground">
                Format technique pour sauvegarde complète
              </p>
            </div>
            <Badge variant="outline">Technique</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdvancedImportExport;