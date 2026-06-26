import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Schone Vite + React-opzet (geen Lovable/bun/SSR-glue). Levert dezelfde
// Mantine-theme + componentconventies als skill-forge, maar als standaard
// client-rendered SPA die naast de Node/Azure-spokeserver draait.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 4173,
    host: "127.0.0.1",
  },
});
