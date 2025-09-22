import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Zap, Activity } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const variants = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning'
  };

  return (
    <Loader2 className={cn(
      'animate-spin',
      sizes[size],
      variants[variant],
      className
    )} />
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'avatar' | 'button' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text'
}) => {
  const variants = {
    text: 'h-4 w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
    card: 'h-32 w-full rounded-lg'
  };

  return (
    <div className={cn(
      'bg-muted animate-shimmer rounded',
      variants[variant],
      className
    )} />
  );
};

interface PulseLoaderProps {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  count = 3,
  size = 'md',
  color = 'bg-primary'
}) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            sizes[size],
            color
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'md',
  showPercentage = false,
  animated = true,
  className
}) => {
  const variants = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive'
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('space-y-2', className)}>
      {showPercentage && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{clampedProgress}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-muted rounded-full overflow-hidden',
        sizes[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variants[variant],
            animated && 'animate-progress-flow'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Chargement...',
  children
}) => {
  if (!visible) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-foreground font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};