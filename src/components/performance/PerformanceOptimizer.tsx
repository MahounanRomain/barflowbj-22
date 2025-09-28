import React, { useEffect, useMemo } from 'react';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { useIsMobile } from '@/hooks/use-mobile';

const PerformanceOptimizer: React.FC = () => {
  const { optimizeCache, prefetchData } = useOptimizedCache();
  const isMobile = useIsMobile();

  // Cache optimization - run every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      optimizeCache({
        key: 'app-cache',
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      });
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [optimizeCache]);

  // Prefetch critical data on mount
  useEffect(() => {
    const criticalData = [
      'dashboard-stats',
      'inventory-items',
      'sales-data',
      'staff-members',
      'categories'
    ];
    
    prefetchData(criticalData);
  }, [prefetchData]);

  // Mobile-specific optimizations
  useEffect(() => {
    if (isMobile) {
      // Reduce animation duration on mobile to save battery
      const style = document.createElement('style');
      style.textContent = `
        @media (max-width: 768px) {
          * {
            animation-duration: 0.15s !important;
            transition-duration: 0.15s !important;
          }
        }
      `;
      document.head.appendChild(style);

      // Pause animations when page is not visible
      const handleVisibilityChange = () => {
        if (document.hidden) {
          document.body.style.animationPlayState = 'paused';
        } else {
          document.body.style.animationPlayState = 'running';
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.head.removeChild(style);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isMobile]);

  // General performance optimizations
  useEffect(() => {
    // Preload fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    return () => {
      imageObserver.disconnect();
      if (document.head.contains(fontLink)) {
        document.head.removeChild(fontLink);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceOptimizer;