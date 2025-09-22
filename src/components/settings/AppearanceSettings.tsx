
import React from "react";
import { Palette, Moon, Sun, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/ui/theme-provider";

interface AppearanceSettingsProps {
  settings: any;
  onSettingsChange: (updates: any) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", label: "Clair", icon: Sun, color: "text-warning" },
    { value: "dark", label: "Sombre", icon: Moon, color: "text-info" },
    { value: "system", label: "Système", icon: Monitor, color: "text-muted-foreground" },
  ];

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Apparence</CardTitle>
            <CardDescription className="text-sm">Personnalisez l'interface de l'application</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium mb-3 block">Mode d'affichage</Label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;
                
                return (
                  <Button
                    key={option.value}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme(option.value as "light" | "dark" | "system")}
                    className={`flex flex-col items-center gap-2 h-auto py-3 px-2 transition-all duration-200 ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-current" : option.color}`} />
                    <span className="text-xs font-medium">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Le mode "Système" s'adapte automatiquement aux préférences de votre appareil.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
