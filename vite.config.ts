import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['lucide-react'],
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['framer-motion', 'react-router-dom', 'lucide-react'],
    exclude: ['@tanstack/query-core'],
  },
  build: {
    rollupOptions: {
      external: ['@tanstack/query-core'],
      output: {
        manualChunks: {
          // Separate ethers.js into its own chunk
          ethers: ['ethers'],
          framer: ['framer-motion'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
}));
