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
        // Optimize chunk splitting to reduce dependency chains
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast'],
          'icons': ['lucide-react'],
          'utils': ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    // Enable source maps for better debugging
    sourcemap: mode === 'production' ? false : true,
    // Optimize CSS extraction and reduce critical path
    cssCodeSplit: true,
    // Increase chunk size limit to reduce number of chunks
    chunkSizeWarningLimit: 1000,
  },
}));
