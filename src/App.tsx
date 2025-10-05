import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import StackedNotificationToast from "@/components/notifications/StackedNotificationToast";
import { PerformanceOptimizer } from "@/components/PerformanceOptimizer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "@/pages/Dashboard";
import LoadingAnimation from "@/components/LoadingAnimation";
import AppLayout from "@/components/layout/AppLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDailyReset } from "@/hooks/useDailyReset";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

// Lazy load non-critical routes for better performance
const Sales = React.lazy(() => import("@/pages/Sales"));
const Inventory = React.lazy(() => import("@/pages/Inventory"));
const Staff = React.lazy(() => import("@/pages/Staff"));
const Reports = React.lazy(() => import("@/pages/Reports"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));

// Lazy load navigation components
const DesktopNavigation = React.lazy(() => import("@/components/DesktopNavigation"));
const OfflineIndicator = React.lazy(() => import("@/components/OfflineIndicator"));
const PWAInstallPrompt = React.lazy(() => import("@/components/PWAInstallPrompt"));


function AppContent() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isNotFoundPage = location.pathname === '*' || !['/', '/sales', '/inventory', '/staff', '/reports', '/settings'].includes(location.pathname);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize daily reset and real-time sync
  // Temporarily commenting out hooks to debug
  // const { resetState } = useDailyReset();
  // const { syncState } = useRealtimeSync();

  // Handle initial loading animation and route preloading
  useEffect(() => {
    // Optimize initial load for better LCP
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setShowLoadingAnimation(false);
        setIsInitialLoad(false);
      }, 300); // Further reduced to 300ms for better Speed Index

      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  // Préchargement intelligent des routes
  useEffect(() => {
    if (!showLoadingAnimation) {
      const preloadRoutes = async () => {
        // Précharger les composants des routes principales
        const routes = [
          () => import('@/pages/Sales'),
          () => import('@/pages/Inventory'),
          () => import('@/pages/Staff'),
        ];
        
        // Immediate preloading for better performance
        routes.forEach(routeImport => {
          routeImport().catch(() => {
            // Ignore les erreurs de préchargement
          });
        });
      };

      // Start preloading immediately for better LCP
      preloadRoutes();
    }
  }, [showLoadingAnimation]);

  if (showLoadingAnimation) {
    return <LoadingAnimation />;
  }

  return (
    <ErrorBoundary>
      <PerformanceOptimizer>
        <div className="min-h-screen bg-background font-sans antialiased">
          <a 
            href="#main-content" 
            className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
            aria-label="Aller au contenu principal"
          >
            Aller au contenu principal
          </a>
          
          <AppLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppLayout>
          
          <Suspense fallback={null}>
            <PWAInstallPrompt />
            <OfflineIndicator />
          </Suspense>
          <Toaster />
          <SonnerToaster />
          <StackedNotificationToast />
        </div>
      </PerformanceOptimizer>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;