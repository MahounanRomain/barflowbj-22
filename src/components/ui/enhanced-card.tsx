import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface EnhancedCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  loading?: boolean;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  description,
  children,
  className,
  icon,
  badge,
  actions,
  variant = 'default',
  size = 'md',
  hoverable = true,
  loading = false
}) => {
  const variants = {
    default: 'bg-card border border-border',
    elevated: 'bg-card border border-border shadow-lg hover:shadow-xl',
    glass: 'bg-card/80 backdrop-blur-lg border border-border/60',
    gradient: 'bg-gradient-to-br from-card via-card to-accent/10 border border-border'
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <Card className={cn(
      'transition-all duration-300',
      variants[variant],
      hoverable && 'hover:scale-[1.02] hover:-translate-y-1',
      loading && 'animate-pulse pointer-events-none',
      className
    )}>
      <CardHeader className={cn(
        'flex flex-row items-center justify-between space-y-0',
        sizes[size]
      )}>
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {title}
              {badge}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </CardHeader>
      
      <CardContent className={cn('pt-0', sizes[size])}>
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-shimmer rounded" />
            <div className="h-4 bg-muted animate-shimmer rounded w-3/4" />
            <div className="h-4 bg-muted animate-shimmer rounded w-1/2" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedCard;