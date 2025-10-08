
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, rightContent }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isOnDashboard = location.pathname === '/';

  // Toujours afficher le header s'il y a du contenu à droite (boutons d'action)
  const shouldShowHeader = isMobile || rightContent;

  if (!shouldShowHeader) {
    return null;
  }

  const getPageTitle = () => {
    if (title) return title;
    
    switch (location.pathname) {
      case '/':
        return 'Accueil';
      case '/inventory':
        return 'Stock';
      case '/sales':
        return 'Ventes';
      case '/staff':
        return 'Personnel';
      case '/reports':
        return 'Rapports';
      case '/settings':
        return 'Réglages';
      default:
        return 'BarFlowTrack';
    }
  };

  return (
    <header className={`bg-background/95 backdrop-blur-lg border-b border-border/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40 glass-effect animate-slide-up shadow-lg ${
      !isMobile ? 'border-l-4 border-l-primary' : ''
    }`}>
      <div className="flex items-center space-x-3 animate-slide-in-left">
        {(!isOnDashboard || !isMobile) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0 hover-lift transition-smooth focus-ring hover:bg-primary/10"
          >
            <ArrowLeft size={18} className="text-primary" />
          </Button>
        )}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-foreground transition-smooth">
            {isOnDashboard && !title && isMobile ? (
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift">
                BarFlowTrack
              </span>
            ) : getPageTitle()}
          </h1>
          {isOnDashboard && !title && isMobile && (
            <p className="text-[10px] text-muted-foreground font-light -mt-0.5 animate-fade-in">
              by Romain Sergio BOGNISSOU
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 animate-slide-in-right">
        {rightContent}
      </div>
    </header>
  );
};

export default Header;
