import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="mobile-container bg-gradient-to-br from-background via-background to-accent/5">
      <div className="content-layout px-4 py-6">
        {/* Welcome section skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stats cards skeleton - Mobile optimized layout */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Other sections skeleton */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
