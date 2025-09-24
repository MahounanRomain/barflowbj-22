
import React, { useState, useCallback, useRef, useEffect } from 'react';

export const useMicroInteractions = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const triggerInteraction = useCallback((type: string, duration = 150) => {
    setIsInteracting(true);
    setInteractionType(type);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      setInteractionType(null);
    }, duration);
  }, []);

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const createRippleEffect = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    // Use requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.className = 'absolute rounded-full bg-current opacity-30 animate-ping pointer-events-none';

      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isInteracting,
    interactionType,
    triggerInteraction,
    hapticFeedback,
    createRippleEffect
  };
};
