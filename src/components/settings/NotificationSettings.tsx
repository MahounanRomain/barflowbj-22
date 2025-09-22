
import React from "react";
import { Bell, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationSettingsProps {
  settings: any;
  onSettingsChange: (updates: any) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription className="text-sm">Gérez vos alertes et notifications</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-success" />
              <div>
                <Label className="font-medium">Notifications générales</Label>
                <p className="text-sm text-muted-foreground">Recevoir les notifications système</p>
              </div>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => onSettingsChange({ notifications: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-warning" />
              <div>
                <Label className="font-medium">Alertes de stock bas</Label>
                <p className="text-sm text-muted-foreground">Alerte quand le stock est faible</p>
              </div>
            </div>
            <Switch
              checked={settings.lowStockAlerts}
              onCheckedChange={(checked) => onSettingsChange({ lowStockAlerts: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
