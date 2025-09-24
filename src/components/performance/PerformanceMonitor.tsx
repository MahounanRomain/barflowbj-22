import React, { useEffect, useState, useRef } from 'react';
import { Activity, Zap, Clock, Cpu, Minimize2, Maximize2 } from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  fps: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    fps: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLongPress, setIsLongPress] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Afficher seulement en développement
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    const measurePerformance = () => {
      // Mesurer le temps de rendu
      const renderStart = performance.now();
      
      // Mesurer la mémoire (si disponible)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / (1024 * 1024) : 0;

      // Calculer FPS basique
      let fps = 0;
      let lastTime = performance.now();
      let frameCount = 0;

      const measureFPS = () => {
        const currentTime = performance.now();
        frameCount++;
        
        if (currentTime - lastTime >= 1000) {
          fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          frameCount = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(measureFPS);
      };
      
      measureFPS();

      const renderEnd = performance.now();
      
      setMetrics({
        renderTime: renderEnd - renderStart,
        memoryUsage: Math.round(memoryUsage),
        networkLatency: Math.round(Math.random() * 50 + 10), // Simulation
        fps
      });
    };

    const interval = setInterval(measurePerformance, 2000);
    measurePerformance();

    return () => clearInterval(interval);
  }, []);

  // Gestion du drag and drop
  useEffect(() => {
    let rafId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Use RAF to batch DOM reads/writes and prevent forced reflows
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Cache window dimensions to avoid repeated reads
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const maxX = windowWidth - (isExpanded ? 280 : 60);
        const maxY = windowHeight - (isExpanded ? 120 : 60);
        
        setPosition({
          x: Math.max(0, Math.min(maxX, newX)),
          y: Math.max(0, Math.min(maxY, newY))
        });
      });
    };

    const handleMouseUpGlobal = () => {
      setIsDragging(false);
      setIsLongPress(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, dragOffset, isExpanded]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Start long press timer for drag mode
    const timer = setTimeout(() => {
      setIsLongPress(true);
      if (bubbleRef.current) {
        const rect = bubbleRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        setIsDragging(true);
      }
    }, 500); // 500ms long press
    
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (!isLongPress && !isDragging) {
      // Simple click - toggle expansion
      setIsExpanded(!isExpanded);
    }
    
    setIsLongPress(false);
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPress(false);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={bubbleRef}
      className={`fixed z-50 select-none transition-all duration-300 ${
        isDragging 
          ? 'cursor-grabbing' 
          : isLongPress 
            ? 'cursor-grab' 
            : 'cursor-pointer'
      } ${
        isExpanded 
          ? 'bg-card/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-xl' 
          : 'bg-primary/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-primary hover:scale-105'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isExpanded ? 'auto' : '48px',
        height: isExpanded ? 'auto' : '48px'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {isExpanded ? (
        <>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Performance</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <Minimize2 className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs min-w-[260px]">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-muted-foreground">Render:</span>
              <span className="font-mono">{metrics.renderTime.toFixed(1)}ms</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-green-500" />
              <span className="text-muted-foreground">RAM:</span>
              <span className="font-mono">{metrics.memoryUsage}MB</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-muted-foreground">Network:</span>
              <span className="font-mono">{metrics.networkLatency}ms</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-purple-500" />
              <span className="text-muted-foreground">FPS:</span>
              <span className="font-mono">{metrics.fps}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <Activity className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;