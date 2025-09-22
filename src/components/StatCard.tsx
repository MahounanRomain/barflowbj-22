
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  bgGradient?: string;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  bgGradient = "gradient-primary",
  className,
  onClick,
  clickable = false
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getTrendBg = () => {
    switch (trend) {
      case "up":
        return "bg-success/10";
      case "down":
        return "bg-destructive/10";
      default:
        return "bg-muted/10";
    }
  };

  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-card via-card to-accent/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-border/50 flex flex-col shadow-lg transition-all duration-300 group min-h-[100px] sm:min-h-[120px]",
        "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
        "animate-fade-in",
        clickable && "cursor-pointer hover:border-primary/30 active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={cn(
          "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 flex-shrink-0",
          "group-hover:scale-110 group-hover:rotate-3",
          iconColor.includes("gradient") ? iconColor : `bg-gradient-to-br from-${iconColor.replace("text-", "")}-500/10 to-${iconColor.replace("text-", "")}-500/5`
        )}>
          <Icon className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-all duration-300",
            iconColor,
            "group-hover:drop-shadow-lg"
          )} />
        </div>
        {change && (
          <div className={cn(
            "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium transition-all duration-300 flex-shrink-0",
            "animate-pulse-subtle",
            getTrendBg(),
            getTrendColor()
          )}>
            {change}
          </div>
        )}
      </div>
      
      <div className="space-y-1 min-w-0 flex-1">
        <p className="text-muted-foreground text-xs sm:text-sm font-medium truncate transition-colors duration-300 group-hover:text-muted-foreground/80">
          {title}
        </p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground transition-all duration-300 group-hover:text-primary truncate group-hover:scale-105">
          {value}
        </p>
      </div>
      
      {clickable && (
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
