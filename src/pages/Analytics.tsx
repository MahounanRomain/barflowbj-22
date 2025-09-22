
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import DarkModeToggle from "@/components/DarkModeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockPredictions from "@/components/analytics/StockPredictions";
import ProfitabilityAnalysis from "@/components/analytics/ProfitabilityAnalysis";
import PeriodComparison from "@/components/analytics/PeriodComparison";
import SmartAlertsCenter from "@/components/analytics/SmartAlertsCenter";
import ConsolidatedKPIs from "@/components/analytics/ConsolidatedKPIs";
import AccountingExport from "@/components/analytics/AccountingExport";
import { PageWithSkeleton } from "@/components/PageWithSkeleton";
import { useSkeletonLoading } from "@/hooks/useSkeletonLoading";
import { DateFilter } from "@/components/analytics/EnhancedDateFilter";
import ScreenOrientationDemo from "@/components/ScreenOrientationDemo";

const Analytics = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isSkeletonLoading = useSkeletonLoading(isDataLoaded);
  
  // Gestion des filtres de date pour synchroniser avec TradingChart
  const [currentFilter, setCurrentFilter] = useState<DateFilter>({
    type: 'preset',
    preset: '30d',
    label: '30 derniers jours'
  });

  const handleFilterChange = (filter: DateFilter) => {
    setCurrentFilter(filter);
  };

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setIsDataLoaded(true);
    }, 500);
  }, []);

  return (
    <PageWithSkeleton isLoading={isSkeletonLoading}>
      <div className="mobile-container bg-gradient-to-br from-background via-background to-accent/5">
        <Header 
          title="Analytics Avancées"
          rightContent={<DarkModeToggle />}
        />

        <ScrollArea className="flex-1 h-[calc(100vh-140px)]">
          <main className="px-4 py-6 space-y-6">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="w-full grid grid-cols-7 h-auto p-1">
                <TabsTrigger value="dashboard" className="text-xs px-1 py-2 min-w-0">
                  <span className="truncate">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="predictions" className="text-xs px-1 py-2 min-w-0">
                  <span className="truncate">Prédictions</span>
                </TabsTrigger>
                <TabsTrigger value="profitability" className="text-xs px-1 py-2 min-w-0">
                  <span className="truncate">Rentabilité</span>
                </TabsTrigger>
                <TabsTrigger value="comparison" className="text-xs px-1 py-2 min-w-0">
                  <span className="truncate">Comparaison</span>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="text-xs px-1 py-2 min-w-0">
                  <span className="truncate">Alertes</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="text-xs px-1 py-2 min-w-0">
                  <span className="truncate">Export</span>
                </TabsTrigger>
                <TabsTrigger value="demo" className="text-xs px-1 py-2 min-w-0">
                  <span className="truncate">Demo</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-6 mt-6">
                <ConsolidatedKPIs 
                  initialFilter={currentFilter}
                  onFilterChange={handleFilterChange}
                />
              </TabsContent>
              
              <TabsContent value="predictions" className="mt-6">
                <StockPredictions />
              </TabsContent>
              
              <TabsContent value="profitability" className="mt-6">
                <ProfitabilityAnalysis />
              </TabsContent>
              
              <TabsContent value="comparison" className="mt-6">
                <PeriodComparison dateFilter={currentFilter} />
              </TabsContent>
              
              <TabsContent value="alerts" className="mt-6">
                <SmartAlertsCenter />
              </TabsContent>
              
              <TabsContent value="export" className="mt-6">
                <AccountingExport />
              </TabsContent>

              <TabsContent value="demo" className="mt-6">
                <ScreenOrientationDemo />
              </TabsContent>
            </Tabs>

            {/* Espace pour la navigation */}
            <div className="h-8"></div>
          </main>
        </ScrollArea>
      </div>
    </PageWithSkeleton>
  );
};

export default Analytics;
