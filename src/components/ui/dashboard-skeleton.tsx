import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/Header';

export const DashboardSkeleton = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'mobile-container' : 'desktop-container'} bg-gradient-to-br from-background via-background to-accent/5 min-h-screen`} style={{ contain: 'layout' }}>
      {isMobile && <Header rightContent={<Skeleton className="h-8 w-24" />} />}
      
      <ScrollArea className={`flex-1 ${isMobile ? 'h-[calc(100vh-140px)]' : 'h-[calc(100vh-6rem)]'}`}>
        <main className={`${isMobile ? 'px-4 py-6' : 'px-8 py-8 max-w-7xl mx-auto'} min-h-[calc(100vh-8rem)]`}>
          {/* Welcome section skeleton - preserve exact dimensions */}
          <div className="mb-6 space-y-2" style={{ minHeight: '64px' }}>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats grid skeleton - preserve exact grid layout */}
          <div className={`${isMobile ? 'grid grid-cols-2 gap-3 mb-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'}`} style={{ minHeight: isMobile ? '120px' : '140px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border shadow-sm min-h-[100px]">
                <div className="flex items-center justify-between h-full">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Main content sections skeleton - preserve exact layout */}
          <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}`} style={{ minHeight: '600px' }}>
            {/* Cash flow section */}
            <div className={`${!isMobile ? 'lg:col-span-2' : ''} bg-card rounded-xl p-6 border shadow-sm`} style={{ minHeight: '300px' }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-40 w-full" />
              </div>
            </div>

            {/* Sales analytics */}
            <div className="bg-card rounded-xl p-6 border shadow-sm" style={{ minHeight: '280px' }}>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-32 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>

            {/* Suggestions section */}
            <div className={`${!isMobile ? 'lg:col-span-2' : ''} bg-card rounded-xl p-6 border shadow-sm`} style={{ minHeight: '260px' }}>
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-card rounded-xl p-6 border shadow-sm" style={{ minHeight: '240px' }}>
              <div className="space-y-4">
                <Skeleton className="h-6 w-36" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile spacing */}
          {isMobile && <div className="h-8"></div>}
        </main>
      </ScrollArea>
    </div>
  );
};

export const InventorySkeleton = () => {
  return (
    <div className="mobile-container">
      <div className="content-layout px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SalesSkeleton = () => {
  return (
    <div className="mobile-container">
      <div className="content-layout px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>

        {/* Sales list skeleton */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StaffSkeleton = () => {
  return (
    <div className="mobile-container">
      <div className="content-layout px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-28 mb-2" />
          <Skeleton className="h-4 w-52" />
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex-shrink-0">
                  <Skeleton className="w-12 h-6 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ReportsSkeleton = () => {
  return (
    <div className="mobile-container">
      <div className="content-layout px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Chart skeleton */}
        <div className="bg-card rounded-xl p-4 border shadow-sm mb-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>

        {/* Analytics cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>

        {/* List items */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SettingsSkeleton = () => {
  return (
    <div className="mobile-container">
      <div className="content-layout px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>

        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
              <Skeleton className="h-5 w-40 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
