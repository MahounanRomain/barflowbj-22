
import React from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderInput } from "@/components/ui/placeholder-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface EstablishmentSettingsProps {
  settings: any;
  onSettingsChange: (updates: any) => void;
}

export const EstablishmentSettings: React.FC<EstablishmentSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Établissement
                <Badge variant="secondary" className="text-xs">Pro</Badge>
              </CardTitle>
              <CardDescription className="text-sm">Informations sur votre bar</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nom de l'établissement</Label>
            <PlaceholderInput 
              value={settings.barName} 
              onValueChange={(value) => onSettingsChange({ barName: value })}
              placeholder="Entrez le nom de votre établissement"
              className="focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Téléphone</Label>
            <PlaceholderInput 
              value={settings.phone} 
              onValueChange={(value) => onSettingsChange({ phone: value })}
              placeholder="Entrez le numéro de téléphone"
              className="focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium">Adresse</Label>
            <textarea 
              value={settings.address || ''} 
              onChange={(e) => onSettingsChange({ address: e.target.value })}
              placeholder="Entrez l'adresse de votre établissement"
              className="flex min-h-[2.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden focus:ring-2 focus:ring-primary/20"
              style={{
                height: 'auto',
                minHeight: '2.5rem'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
