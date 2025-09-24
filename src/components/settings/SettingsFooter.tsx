import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Loader2, Calendar } from "lucide-react";
interface SettingsFooterProps {
  onSave: () => void;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
}
export const SettingsFooter: React.FC<SettingsFooterProps> = ({
  onSave,
  hasUnsavedChanges,
  isSaving = false
}) => {
  return <>
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">BarFlowTrack</h3>
            <p className="text-sm text-muted-foreground">Gestion intelligente de bar</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            v2.1.0
          </Badge>
        </div>
        
        <Separator className="my-4" />

        {/* Changements récents */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-4">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
            Changements récents
          </h4>
          <div className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
            <div>• <strong>v2.1.0:</strong> Optimisation historique réapprovisionnement</div>
            <div>• <strong>v2.0.5:</strong> Amélioration système notifications</div>
            <div>• <strong>v2.0.0:</strong> Refonte complète interface utilisateur</div>
          </div>
        </div>

        {/* Informations techniques */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg mb-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Framework:</span>
              <span>React 18.3.1 + TypeScript</span>
            </div>
            <div className="flex justify-between">
              <span>Build Tool:</span>
              <span>Vite + TailwindCSS</span>
            </div>
            <div className="flex justify-between">
              <span>PWA:</span>
              <span className="text-green-600">✓ Compatible</span>
            </div>
          </div>
        </div>

        {/* Détails de la version */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Détails de la version</span>
          </div>
          <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
            <div className="flex justify-between">
              <span>Build:</span>
              <span className="font-mono">2025-08-19</span>
            </div>
            <div className="flex justify-between">
              <span>Dernière modification:</span>
              <span className="font-mono">19 août 2025 à 02:26</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-semibold">Production</span>
            </div>
          </div>
        </div>

        {/* Fonctionnalités de cette version */}
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 mb-6">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Fonctionnalités de cette version
          </h4>
          <div className="grid grid-cols-1 gap-1">
            <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✅ Historique de réapprovisionnement optimisé</div>
            <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✅ Déduplication avancée des entrées</div>
            <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✅ Gestion intelligente des notifications</div>
            <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✅ Interface utilisateur améliorée</div>
            <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✅ Performance optimisée</div>
            <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✅ Système de cache intelligent</div>
            <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✅ Mode hors ligne complet</div>
            <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✅ Thème sombre/clair adaptatif</div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Développé avec ❤️ Lovable AI par <span className="font-medium text-primary">Romain Sergio BOGNISSOU</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contact: romainmahougnon@gmail.com
          </p>
        </div>
      </div>

      {/* Fixed save button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onSave} disabled={isSaving} variant={hasUnsavedChanges ? "default" : "secondary"} className="-bottom-0.5 h-12 shadow-bar-light bg-gradient-to-r from-primary to-accent-foreground hover:decoration-accent transition-all duration-200 text-sm font-medium">
            {isSaving ? <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sauvegarde en cours...
              </> : hasUnsavedChanges ? <>
                <Clock className="w-5 h-5 mr-2" />
                Sauvegarder les modifications
              </> : <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Sauvegarder les paramètres
              </>}
          </Button>
          {hasUnsavedChanges && !isSaving && <p className="text-xs text-muted-foreground text-center mt-2">
              Sauvegarde automatique dans 2 secondes...
            </p>}
        </div>
      </div>
    </>;
};