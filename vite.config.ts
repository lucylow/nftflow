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
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['framer-motion', 'lucide-react', 'react-router-dom'],
    exclude: ['@tanstack/react-query'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate ethers.js into its own chunk
          ethers: ['ethers'],
          framer: ['framer-motion'],
          lucide: ['lucide-react'],
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
