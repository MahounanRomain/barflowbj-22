import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Command, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'accessibility';
}

const KeyboardShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const shortcuts: Shortcut[] = [
    // Navigation
    { key: 'Alt + H', description: 'Aller à l\'accueil', action: () => navigate('/'), category: 'navigation' },
    { key: 'Alt + S', description: 'Aller aux ventes', action: () => navigate('/sales'), category: 'navigation' },
    { key: 'Alt + I', description: 'Aller au stock', action: () => navigate('/inventory'), category: 'navigation' },
    { key: 'Alt + P', description: 'Aller au personnel', action: () => navigate('/staff'), category: 'navigation' },
    { key: 'Alt + R', description: 'Aller aux rapports', action: () => navigate('/reports'), category: 'navigation' },
    { key: 'Alt + G', description: 'Aller aux paramètres', action: () => navigate('/settings'), category: 'navigation' },
    
    // Actions
    { key: 'Ctrl + K', description: 'Recherche globale', action: () => {}, category: 'actions' },
    { key: 'Ctrl + N', description: 'Nouvelle vente', action: () => {}, category: 'actions' },
    { key: 'Ctrl + +', description: 'Ajouter produit', action: () => {}, category: 'actions' },
    { key: 'Escape', description: 'Fermer dialogue', action: () => {}, category: 'actions' },
    
    // Accessibilité
    { key: '?', description: 'Afficher les raccourcis', action: () => setIsOpen(true), category: 'accessibility' },
    { key: 'Alt + 1', description: 'Aller au contenu principal', action: () => {
      const main = document.getElementById('main-content');
      main?.focus();
    }, category: 'accessibility' },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si on est dans un champ de saisie
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      const shortcut = shortcuts.find(s => {
        const keys = s.key.toLowerCase().split(' + ');
        
        if (keys.length === 1) {
          return event.key.toLowerCase() === keys[0];
        }
        
        if (keys.length === 2) {
          const [modifier, key] = keys;
          const modifierPressed = 
            (modifier === 'ctrl' && event.ctrlKey) ||
            (modifier === 'alt' && event.altKey) ||
            (modifier === 'shift' && event.shiftKey);
          
          return modifierPressed && event.key.toLowerCase() === key;
        }
        
        return false;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Actions',
    accessibility: 'Accessibilité'
  };

  return (
    <>
      {/* Raccourci pour afficher l'aide - Masqué sur mobile */}
      {!isMobile && (
        <div className="fixed bottom-4 right-4 z-50">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-10 w-10 p-0 rounded-full bg-card/80 backdrop-blur-lg hover:bg-card"
                aria-label="Afficher les raccourcis clavier"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Command className="h-5 w-5" />
                Raccourcis Clavier
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h3>
                  
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <span className="text-foreground">{shortcut.description}</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {shortcut.key}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
              <p className="text-sm text-info-foreground">
                <strong>Astuce :</strong> Utilisez <Badge variant="outline" className="mx-1 font-mono">Tab</Badge> 
                pour naviguer entre les éléments et <Badge variant="outline" className="mx-1 font-mono">Espace</Badge> 
                ou <Badge variant="outline" className="mx-1 font-mono">Entrée</Badge> pour activer les boutons.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;