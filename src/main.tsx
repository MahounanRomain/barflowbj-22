import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeOptimizations } from './utils/optimizations';
import { QueryProvider } from './providers/QueryProvider';

// Initialiser les optimisations de performance
try {
  initializeOptimizations();
  console.log('✅ Optimizations initialized successfully');
} catch (error) {
  console.error('❌ Error initializing optimizations:', error);
}

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found');
  throw new Error("Root element not found");
}

console.log('✅ Root element found, initializing React app');

const root = createRoot(rootElement);
try {
  root.render(
    <React.StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </React.StrictMode>
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering React app:', error);
}