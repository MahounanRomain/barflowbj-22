import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Enable long-term caching with content hashes
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Split vendor chunks for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    // Enable source maps for better debugging
    sourcemap: mode === 'production' ? false : true,
    // Enable CSS code splitting for better performance
    cssCodeSplit: true,
    // Minify CSS in production
    cssMinify: mode === 'production',
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Enable tree shaking
    minify: mode === 'production' ? 'esbuild' : false,
    // Optimize chunk sizes
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      'date-fns',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@tanstack/react-query']
  },
}));
