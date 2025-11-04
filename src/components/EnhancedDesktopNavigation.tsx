import React, { useState, useEffect } from "react";
import { Home, ShoppingCart, Package, Users, Settings, BarChart3, Pin, PinOff } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import barflowtrackLogo from "@/assets/barflowtrack-logo.png";

const EnhancedDesktopNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPinned, setIsPinned] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Masquer sur mobile
  if (isMobile) {
    return null;
  }

  const navItems = [
    { icon: Home, label: "Accueil", path: "/", ariaLabel: "Aller à la page d'accueil", id: "home" },
    { icon: ShoppingCart, label: "Ventes", path: "/sales", ariaLabel: "Aller à la page des ventes", id: "sales" },
    { icon: Package, label: "Stock", path: "/inventory", ariaLabel: "Aller à la page de gestion du stock", id: "inventory" },
    { icon: Users, label: "Personnel", path: "/staff", ariaLabel: "Aller à la page de gestion du personnel", id: "staff" },
    { icon: BarChart3, label: "Rapports", path: "/reports", ariaLabel: "Aller à la page des rapports", id: "reports" },
    { icon: Settings, label: "Paramètres", path: "/settings", ariaLabel: "Aller à la page des paramètres", id: "settings" }
  ];

  // Auto-collapse when route changes (only if not pinned)
  useEffect(() => {
    if (!isPinned) {
      setIsExpanded(false);
      setHoveredItem(null);
    }
  }, [location.pathname, isPinned]);

  // Handle mouse enter on navigation
  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  // Handle mouse leave on navigation
  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsExpanded(false);
      setHoveredItem(null);
    }
  };

  // Handle item hover
  const handleItemHover = (itemId: string) => {
    setHoveredItem(itemId);
  };

  const handleItemLeave = () => {
    setHoveredItem(null);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  const shouldShowExpanded = isExpanded || isPinned;

  return (
    <TooltipProvider delayDuration={300}>
      <nav 
        className={cn(
          "fixed left-0 top-0 h-full bg-card/95 backdrop-blur-xl border-r border-border/60",
          "transition-all duration-500 ease-smooth z-50 shadow-xl animate-slide-in-left",
          shouldShowExpanded ? "w-64" : "w-16"
        )}
        role="navigation"
        aria-label="Navigation principale"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "p-4 border-b border-border/60 bg-gradient-to-br from-primary/5 to-accent/10 transition-all duration-500 animate-fade-in",
            shouldShowExpanded ? "px-6" : "px-4"
          )}>
            <div className="flex items-center justify-between">
              <div className={cn(
                "flex items-center transition-all duration-500 overflow-hidden",
                shouldShowExpanded ? "space-x-3 opacity-100" : "space-x-0 opacity-0"
              )}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover-glow transition-smooth animate-gentle-bounce flex-shrink-0">
                  <img 
                    src={barflowtrackLogo} 
                    alt="BarFlowTrack Logo" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div className={cn(
                  "transition-all duration-500",
                  shouldShowExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}>
                  <h1 className="text-lg font-bold text-foreground bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    BarFlowTrack
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium">by Romain Sergio</p>
                </div>
              </div>

              {!shouldShowExpanded && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg hover-glow transition-smooth animate-gentle-bounce mx-auto">
                      <img 
                        src={barflowtrackLogo} 
                        alt="BarFlowTrack Logo" 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>BarFlowTrack</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Pin/Unpin Button */}
              {shouldShowExpanded && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePin}
                      className={cn(
                        "ml-auto hover:bg-accent/20 transition-all duration-300",
                        isPinned ? "text-primary" : "text-muted-foreground"
                      )}
                      aria-label={isPinned ? "Détacher le menu" : "Épingler le menu"}
                    >
                      {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{isPinned ? "Détacher le menu" : "Épingler le menu"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto animate-fade-in-up">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.id;
              
              return shouldShowExpanded ? (
                <Link
                  key={item.label}
                  to={item.path}
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? "page" : undefined}
                  onMouseEnter={() => handleItemHover(item.id)}
                  onMouseLeave={handleItemLeave}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 animate-slide-in-right",
                    "hover:bg-accent/20 hover:shadow-lg group",
                    isActive && "bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg border border-primary/20"
                  )}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: isActive ? 'translateX(4px) scale(1.02)' : isHovered ? 'translateX(2px)' : undefined
                  }}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)] animate-gentle-bounce" : "text-muted-foreground group-hover:text-primary",
                    isHovered && "scale-110"
                  )} 
                  aria-hidden="true"
                  />
                  <span className={cn(
                    "text-sm font-medium transition-all duration-300",
                    isActive ? "text-primary font-semibold" : "text-foreground",
                    isHovered && "scale-105"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse-subtle shadow-[0_0_8px_hsl(var(--primary))]" />
                  )}
                </Link>
              ) : (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      aria-label={item.ariaLabel}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                        "hover:bg-accent/20 hover:shadow-lg mx-auto group",
                        isActive && "bg-gradient-to-r from-primary/20 to-accent/20 shadow-lg border border-primary/20"
                      )}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        transform: isActive ? 'scale(1.1)' : isHovered ? 'scale(1.05)' : undefined
                      }}
                    >
                      <item.icon className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isActive ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)] animate-gentle-bounce" : "text-muted-foreground group-hover:text-primary"
                      )} 
                      aria-hidden="true"
                      />
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse-subtle shadow-[0_0_8px_hsl(var(--primary))]" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-card/95 backdrop-blur-xl border-primary/20">
                    <p className="font-medium">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Footer */}
          <div className={cn(
            "p-4 border-t border-border/60 bg-gradient-to-br from-muted/20 to-accent/5 transition-all duration-500 animate-fade-in"
          )}>
            {shouldShowExpanded ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Thème</span>
                  <DarkModeToggle />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Version <span className="text-primary font-semibold">1.0.0</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <DarkModeToggle />
                <div className="text-xs text-muted-foreground font-semibold">v1.0</div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default EnhancedDesktopNavigation;