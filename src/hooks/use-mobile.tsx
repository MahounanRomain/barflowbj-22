
import React, { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Vérification initiale côté client uniquement
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }, 16); // ~60fps debounce
    };

    // Media query listener pour une réactivité optimale (sans accès direct aux dimensions)
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Fonction de callback pour les changements
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Vérification initiale uniquement via media query
    setIsMobile(mediaQuery.matches);
    
    // Écoute des changements de media query (plus performant que resize)
    mediaQuery.addEventListener('change', handleChange);
    
    // Fallback avec resize listener débounced
    window.addEventListener('resize', debouncedCheck);

    return () => {
      clearTimeout(timeoutId);
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', debouncedCheck);
    };
  }, [])

  return isMobile
}
