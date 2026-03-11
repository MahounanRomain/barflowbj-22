import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";

interface SettingsFooterProps {
  onSave: () => void;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
}

export const SettingsFooter: React.FC<SettingsFooterProps> = () => {
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">BarFlow</h3>
          <p className="text-sm text-muted-foreground">Gestion complète pour votre établissement</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          v3.0.0
        </Badge>
      </div>

      <Separator className="my-4" />

      {/* Changements récents */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-4">
        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
          Nouveautés récentes
        </h4>
        <div className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
          <div>• <strong>v3.0.0 :</strong> Migration cloud, synchronisation multi-appareils, interface unifiée des ventes</div>
          <div>• <strong>v2.1.0 :</strong> Historique de réapprovisionnement optimisé</div>
          <div>• <strong>v2.0.0 :</strong> Refonte complète de l'interface</div>
        </div>
      </div>

      {/* Informations techniques */}
      <div className="p-3 bg-muted/30 rounded-lg mb-4">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Plateforme</span>
            <span>React 18 · TypeScript · Vite</span>
          </div>
          <div className="flex justify-between">
            <span>Backend</span>
            <span>Lovable Cloud</span>
          </div>
          <div className="flex justify-between">
            <span>PWA</span>
            <span className="text-green-600">Installable</span>
          </div>
        </div>
      </div>

      {/* Version details */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Informations de version</span>
        </div>
        <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
          <div className="flex justify-between">
            <span>Build</span>
            <span className="font-mono">2026-03-11</span>
          </div>
          <div className="flex justify-between">
            <span>Environnement</span>
            <span className="font-semibold">Production</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 mb-6">
        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Fonctionnalités actives
        </h4>
        <div className="grid grid-cols-1 gap-1">
          <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✓ Synchronisation cloud multi-appareils</div>
          <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✓ Point de vente unifié avec panier</div>
          <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✓ Alertes de stock intelligentes</div>
          <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✓ Rapports et analyses avancés</div>
          <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✓ Gestion de trésorerie intégrée</div>
          <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✓ Mode hors ligne avec synchronisation</div>
          <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✓ Thème clair / sombre adaptatif</div>
          <div className="text-xs text-green-700 dark:text-green-300 py-0.5">✓ Application installable (PWA)</div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Développé avec ❤️ et Lovable AI par{' '}
          <span className="font-medium text-primary">Romain Sergio BOGNISSOU</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          romainmahougnon@gmail.com
        </p>
      </div>
    </div>
  );
};
