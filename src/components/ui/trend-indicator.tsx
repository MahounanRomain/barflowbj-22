import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  data: number[];
  label?: string;
  className?: string;
  showPercentage?: boolean;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ 
  data, 
  label = "Tendance", 
  className,
  showPercentage = true 
}) => {
  if (!data || data.length < 2) {
    return null;
  }

  // Calculer la tendance moyenne
  const calculateTrend = () => {
    const validData = data.filter(val => val !== null && val !== undefined && !isNaN(val));
    if (validData.length < 2) return { type: 'stable', percentage: 0 };

    // Calculer la moyenne des 2 premières valeurs vs les 2 dernières
    const firstHalf = validData.slice(0, Math.ceil(validData.length / 2));
    const secondHalf = validData.slice(Math.floor(validData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    if (firstAvg === 0) return { type: 'stable', percentage: 0 };
    
    const percentageChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    let type: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentageChange) < 5) {
      type = 'stable';
    } else if (percentageChange > 0) {
      type = 'up';
    } else {
      type = 'down';
    }
    
    return { type, percentage: Math.abs(percentageChange) };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    switch (trend.type) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.type) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendText = () => {
    switch (trend.type) {
      case 'up':
        return 'Hausse';
      case 'down':
        return 'Baisse';
      default:
        return 'Stable';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
      "border bg-background/50 backdrop-blur-sm",
      getTrendColor(),
      className
    )}>
      {getTrendIcon()}
      <span className="text-foreground font-medium">{label}:</span>
      <span>{getTrendText()}</span>
      {showPercentage && trend.percentage > 0 && (
        <span className="text-xs opacity-75">
          ({trend.percentage.toFixed(1)}%)
        </span>
      )}
    </span>
  );
};

export default TrendIndicator;