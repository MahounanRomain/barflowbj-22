import React from 'react';
import { cn } from '@/lib/utils';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-accent/20">
      <div className="flex flex-col items-center space-y-8 animate-scale-in">
        {/* Logo animé */}
        <div className="relative animate-float">
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-gradient-shift shadow-2xl" style={{ boxShadow: '0 0 30px hsl(var(--primary))' }} />
          <div className="absolute inset-0 animate-spin">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-4 h-4 rounded-full bg-primary animate-gentle-bounce" />
            </div>
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
              <div className="w-3 h-3 rounded-full bg-accent animate-gentle-bounce" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl animate-gentle-bounce">🍸</div>
          </div>
        </div>

        {/* Texte */}
        <div className="text-center animate-fade-in-up">
          <h1 className="text-5xl font-bold text-shimmer mb-3">BarFlow</h1>
          <p className="text-muted-foreground text-sm">Préparation de votre espace…</p>
        </div>

        {/* Barre de progression */}
        <div className="w-80 h-4 bg-muted rounded-full overflow-hidden animate-fade-in-up">
          <div className="h-full rounded-full animate-progress-flow shadow-lg" />
        </div>

        {/* Bulles décoratives */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-float backdrop-blur-xs"
              style={{
                width: `${Math.random() * 12 + 8}px`,
                height: `${Math.random() * 12 + 8}px`,
                left: `${15 + i * 10 + Math.random() * 10}%`,
                top: `${25 + (i % 4) * 15 + Math.random() * 10}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${4 + i * 0.8}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
