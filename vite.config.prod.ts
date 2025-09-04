import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "8080"),
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "8080"),
    allowedHosts: [
      "imperial-pet-studio-production.up.railway.app",
      "imperialpets.com.br",
      "www.imperialpets.com.br"
    ]
  },
  build: {
    outDir: "dist",
    sourcemap: process.env.NODE_ENV !== "production",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-router-dom', 'react-dom'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            // ... outros pacotes UI que você está usando
          ],
        }
      }
    }
  }
});
