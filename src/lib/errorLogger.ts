export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

class ErrorLogger {
  private sessionId: string;
  private maxLogs = 100;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
    };
  }

  private persistLog(logEntry: LogEntry) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only recent logs
      const recentLogs = existingLogs.slice(-this.maxLogs);
      localStorage.setItem('app_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to persist log:', error);
    }
  }

  debug(message: string, data?: any) {
    const logEntry = this.createLogEntry('debug', message, data);
    console.debug(message, data);
    this.persistLog(logEntry);
  }

  info(message: string, data?: any) {
    const logEntry = this.createLogEntry('info', message, data);
    console.info(message, data);
    this.persistLog(logEntry);
  }

  warn(message: string, data?: any) {
    const logEntry = this.createLogEntry('warn', message, data);
    console.warn(message, data);
    this.persistLog(logEntry);
  }

  error(message: string, data?: any, error?: Error) {
    const logEntry = this.createLogEntry('error', message, data, error);
    console.error(message, error, data);
    this.persistLog(logEntry);
  }

  critical(message: string, data?: any, error?: Error) {
    const logEntry = this.createLogEntry('critical', message, data, error);
    console.error('CRITICAL:', message, error, data);
    this.persistLog(logEntry);
    
    // For critical errors, also show toast
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title: "Erreur critique",
        description: "Une erreur critique s'est produite. Veuillez contacter le support.",
        variant: "destructive",
      });
    });
  }

  // Get logs for debugging or reporting
  getLogs(level?: LogLevel): LogEntry[] {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      if (level) {
        return logs.filter((log: LogEntry) => log.level === level);
      }
      return logs;
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  // Clear all logs
  clearLogs() {
    try {
      localStorage.removeItem('app_logs');
      this.info('Logs cleared');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  // Export logs for support
  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}

// Global logger instance
export const logger = new ErrorLogger();

// Error handler functions
export const handleAsyncError = (error: Error, context?: string) => {
  logger.error(`Async error ${context ? `in ${context}` : ''}`, {
    context,
    isAsync: true,
  }, error);
};

export const handleApiError = (error: Error, endpoint?: string, method?: string) => {
  logger.error(`API error`, {
    endpoint,
    method,
    isApiError: true,
  }, error);
};

export const handleValidationError = (errors: string[], data?: any) => {
  logger.warn('Validation error', {
    validationErrors: errors,
    invalidData: data,
  });
};

export const handleStorageError = (error: Error, operation?: string) => {
  logger.error(`Storage error during ${operation || 'unknown operation'}`, {
    isStorageError: true,
    operation,
  }, error);
};

// Performance monitoring
export const trackPerformance = (name: string, startTime: number) => {
  const duration = Date.now() - startTime;
  logger.debug(`Performance: ${name}`, { duration, name });
  
  // Log slow operations
  if (duration > 1000) {
    logger.warn(`Slow operation detected: ${name}`, { duration, name });
  }
};

// User action tracking for debugging
export const trackUserAction = (action: string, data?: any) => {
  logger.info(`User action: ${action}`, { action, ...data });
};
