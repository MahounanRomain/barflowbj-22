import React, { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedDesktopNavigation from '@/components/EnhancedDesktopNavigation';
import GlassmorphicBottomNav from '@/components/GlassmorphicBottomNav';
import Header from '@/components/Header';
import { A11yProvider } from '@/components/accessibility/A11yProvider';
import KeyboardShortcuts from '@/components/accessibility/KeyboardShortcuts';
import PerformanceMonitor from '@/components/performance/PerformanceMonitor';
import PerformanceOptimizer from '@/components/performance/PerformanceOptimizer';
import DataMigration from '@/components/DataMigration';
import GlobalSearch from '@/components/features/GlobalSearch';
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';
import { logger } from '@/lib/errorLogger';
interface AppLayoutProps {
  children: ReactNode;
}
const AppLayout: React.FC<AppLayoutProps> = ({
  children
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isNotFoundPage = !['/', '/sales', '/inventory', '/staff', '/reports', '/settings'].includes(location.pathname);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Log app initialization
  useEffect(() => {
    logger.info('App layout initialized', {
      isMobile,
      currentPath: location.pathname,
      userAgent: navigator.userAgent,
    });
  }, [isMobile, location.pathname]);

  // Global error handler for uncaught errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.critical('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
      }, new Error(event.reason));
    };

    const handleError = (event: ErrorEvent) => {
      logger.critical('Global error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, new Error(event.message));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <GlobalErrorBoundary
      onError={(error, errorInfo) => {
        logger.critical('React Error Boundary triggered', {
          componentStack: errorInfo.componentStack,
        }, error);
      }}
    >
      <A11yProvider>
        <div className="flex min-h-screen w-full bg-background">
          {/* Desktop Navigation Sidebar */}
          {!isMobile && !isNotFoundPage && (
            <nav role="navigation" aria-label="Navigation principale">
              <EnhancedDesktopNavigation />
            </nav>
          )}
          
          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col min-h-screen ${!isMobile && !isNotFoundPage ? 'ml-0' : 'w-full'}`}>
            {/* Desktop Header - Only for non-dashboard pages */}
            {!isMobile && !isNotFoundPage && location.pathname !== '/'}
            
            {/* Page Content */}
            <main 
              className={`flex-1 ${isMobile && !isNotFoundPage ? "pb-24" : ""} ${!isMobile ? 'min-h-[calc(100vh)]' : 'min-h-[calc(100vh-5rem)]'}`} 
              id="main-content" 
              tabIndex={-1}
              role="main"
              aria-label="Contenu principal"
            >
              <GlobalErrorBoundary>
                {children}
              </GlobalErrorBoundary>
            </main>
            
            {/* Mobile Bottom Navigation */}
            {isMobile && !isNotFoundPage && (
              <nav role="navigation" aria-label="Navigation mobile" className="fixed bottom-0 left-0 right-0 z-50">
                <GlassmorphicBottomNav />
              </nav>
            )}
          </div>
          
          {/* Accessibility & Performance Tools */}
          <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <KeyboardShortcuts />
          <PerformanceMonitor />
          <PerformanceOptimizer />
          <DataMigration onMigrationComplete={() => logger.info('Data migration completed')} />
        </div>
      </A11yProvider>
    </GlobalErrorBoundary>
  );
};
export default AppLayout;