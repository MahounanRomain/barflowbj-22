import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import DarkModeToggle from "@/components/DarkModeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import CashFlowOverview from "@/components/CashFlowOverview";
import QuickSalesAnalytics from "@/components/QuickSalesAnalytics";
import SmartSuggestions from "@/components/SmartSuggestions";
import DashboardWelcome from "@/components/dashboard/DashboardWelcome";
import EnhancedDashboardStats from "@/components/dashboard/EnhancedDashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { PageWithSkeleton } from "@/components/PageWithSkeleton";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSkeletonLoading } from "@/hooks/useSkeletonLoading";
import { useLocalData } from "@/hooks/useLocalData";
import { useDailyReset } from "@/hooks/useDailyReset";
const DashboardContent = () => {
  const isMobile = useIsMobile();
  return <div className={`${isMobile ? 'mobile-container' : 'desktop-container'} bg-gradient-to-br from-background via-background to-accent/5 animate-fade-in overflow-hidden`}>
      {isMobile && <Header rightContent={<DarkModeToggle />} />}

      {/* Desktop Dashboard Header */}
      {!isMobile}

      <ScrollArea className={`flex-1 ${isMobile ? 'h-[calc(100vh-140px)]' : 'h-[calc(100vh-6rem)]'}`}>
        <main className={`content-layout ${isMobile ? 'px-4 py-6' : 'px-8 py-8 max-w-7xl mx-auto'} relative`}>
          {/* Background animated elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-20 w-72 h-72 bg-primary/5 rounded-full animate-float blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full animate-gentle-bounce blur-3xl" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-success/5 rounded-full animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Content with enhanced animations */}
          <div className="relative z-10">
            {/* Section de bienvenue */}
            <div className="hover-lift" style={{ contentVisibility: 'auto' }}>
              <DashboardWelcome />
            </div>

            {/* Statistiques principales améliorées */}
            <div className={`${isMobile ? 'grid grid-cols-2 gap-3 mb-6' : 'stats-grid'} animate-fade-in-up`} style={{
              '--stagger': 1
            } as React.CSSProperties}>
              <EnhancedDashboardStats />
            </div>

            {/* Sections fonctionnelles - Optimisées pour desktop */}
            <div className={`${isMobile ? 'space-y-6' : 'dashboard-grid'} stagger-animation`}>
              <div className={`${!isMobile ? 'lg:col-span-2' : ''} animate-slide-in-left card-hover`} style={{
                '--stagger': 2
              } as React.CSSProperties}>
                <CashFlowOverview />
              </div>
              <div className="animate-slide-in-right card-hover" style={{
                '--stagger': 3
              } as React.CSSProperties}>
                <QuickSalesAnalytics />
              </div>
              <div className={`${!isMobile ? 'lg:col-span-2' : ''} animate-slide-in-left card-hover`} style={{
                '--stagger': 4
              } as React.CSSProperties}>
                <SmartSuggestions />
              </div>
              <div className="animate-slide-in-right card-hover" style={{
                '--stagger': 5
              } as React.CSSProperties}>
                <RecentActivity />
              </div>
            </div>

            {/* Espace pour la navigation mobile */}
            {isMobile && <div className="h-8"></div>}
          </div>
        </main>
      </ScrollArea>
    </div>;
};
const Dashboard = () => {
  const {
    getInventory,
    getSales,
    getStaff
  } = useLocalData();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Handle daily reset for dashboard
  useDailyReset();
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all dashboard data
        getInventory();
        getSales();
        getStaff();
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setIsDataLoaded(true);
      }
    };
    loadData();
  }, [getInventory, getSales, getStaff]);
  const isSkeletonLoading = useSkeletonLoading(isDataLoaded);
  return <PageWithSkeleton isLoading={isSkeletonLoading} skeleton={<DashboardSkeleton />}>
      <DashboardContent />
    </PageWithSkeleton>;
};
export default Dashboard;