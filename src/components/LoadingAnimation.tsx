
import React from 'react';
import { cn } from '@/lib/utils';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-accent/20">
      <div className="flex flex-col items-center space-y-8 animate-scale-in">
        {/* Logo animé */}
        <div className="relative animate-float">
          {/* Cercle principal pulsant */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-gradient-shift shadow-2xl" style={{boxShadow: '0 0 30px hsl(var(--primary))'}}></div>
          
          {/* Cercles orbitaux */}
          <div className="absolute inset-0 animate-spin">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-4 h-4 rounded-full bg-primary animate-gentle-bounce"></div>
            </div>
          </div>
          
          <div className="absolute inset-0 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
              <div className="w-3 h-3 rounded-full bg-accent animate-gentle-bounce"></div>
            </div>
          </div>
          
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s' }}>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
              <div className="w-2 h-2 rounded-full bg-primary/70 animate-gentle-bounce"></div>
            </div>
          </div>
          
          {/* Icône de bar au centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl animate-gentle-bounce">🍸</div>
          </div>
        </div>
        {/* Texte BarFlowTrack avec animation */}
        <div className="text-center animate-fade-in-up">
          <h1 className="text-5xl font-bold text-shimmer mb-3">
            BarFlowTrack
          </h1>
          <div className="flex space-x-1 justify-center">
            {['C', 'h', 'a', 'r', 'g', 'e', 'm', 'e', 'n', 't', '.', '.', '.'].map((letter, index) => (
              <span
                key={index}
                className={cn(
                  "text-muted-foreground text-sm animate-gentle-bounce animate-text-shimmer",
                  "inline-block"
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '2s'
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
        
        {/* Barre de progression réelle */}
        <div className="w-80 h-4 bg-muted rounded-full overflow-hidden animate-fade-in-up">
          <div className="h-full rounded-full animate-progress-flow shadow-lg"></div>
        </div>
        
        {/* Bulles flottantes améliorées */}
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
            ></div>
          ))}
        </div>

        {/* Effet de particules */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
