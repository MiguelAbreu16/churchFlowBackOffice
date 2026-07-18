import path from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Monorepo root also has react; force a single instance for hooks.
    dedupe: ["react", "react-dom"],
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    include: ["graphql-ws"],
  },
  server: {
    port: 5175,
    open: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5175,
    // Custom domain + Railway default URLs
    allowedHosts: [
      "admin.kahalzerem.com",
      ".up.railway.app",
      "localhost",
    ],
  },
  build: {
    outDir: "dist",
  },
});
