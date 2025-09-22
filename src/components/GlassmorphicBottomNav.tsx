import React, { useState } from "react";
import { Home, ShoppingCart, Package, Users, Settings, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMicroInteractions } from "@/hooks/useMicroInteractions";
import { cn } from "@/lib/utils";

const GlassmorphicBottomNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { triggerInteraction, hapticFeedback, createRippleEffect } = useMicroInteractions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    createRippleEffect(e);
    hapticFeedback('light');
    triggerInteraction('tap');
  };

  return (
    <nav 
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
        "bg-gradient-to-r from-background/60 via-background/80 to-background/60",
        "backdrop-blur-xl border border-border/30",
        "rounded-3xl shadow-2xl shadow-primary/10",
        "px-2 py-3 mx-4",
        "animate-slide-up transition-all duration-700 ease-out",
        "hover:shadow-3xl hover:shadow-primary/20",
        "before:absolute before:inset-0 before:rounded-3xl",
        "before:bg-gradient-to-r before:from-primary/5 before:via-accent/10 before:to-primary/5",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        "after:absolute after:inset-0 after:rounded-3xl",
        "after:bg-gradient-to-b after:from-white/20 after:via-transparent after:to-black/10",
        "after:pointer-events-none"
      )}
      role="navigation"
      aria-label="Navigation principale"
      style={{
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* Halo lumineux */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 rounded-3xl blur-lg opacity-30 animate-pulse" />
      
      <div className="relative flex items-center justify-center gap-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredIndex === index;
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "px-4 py-2 rounded-2xl transition-all duration-300 ease-out",
                "group overflow-hidden",
                isActive
                  ? "bg-gradient-to-b from-primary/20 to-primary/10 text-primary scale-105 shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:scale-110",
                isHovered && !isActive && "bg-gradient-to-b from-accent/10 to-accent/5"
              )}
              style={{ 
                animationDelay: `${index * 100}ms`,
                transform: isActive ? 'translateY(-2px) scale(1.05)' : undefined
              }}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => handleItemClick(e, index)}
            >
              {/* Effet de lueur interne */}
              {(isActive || isHovered) && (
                <div 
                  className={cn(
                    "absolute inset-0 rounded-2xl opacity-60",
                    isActive 
                      ? "bg-gradient-to-b from-primary/30 via-primary/10 to-transparent"
                      : "bg-gradient-to-b from-accent/20 via-accent/5 to-transparent"
                  )}
                />
              )}
              
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-all duration-300 ease-out relative z-10",
                  isActive && "animate-gentle-bounce drop-shadow-sm",
                  isHovered && !isActive && "scale-110"
                )}
                aria-hidden="true"
              />
              
              <span className={cn(
                "text-[0.65rem] mt-1 font-medium transition-all duration-300 relative z-10",
                isActive ? "text-primary font-semibold" : "",
                isHovered && !isActive && "scale-105"
              )}>
                {item.label}
              </span>
              
              {/* Indicateur d'état actif */}
              {isActive && (
                <>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-scale-in shadow-lg" />
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-ping opacity-75" />
                </>
              )}
              
              {/* Effet de brillance au survol */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
                  "bg-gradient-to-r from-transparent via-white/20 to-transparent",
                  "transform -skew-x-12 -translate-x-full",
                  isHovered && "animate-[shimmer_0.8s_ease-out] opacity-100"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default GlassmorphicBottomNav;