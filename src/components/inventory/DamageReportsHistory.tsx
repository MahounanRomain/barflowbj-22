import React, { useState, useEffect } from 'react';
import { FileX, AlertTriangle, Package, Calendar, User, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface DamageReport {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: string;
  description?: string;
  reportedBy: string;
  date: string;
  timestamp: string;
  lossValue: number;
}

const DamageReportsHistory = () => {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const { toast } = useToast();

  const loadReports = async () => {
    try {
      const { storage } = await import('@/lib/storage');
      const damageReports: DamageReport[] = storage.load('damageReports') || [];
      // Trier par date décroissante
      setReports(damageReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    }
  };

  useEffect(() => {
    loadReports();
    
    // Écouter les nouveaux rapports
    const handleDamageReported = () => loadReports();
    window.addEventListener('damageReported', handleDamageReported);
    
    return () => {
      window.removeEventListener('damageReported', handleDamageReported);
    };
  }, []);

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { storage } = await import('@/lib/storage');
      const updatedReports = reports.filter(report => report.id !== reportId);
      storage.save('damageReports', updatedReports);
      setReports(updatedReports);
      
      toast({
        title: "Rapport supprimé",
        description: "Le rapport de dégât a été supprimé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rapport",
        variant: "destructive",
      });
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Bouteille cassée':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Produit périmé':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Contamination':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Vol/Casse client':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const totalLoss = reports.reduce((sum, report) => sum + report.lossValue, 0);
  const thisMonthReports = reports.filter(report => {
    const reportDate = new Date(report.timestamp);
    const now = new Date();
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
  });
  const thisMonthLoss = thisMonthReports.reduce((sum, report) => sum + report.lossValue, 0);

  if (reports.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileX size={32} className="text-muted-foreground" />
          </div>
          <CardTitle className="mb-2 text-lg font-semibold">Aucun rapport de dégât</CardTitle>
          <CardDescription className="text-sm text-muted-foreground max-w-sm">
            Tous vos produits sont en bon état. Les rapports de dégâts apparaîtront ici.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total des Pertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-destructive" />
              <span className="text-2xl font-bold">{formatCurrency(totalLoss)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {reports.length} rapport(s) enregistré(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ce Mois-ci</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-orange-500" />
              <span className="text-2xl font-bold">{formatCurrency(thisMonthLoss)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {thisMonthReports.length} rapport(s) ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des rapports */}
      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                      <Package size={16} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{report.itemName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.quantity} unité(s) • {formatCurrency(report.lossValue)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getReasonColor(report.reason)}>
                        {report.reason}
                      </Badge>
                    </div>

                    {report.description && (
                      <p className="text-sm text-muted-foreground italic">
                        "{report.description}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{report.reportedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>
                            {format(new Date(report.timestamp), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DamageReportsHistory;