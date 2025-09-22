
import { useState, useEffect } from "react"

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
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Media query listener pour une réactivité optimale
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Fonction de callback pour les changements
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    // Vérification initiale
    checkIsMobile()
    
    // Écoute des changements de media query (plus performant que resize)
    mediaQuery.addEventListener('change', handleChange)
    
    // Fallback avec resize listener
    window.addEventListener('resize', checkIsMobile)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  return isMobile
}
