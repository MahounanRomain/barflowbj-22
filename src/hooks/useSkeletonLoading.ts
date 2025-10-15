
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSkeletonLoading = (isDataLoaded?: boolean) => {
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(true);
  const location = useLocation();
  const previousPathnameRef = useRef<string>('');
  const initialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathnameRef.current;

    // Show skeleton when navigating to a different page or on initial load
    if (currentPath !== previousPath || initialLoadRef.current) {
      setIsSkeletonLoading(true);
      initialLoadRef.current = false;
    }

    previousPathnameRef.current = currentPath;
  }, [location.pathname]);

  // Hide skeleton when data is loaded with minimum display time for better UX
  useEffect(() => {
    if (isDataLoaded !== undefined) {
      if (isDataLoaded) {
        // Ensure skeleton is visible for at least 1200ms for better user experience
        const timer = setTimeout(() => {
          setIsSkeletonLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        setIsSkeletonLoading(true);
      }
    }
  }, [isDataLoaded]);

  return isSkeletonLoading;
};
