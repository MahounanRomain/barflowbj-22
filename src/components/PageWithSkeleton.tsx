
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  DashboardPageSkeleton,
  InventoryPageSkeleton,
  SalesPageSkeleton,
  StaffPageSkeleton,
  ReportsPageSkeleton,
  AnalyticsPageSkeleton,
  SettingsPageSkeleton,
  PageSkeleton
} from '@/components/ui/page-skeleton';

interface PageWithSkeletonProps {
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  isLoading?: boolean;
}

export const PageWithSkeleton: React.FC<PageWithSkeletonProps> = ({ 
  children,
  skeleton,
  isLoading = false
}) => {
  const location = useLocation();

  const getSkeletonForRoute = () => {
    // If a custom skeleton is provided, use it
    if (skeleton) {
      return skeleton;
    }

    // Otherwise, use the default skeleton for the route
    switch (location.pathname) {
      case '/':
        return <DashboardPageSkeleton />;
      case '/inventory':
        return <InventoryPageSkeleton />;
      case '/sales':
        return <SalesPageSkeleton />;
      case '/staff':
        return <StaffPageSkeleton />;
      case '/reports':
        return <ReportsPageSkeleton />;
      case '/analytics':
        return <AnalyticsPageSkeleton />;
      case '/settings':
        return <SettingsPageSkeleton />;
      default:
        return <PageSkeleton />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ transition: 'none' }} key={`skeleton-${location.pathname}`}>
        {getSkeletonForRoute()}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ transition: 'none' }} key={`content-${location.pathname}`}>
      {children}
    </div>
  );
};
