
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Track visited pages across the app session
const visitedPages = new Set<string>();

export const useSkeletonLoading = (isDataLoaded?: boolean) => {
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(true);
  const location = useLocation();
  const previousPathnameRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathnameRef.current;

    // Only show skeleton if this page hasn't been visited yet
    if (currentPath !== previousPath) {
      if (!visitedPages.has(currentPath)) {
        setIsSkeletonLoading(true);
      } else {
        setIsSkeletonLoading(false);
      }
    }

    previousPathnameRef.current = currentPath;
  }, [location.pathname]);

  // Hide skeleton when data is loaded
  useEffect(() => {
    if (isDataLoaded !== undefined) {
      if (isDataLoaded) {
        const isFirstVisit = !visitedPages.has(location.pathname);
        
        // Mark page as visited
        visitedPages.add(location.pathname);
        
        // Show skeleton for minimum time on first visit
        if (isFirstVisit) {
          const timer = setTimeout(() => {
            setIsSkeletonLoading(false);
          }, 1200);
          return () => clearTimeout(timer);
        } else {
          setIsSkeletonLoading(false);
        }
      } else {
        setIsSkeletonLoading(true);
      }
    }
  }, [isDataLoaded, location.pathname]);

  return isSkeletonLoading;
};
