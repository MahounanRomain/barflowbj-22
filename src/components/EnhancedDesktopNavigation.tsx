import React, { useState, useEffect } from "react";
import { Home, ShoppingCart, Package, Users, Settings, BarChart3, Pin, PinOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DarkModeToggle from "@/components/DarkModeToggle";
import { cn } from "@/lib/utils";
import barflowtrackLogo from "@/assets/barflowtrack-logo.png";

const EnhancedDesktopNavigation = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
    <TooltipProvider>
      <nav 
        className={cn(
          "bg-card/95 backdrop-blur-lg border-r border-border/60 flex flex-col h-screen sticky top-0 glass-effect shadow-xl transition-all duration-500 ease-out z-40",
          shouldShowExpanded ? "w-64" : "w-16"
        )}
        role="navigation"
        aria-label="Navigation principale"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className={cn(
          "p-4 border-b border-border/60 animate-fade-in bg-gradient-to-br from-primary/5 to-accent/10 transition-all duration-500",
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
                  className="w-8 h-8 object-contain"
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
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg hover-glow transition-smooth animate-gentle-bounce">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePin}
                className={cn(
                  "h-8 w-8 p-0 transition-all duration-300",
                  isPinned ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={isPinned ? "Détacher le menu" : "Épingler le menu"}
              >
                {isPinned ? <Pin size={16} /> : <PinOff size={16} />}
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-2 space-y-1 animate-fade-in-up overflow-hidden">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === item.id;
            
            return (
              <div key={item.label} style={{ animationDelay: `${index * 50}ms` }}>
                {shouldShowExpanded ? (
                  <Link
                    to={item.path}
                    aria-label={item.ariaLabel}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={() => handleItemHover(item.id)}
                    onMouseLeave={handleItemLeave}
                    className="animate-slide-in-right block"
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-11 transition-all duration-300 hover-lift focus-ring group",
                        isActive
                          ? "bg-gradient-to-r from-primary/20 to-accent/15 text-primary hover:from-primary/25 hover:to-accent/20 shadow-lg border border-primary/20"
                          : "hover:bg-muted/80 hover:translate-x-1 hover:shadow-md",
                        isHovered && !isActive && "bg-muted/60 translate-x-1"
                      )}
                    >
                      <item.icon 
                        className={cn(
                          "h-5 w-5 mr-3 transition-all duration-300",
                          isActive ? "text-primary animate-gentle-bounce" : "text-muted-foreground group-hover:text-foreground",
                          isHovered && "scale-110"
                        )}
                        aria-hidden="true"
                      />
                      <span className={cn(
                        "transition-all duration-300",
                        isActive ? "font-semibold" : "font-medium",
                        isHovered && "scale-105"
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-scale-in shadow-lg" />
                      )}
                    </Button>
                  </Link>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        aria-label={item.ariaLabel}
                        aria-current={isActive ? "page" : undefined}
                        className="block"
                      >
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full h-11 p-0 transition-all duration-300 hover-lift focus-ring",
                            isActive
                              ? "bg-gradient-to-r from-primary/20 to-accent/15 text-primary shadow-lg border border-primary/20"
                              : "hover:bg-muted/80 hover:shadow-md"
                          )}
                        >
                          <item.icon 
                            className={cn(
                              "h-5 w-5 transition-all duration-300",
                              isActive ? "text-primary animate-gentle-bounce" : "text-muted-foreground group-hover:text-foreground"
                            )}
                            aria-hidden="true"
                          />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t border-border/60 animate-fade-in bg-gradient-to-br from-muted/20 to-accent/5 transition-all duration-500"
        )}>
          {shouldShowExpanded ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Mode sombre</span>
                <DarkModeToggle />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Version <span className="text-primary font-semibold">1.0.0</span>
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <DarkModeToggle />
              <div className="text-xs text-muted-foreground font-semibold">v1.0</div>
            </div>
          )}
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default EnhancedDesktopNavigation;