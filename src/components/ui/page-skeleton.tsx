
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';

interface PageSkeletonProps {
  showHeader?: boolean;
  showStats?: boolean;
  showTabs?: boolean;
  showList?: boolean;
  itemCount?: number;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  showHeader = true,
  showStats = false,
  showTabs = false,
  showList = true,
  itemCount = 6
}) => {
  return (
    <div className="mobile-container bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {showHeader && (
        <Header rightContent={<Skeleton className="h-8 w-24" />} />
      )}

      <main className="px-4 py-6 space-y-6 pb-24">
        {/* Page title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stats cards if needed */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs if needed */}
        {showTabs && (
          <div className="bg-muted/50 rounded-lg p-1">
            <div className="grid grid-cols-4 gap-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* List items */}
        {showList && (
          <div className="space-y-3">
            {[...Array(itemCount)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Skeletons spécifiques pour chaque page
export const DashboardPageSkeleton = () => (
  <PageSkeleton showStats={true} showList={false} />
);

export const InventoryPageSkeleton = () => (
  <PageSkeleton showStats={true} showTabs={true} itemCount={8} />
);

export const SalesPageSkeleton = () => (
  <PageSkeleton showStats={true} itemCount={6} />
);

export const StaffPageSkeleton = () => (
  <PageSkeleton showList={true} itemCount={5} />
);

export const ReportsPageSkeleton = () => (
  <PageSkeleton showStats={true} showList={false} />
);

export const AnalyticsPageSkeleton = () => (
  <PageSkeleton showStats={true} showTabs={true} showList={false} />
);

export const SettingsPageSkeleton = () => (
  <PageSkeleton showList={false} />
);
