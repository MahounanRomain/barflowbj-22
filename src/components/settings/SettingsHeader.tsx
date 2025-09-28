import React from "react";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon } from "lucide-react";
interface SettingsHeaderProps {
  inventoryCount: number;
  salesCount: number;
  staffCount: number;
  hasUnsavedChanges?: boolean;
}
export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  inventoryCount,
  salesCount,
  staffCount,
  hasUnsavedChanges
}) => {
  return <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg">
          <SettingsIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Paramètres
          </h1>
          <p className="text-muted-foreground">
            Configurez votre application BarFlowTrack
            {hasUnsavedChanges && <span className="ml-2 text-orange-600 font-medium">• Modifications non sauvegardées</span>}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-primary/20 shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{inventoryCount}</div>
          <div className="text-xs text-muted-foreground">Articles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">{salesCount}</div>
          <div className="text-xs text-muted-foreground">Ventes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary bg-inherit">{staffCount}</div>
          <div className="text-xs text-muted-foreground">Personnel</div>
        </div>
      </div>
    </div>;
};