
import React from "react";
import { Home, ShoppingCart, Package, Users, Settings, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const BottomNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Ne pas afficher sur desktop
  if (!isMobile) {
    return null;
  }

  const navItems = [
    { icon: Home, label: "Accueil", path: "/", ariaLabel: "Aller à la page d'accueil" },
    { icon: ShoppingCart, label: "Ventes", path: "/sales", ariaLabel: "Aller à la page des ventes" },
    { icon: Package, label: "Stock", path: "/inventory", ariaLabel: "Aller à la page de gestion du stock" },
    { icon: Users, label: "Personnel", path: "/staff", ariaLabel: "Aller à la page de gestion du personnel" },
    { icon: BarChart3, label: "Rapports", path: "/reports", ariaLabel: "Aller à la page des rapports" },
    { icon: Settings, label: "Paramètres", path: "/settings", ariaLabel: "Aller à la page des paramètres" }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 w-full bg-secondary/80 backdrop-blur-lg border-t border-border/50 z-50 glass-effect animate-slide-up"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center px-2 transition-smooth touch-feedback ${
                isActive
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              }`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                '--stagger': index 
              } as React.CSSProperties}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon 
                className={`h-5 w-5 transition-smooth ${
                  isActive ? 'animate-gentle-bounce' : ''
                }`}
                aria-hidden="true"
              />
              <span className={`text-[0.7rem] mt-1 font-medium transition-smooth ${
                isActive ? 'text-primary' : ''
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-scale-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
