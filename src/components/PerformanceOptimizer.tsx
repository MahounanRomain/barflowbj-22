
import React, { memo, useState, useEffect, ReactNode, FC } from 'react';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { useIsMobile } from '@/hooks/use-mobile';

interface PerformanceOptimizerProps {
  children: ReactNode;
}

export const PerformanceOptimizer: FC<PerformanceOptimizerProps> = memo(({ 
  children 
}) => {
  const { optimizeCache, prefetchData } = useOptimizedCache();
  const isMobile = useIsMobile();
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Optimisation du cache toutes les 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      optimizeCache({
        key: 'auto-cleanup',
        cacheTime: 600000, // 10 minutes
        staleTime: 120000,  // 2 minutes
      });
    }, 600000);

    return () => clearInterval(interval);
  }, [optimizeCache]);

  // Préchargement intelligent des données critiques
  useEffect(() => {
    const prefetchCriticalData = async () => {
      setIsOptimizing(true);
      try {
        await prefetchData([
          'dashboard-stats',
          'inventory-items',
          'sales-data',
          'staff-data'
        ]);
      } finally {
        setTimeout(() => setIsOptimizing(false), 1000);
      }
    };

    const timer = setTimeout(prefetchCriticalData, 1500);
    return () => clearTimeout(timer);
  }, [prefetchData]);

  // Optimisations spécifiques mobile
  useEffect(() => {
    if (isMobile) {
      // Réduire les animations sur mobile pour économiser la batterie
      document.documentElement.style.setProperty('--animation-duration', '0.15s');
      
      // Observer les changements de visibilité
      const handleVisibilityChange = () => {
        if (document.hidden) {
          document.body.style.animationPlayState = 'paused';
        } else {
          document.body.style.animationPlayState = 'running';
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
    }
  }, [isMobile]);

  // Optimisations générales de performance
  useEffect(() => {
    // Préchargement des polices
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.as = 'font';
    fontPreload.type = 'font/woff2';
    fontPreload.crossOrigin = 'anonymous';
    document.head.appendChild(fontPreload);

    // Optimisation des images lazy loading
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-src]') as NodeListOf<HTMLImageElement>;
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    }

    return () => {
      if (fontPreload.parentNode) {
        fontPreload.parentNode.removeChild(fontPreload);
      }
    };
  }, []);

  return (
    <div className="contents">
      {children}
    </div>
  );
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';
