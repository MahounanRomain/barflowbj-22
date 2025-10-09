import { useEffect, useRef } from 'react';

export const useImageOptimization = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Lazy load images with intersection observer
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const dataSrc = img.getAttribute('data-src');
              
              if (dataSrc) {
                img.src = dataSrc;
                img.removeAttribute('data-src');
                observerRef.current?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );

      // Observe all images with data-src
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img) => observerRef.current?.observe(img));
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return observerRef;
};
