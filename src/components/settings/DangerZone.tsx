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
          Zone critique
        </CardTitle>
        <CardDescription>
          Ces actions sont définitives et ne peuvent pas être annulées.
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
              Réinitialiser toutes les données
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la réinitialisation complète</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>Vous êtes sur le point de supprimer définitivement :</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>{inventoryCount} article{inventoryCount > 1 ? 's' : ''} d'inventaire</li>
                  <li>{salesCount} enregistrement{salesCount > 1 ? 's' : ''} de vente</li>
                  <li>{staffCount} membre{staffCount > 1 ? 's' : ''} du personnel</li>
                  <li>L'ensemble de vos paramètres</li>
                </ul>
                <p className="font-semibold text-red-600 mt-3">
                  Exportez vos données avant de continuer. Cette action est irréversible.
                </p>
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
