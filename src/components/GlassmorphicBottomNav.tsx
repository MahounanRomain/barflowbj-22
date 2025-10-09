import { useState } from "react";
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
        "fixed bottom-safe-bottom left-[45%] transform -translate-x-1/2 z-[60] mb-4",
        "bg-card/98 backdrop-blur-xl border border-primary/20",
        "rounded-2xl shadow-2xl shadow-primary/10",
        "px-3 py-2.5 mx-4",
        "animate-slide-up transition-all duration-300",
        "w-fit max-w-[380px]",
        "hover:shadow-primary/20"
      )}
      role="navigation"
      aria-label="Navigation principale"
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center justify-center gap-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredIndex === index;
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "px-2 py-1.5 rounded-xl transition-all duration-300",
                "min-w-0 flex-1 group",
                isActive
                  ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              style={{ 
                animationDelay: `${index * 100}ms`,
                transform: isActive ? 'translateY(-2px) scale(1.05)' : isHovered ? 'translateY(-1px)' : undefined
              }}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => handleItemClick(e, index)}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive && "text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]",
                  isHovered && !isActive && "scale-110"
                )}
                aria-hidden="true"
              />
              
              <span className={cn(
                "text-[0.65rem] mt-1 font-medium transition-all duration-300 leading-tight",
                isActive ? "text-primary font-semibold" : "group-hover:font-medium"
              )}>
                {item.label}
              </span>
              
              {/* Indicateur d'état actif amélioré */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse-subtle shadow-[0_0_8px_hsl(var(--primary))]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default GlassmorphicBottomNav;