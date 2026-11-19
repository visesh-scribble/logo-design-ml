import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Builds straight into the Python server's public/ folder, so server.py and
// render.yaml keep working unchanged: python server.py serves the built files.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "../restaurant-studio/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),   // the studio wizard
        m: resolve(__dirname, "m.html"),           // phone menu (also served as /<slug>.html)
        orders: resolve(__dirname, "orders.html")  // kitchen orders screen
      }
    }
  },
  server: {
    port: 5173,
    // During `npm run dev`, API calls go to the Python server (python server.py on :8080)
    proxy: { "/api": process.env.API_URL || "http://localhost:8080" }
  }
});
