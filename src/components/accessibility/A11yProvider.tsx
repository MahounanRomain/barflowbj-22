import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface A11yState {
  reduceMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  keyboardNavigation: boolean;
}

interface A11yContextType {
  state: A11yState;
  updateState: (updates: Partial<A11yState>) => void;
  announceToScreenReader: (message: string) => void;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within A11yProvider');
  }
  return context;
};

interface A11yProviderProps {
  children: ReactNode;
}

export const A11yProvider: React.FC<A11yProviderProps> = ({ children }) => {
  const [state, setState] = useState<A11yState>({
    reduceMotion: false,
    highContrast: false,
    screenReader: false,
    fontSize: 'md',
    keyboardNavigation: false,
  });

  // Détecter les préférences système
  useEffect(() => {
    // Détection du mouvement réduit
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Détection du contraste élevé
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Détection des lecteurs d'écran
    const hasScreenReader = 'speechSynthesis' in window || navigator.userAgent.includes('NVDA') || navigator.userAgent.includes('JAWS');

    setState(prev => ({
      ...prev,
      reduceMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      screenReader: hasScreenReader,
    }));

    // Appliquer les classes CSS globales
    document.documentElement.classList.toggle('reduce-motion', prefersReducedMotion);
    document.documentElement.classList.toggle('high-contrast', prefersHighContrast);
  }, []);

  // Gérer la navigation clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setState(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      setState(prev => ({ ...prev, keyboardNavigation: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Appliquer les changements de taille de police
  useEffect(() => {
    const fontSizes = {
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px'
    };
    
    document.documentElement.style.fontSize = fontSizes[state.fontSize];
  }, [state.fontSize]);

  const updateState = (updates: Partial<A11yState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Annonce pour les lecteurs d'écran
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return (
    <A11yContext.Provider value={{ state, updateState, announceToScreenReader }}>
      <div 
        className={`
          ${state.keyboardNavigation ? 'keyboard-navigation' : ''}
          ${state.highContrast ? 'high-contrast' : ''}
          ${state.reduceMotion ? 'reduce-motion' : ''}
        `}
      >
        {children}
      </div>
    </A11yContext.Provider>
  );
};