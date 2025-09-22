// Optimisations globales de performance pour l'application

// Lazy loading optimisé pour les images
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Préchargement des ressources critiques
export const preloadCriticalResources = () => {
  const criticalResources = [
    { href: '/api/dashboard-stats', as: 'fetch' },
    { href: '/api/inventory', as: 'fetch' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    document.head.appendChild(link);
  });
};

// Debounce optimisé
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

// Throttle optimisé
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

// Optimisation du rendu avec RAF
export const scheduleWork = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 1000 });
  } else {
    requestAnimationFrame(callback);
  }
};

// Nettoyage automatique du LocalStorage
export const cleanupStorage = () => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours
  const now = Date.now();

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('temp_')) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        if (item.timestamp && (now - item.timestamp) > maxAge) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    }
  }
};

// Optimisation des animations CSS
export const optimizeAnimations = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    document.documentElement.style.setProperty('--transition-duration', '0.01ms');
  }
};

// Bundle des optimisations au démarrage
export const initializeOptimizations = () => {
  // Exécuter les optimisations en arrière-plan
  scheduleWork(() => {
    lazyLoadImages();
    preloadCriticalResources();
    cleanupStorage();
    optimizeAnimations();
  });
};