import React from 'react';
import { logger } from '@/lib/errorLogger';
import { toast } from '@/hooks/use-toast';

// Hook for handling errors in components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    logger.error(`Component error ${context ? `in ${context}` : ''}`, {
      context,
      component: context,
    }, error);

    toast({
      title: "Une erreur s'est produite",
      description: "Veuillez réessayer ou rafraîchir la page.",
      variant: "destructive",
    });
  }, []);

  const handleAsyncError = React.useCallback(async (
    asyncOperation: () => Promise<any>,
    context?: string
  ) => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, context);
      throw error; // Re-throw for component to handle if needed
    }
  }, [handleError]);

  const handleFormError = React.useCallback((errors: Record<string, any>, formName?: string) => {
    const errorMessages = Object.values(errors).flat();
    logger.warn(`Form validation error ${formName ? `in ${formName}` : ''}`, {
      formName,
      errors: errorMessages,
    });

    toast({
      title: "Erreur de validation",
      description: "Veuillez vérifier les champs du formulaire.",
      variant: "destructive",
    });
  }, []);

  return {
    handleError,
    handleAsyncError,
    handleFormError,
  };
};

// Hook for safe async operations
export const useSafeAsync = () => {
  const { handleAsyncError } = useErrorHandler();

  const safeAsync = React.useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      context?: string;
      showToast?: boolean;
      fallback?: T;
    }
  ): Promise<T | undefined> => {
    try {
      const startTime = Date.now();
      const result = await operation();
      
      // Track performance
      const duration = Date.now() - startTime;
      if (duration > 500) {
        logger.debug(`Async operation completed`, {
          context: options?.context,
          duration,
        });
      }
      
      return result;
    } catch (error) {
      if (options?.showToast !== false) {
        handleAsyncError(operation, options?.context);
      } else {
        logger.error(`Silent async error ${options?.context ? `in ${options.context}` : ''}`, {}, error as Error);
      }
      return options?.fallback;
    }
  }, [handleAsyncError]);

  return { safeAsync };
};

// Hook for error recovery
export const useErrorRecovery = () => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRecovering, setIsRecovering] = React.useState(false);

  const retry = React.useCallback(async (
    operation: () => Promise<any>,
    maxRetries = 3,
    context?: string
  ) => {
    if (retryCount >= maxRetries) {
      logger.error(`Max retries exceeded for ${context || 'operation'}`, {
        context,
        retryCount,
        maxRetries,
      });
      toast({
        title: "Erreur persistante",
        description: "L'opération a échoué plusieurs fois. Veuillez rafraîchir la page.",
        variant: "destructive",
      });
      return;
    }

    setIsRecovering(true);
    try {
      await operation();
      setRetryCount(0); // Reset on success
      logger.info(`Recovery successful after ${retryCount} retries`, { context, retryCount });
    } catch (error) {
      setRetryCount(prev => prev + 1);
      logger.warn(`Retry ${retryCount + 1} failed for ${context || 'operation'}`, {
        context,
        retryCount: retryCount + 1,
        error: error
      });
      
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      setTimeout(() => retry(operation, maxRetries, context), delay);
    } finally {
      setIsRecovering(false);
    }
  }, [retryCount]);

  const reset = React.useCallback(() => {
    setRetryCount(0);
    setIsRecovering(false);
  }, []);

  return {
    retry,
    reset,
    retryCount,
    isRecovering,
  };
};