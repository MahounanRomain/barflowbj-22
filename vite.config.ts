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
  },
  css: {
    postcss: {
      plugins: mode === 'production' ? [
        require('tailwindcss'),
        require('autoprefixer'),
        require('@fullhuman/postcss-purgecss')({
          content: [
            './index.html',
            './src/**/*.{js,ts,jsx,tsx}',
          ],
          defaultExtractor: (content: string) => content.match(/[\w-/:]+(?<!:)/g) || [],
          safelist: [
            // Preserve critical classes
            /^(bg|text|border)-(primary|secondary|accent|success|warning|info|destructive)/,
            'keyboard-navigation',
            'high-contrast', 
            'reduce-motion',
            'sr-only',
            // Preserve animation classes
            /^animate-/,
            // Preserve Radix UI classes
            /^radix-/,
            // Preserve state classes
            /^(hover|focus|active|disabled):/,
            // Preserve responsive classes
            /^(sm|md|lg|xl|2xl):/,
            // Preserve dark mode classes
            /^dark:/,
          ]
        })
      ] : [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  },
}));
