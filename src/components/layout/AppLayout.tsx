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
import GlobalSearch from '@/components/features/GlobalSearch';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
  return <A11yProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop Navigation Sidebar */}
        {!isMobile && !isNotFoundPage && <EnhancedDesktopNavigation />}
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-h-screen ${!isMobile && !isNotFoundPage ? 'ml-0' : 'w-full'}`}>
          {/* Desktop Header - Only for non-dashboard pages */}
          {!isMobile && !isNotFoundPage && location.pathname !== '/'}
          
          {/* Page Content */}
          <main className={`flex-1 bg-gradient-to-br from-primary/20 via-accent/15 to-bar-purple/20 ${isMobile && !isNotFoundPage ? "pb-24" : ""} ${!isMobile ? 'min-h-[calc(100vh)]' : 'min-h-[calc(100vh-5rem)]'}`} id="main-content" tabIndex={-1}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          
          {/* Mobile Bottom Navigation */}
          {isMobile && !isNotFoundPage && <GlassmorphicBottomNav />}
        </div>
        
        {/* Accessibility & Performance Tools */}
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <KeyboardShortcuts />
        <PerformanceMonitor />
      </div>
    </A11yProvider>;
};
export default AppLayout;