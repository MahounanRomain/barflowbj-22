import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, Smartphone, Monitor } from 'lucide-react';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';
import { Capacitor } from '@capacitor/core';

const ScreenOrientationDemo = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { lockToLandscape, lockToPortrait, unlock } = useScreenOrientation();
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    if (isFullscreen && isNative) {
      lockToLandscape();
    } else if (isNative) {
      unlock();
    }

    return () => {
      if (isFullscreen && isNative) {
        unlock();
      }
    };
  }, [isFullscreen, isNative, lockToLandscape, unlock]);

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm">
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Mode Plein Écran</h2>
              <Badge variant={isNative ? "default" : "secondary"}>
                {isNative ? (
                  <>
                    <Smartphone className="w-3 h-3 mr-1" />
                    Natif - Mode paysage activé
                  </>
                ) : (
                  <>
                    <Monitor className="w-3 h-3 mr-1" />
                    Web - Rotation disponible uniquement sur mobile
                  </>
                )}
              </Badge>
            </div>
            <Button onClick={handleToggleFullscreen} variant="outline">
              <Minimize2 className="w-4 h-4 mr-2" />
              Quitter le plein écran
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 max-w-2xl w-full">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Démonstration de l'orientation d'écran</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>🔄 <strong>Sur mobile</strong> : L'écran bascule automatiquement en mode paysage</p>
                  <p>💻 <strong>Sur web</strong> : Seul le mode plein écran fonctionne</p>
                  <p>📱 <strong>Plateforme détectée</strong> : {isNative ? 'Application native' : 'Navigateur web'}</p>
                </div>
                
                {!isNative && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      💡 Pour tester la rotation d'écran, vous devez :
                    </p>
                    <ol className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 text-left">
                      <li>1. Exporter vers GitHub</li>
                      <li>2. Cloner le projet localement</li>
                      <li>3. Ajouter les plateformes : <code>npx cap add android</code></li>
                      <li>4. Construire : <code>npm run build</code></li>
                      <li>5. Synchroniser : <code>npx cap sync</code></li>
                      <li>6. Lancer : <code>npx cap run android</code></li>
                    </ol>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Test d'orientation d'écran</h3>
        <Button onClick={handleToggleFullscreen} variant="outline">
          <Maximize2 className="w-4 h-4 mr-2" />
          Mode plein écran
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={isNative ? "default" : "secondary"}>
            {isNative ? (
              <>
                <Smartphone className="w-3 h-3 mr-1" />
                Application native
              </>
            ) : (
              <>
                <Monitor className="w-3 h-3 mr-1" />
                Navigateur web
              </>
            )}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Cliquez sur "Mode plein écran" pour tester la rotation automatique.
          {!isNative && " La rotation ne fonctionne que sur l'application mobile native."}
        </p>
      </div>
    </Card>
  );
};

export default ScreenOrientationDemo;