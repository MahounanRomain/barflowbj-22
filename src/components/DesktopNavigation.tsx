
import React from "react";
import { Home, ShoppingCart, Package, Users, Settings, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DarkModeToggle from "@/components/DarkModeToggle";

const DesktopNavigation = () => {
  const location = useLocation();

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
      className="w-64 bg-card/95 backdrop-blur-lg border-r border-border/60 flex flex-col h-screen sticky top-0 glass-effect animate-slide-in-left shadow-xl"
      role="navigation"
      aria-label="Navigation principale"
    >
      {/* Header */}
      <div className="p-6 border-b border-border/60 animate-fade-in bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-primary rounded-xl flex items-center justify-center shadow-lg hover-glow transition-smooth animate-gentle-bounce">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              BarFlow
            </h1>
            <p className="text-xs text-muted-foreground font-medium">by Romain Sergio</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2 animate-fade-in-up">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-slide-in-right"
            >
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 transition-smooth hover-lift focus-ring ${
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-accent/15 text-primary hover:from-primary/25 hover:to-accent/20 shadow-lg border border-primary/20"
                    : "hover:bg-muted/80 hover:translate-x-1 hover:shadow-md"
                }`}
              >
                <item.icon 
                  className={`h-5 w-5 mr-3 transition-smooth ${
                    isActive ? "text-primary animate-gentle-bounce" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                  aria-hidden="true"
                />
                <span className={`transition-smooth ${
                  isActive ? "font-semibold" : "font-medium"
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-scale-in shadow-lg" />
                )}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/60 animate-fade-in bg-gradient-to-br from-muted/20 to-accent/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-medium">Mode sombre</span>
          <DarkModeToggle />
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Version <span className="text-primary font-semibold">1.0.0</span>
          </p>
        </div>
      </div>
    </nav>
  );
};

export default DesktopNavigation;
