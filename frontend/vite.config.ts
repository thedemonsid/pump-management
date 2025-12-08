import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use root-relative asset URLs so deep-link refreshes (e.g. /shifts/123) can load built files
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to Spring Boot backend
      "/api": {
        target: "http://localhost:9090",
        changeOrigin: true,
        secure: false,
        configure: (_, options) => {
          console.log(`🔄 Proxying /api requests to: ${options.target}`);
        },
      },
    },
  },
});
