
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppChromeIOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppChromeIOS) {
      setIsInstalled(true);
      return;
    }

    // Check cooldown period - don't show if recently dismissed
    const lastDismissed = localStorage.getItem('pwa_install_dismissed_at');
    const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (lastDismissed && (Date.now() - parseInt(lastDismissed) < sevenDays)) {
      console.log('PWA install prompt recently dismissed. Not showing for another', Math.ceil((sevenDays - (Date.now() - parseInt(lastDismissed))) / (24 * 60 * 60 * 1000)), 'days');
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt fired! User can now be prompted to install.');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

  const handleAppInstalled = () => {
    console.log('BarFlowTrack PWA was successfully installed!');
    setIsInstalled(true);
    setShowPrompt(false);
    setDeferredPrompt(null);
    // Clear any previous dismissal timestamp since app is now installed
    localStorage.removeItem('pwa_install_dismissed_at');
  };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal timestamp to prevent showing for 7 days
    localStorage.setItem('pwa_install_dismissed_at', Date.now().toString());
    console.log('PWA install prompt dismissed. Will not show again for 7 days.');
    // Don't clear deferredPrompt so we can show again after cooldown if needed
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-24 left-4 right-4 p-4 bg-card/95 backdrop-blur-xl border shadow-lg z-50 md:left-auto md:right-6 md:w-80">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Installer BarFlowTrack</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleDismiss}
          aria-label="Fermer la notification d'installation"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Installez BarFlowTrack sur votre appareil pour un accès rapide et une utilisation hors-ligne.
      </p>
      
      <div className="flex gap-2">
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="flex-1"
        >
          Installer
        </Button>
        <Button
          variant="outline"
          onClick={handleDismiss}
          size="sm"
        >
          Plus tard
        </Button>
      </div>
    </Card>
  );
};

export default PWAInstallPrompt;
