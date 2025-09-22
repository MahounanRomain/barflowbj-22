
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

interface DangerZoneProps {
  onClearAllData: () => void;
  inventoryCount: number;
  salesCount: number;
  staffCount: number;
}

export const DangerZone: React.FC<DangerZoneProps> = ({
  onClearAllData,
  inventoryCount,
  salesCount,
  staffCount
}) => {
  return (
    <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
            <Trash2 className="w-5 h-5" />
          </div>
          Zone dangereuse
        </CardTitle>
        <CardDescription>
          Actions irréversibles - procédez avec prudence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full hover:shadow-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer toutes les données
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Supprimer toutes les données ?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>Cette action supprimera définitivement :</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Tous les articles d'inventaire ({inventoryCount} articles)</li>
                  <li>Tous les enregistrements de ventes ({salesCount} ventes)</li>
                  <li>Tous les membres du personnel ({staffCount} membres)</li>
                  <li>Tous vos paramètres personnalisés</li>
                </ul>
                <p className="font-semibold text-red-600">Cette action est irréversible !</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onClearAllData}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
