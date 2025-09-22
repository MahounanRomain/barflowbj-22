
import * as React from 'react';
import { toast as sonnerToast } from 'sonner';
import { CheckCircle, AlertCircle, XCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
}

const getIcon = (variant: ToastOptions['variant']) => {
  switch (variant) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    case 'loading':
      return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    default:
      return null;
  }
};

const getVariantClasses = (variant: ToastOptions['variant']) => {
  switch (variant) {
    case 'success':
      return 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800';
    case 'error':
      return 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800';
    case 'info':
      return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800';
    case 'loading':
      return 'border-primary/20 bg-primary/5 dark:bg-primary/10';
    default:
      return 'border-border bg-background';
  }
};

export const enhancedToast = {
  success: (options: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.custom((t) => (
      <div className={cn(
        'flex items-start space-x-3 p-4 rounded-lg border shadow-lg animate-slide-in-right',
        getVariantClasses('success')
      )}>
        {getIcon('success')}
        <div className="flex-1 space-y-1">
          {options.title && (
            <p className="font-semibold text-sm text-foreground">{options.title}</p>
          )}
          {options.description && (
            <p className="text-sm text-muted-foreground">{options.description}</p>
          )}
        </div>
        {options.action && (
          <button
            onClick={() => {
              options.action?.onClick();
              sonnerToast.dismiss(t);
            }}
            className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            {options.action.label}
          </button>
        )}
      </div>
    ), { duration: options.duration });
  },

  error: (options: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.custom((t) => (
      <div className={cn(
        'flex items-start space-x-3 p-4 rounded-lg border shadow-lg animate-slide-in-right',
        getVariantClasses('error')
      )}>
        {getIcon('error')}
        <div className="flex-1 space-y-1">
          {options.title && (
            <p className="font-semibold text-sm text-foreground">{options.title}</p>
          )}
          {options.description && (
            <p className="text-sm text-muted-foreground">{options.description}</p>
          )}
        </div>
      </div>
    ), { duration: options.duration || 5000 });
  },

  loading: (options: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.custom((t) => (
      <div className={cn(
        'flex items-start space-x-3 p-4 rounded-lg border shadow-lg',
        getVariantClasses('loading')
      )}>
        {getIcon('loading')}
        <div className="flex-1 space-y-1">
          {options.title && (
            <p className="font-semibold text-sm text-foreground">{options.title}</p>
          )}
          {options.description && (
            <p className="text-sm text-muted-foreground">{options.description}</p>
          )}
        </div>
      </div>
    ), { duration: Infinity });
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  }
};
