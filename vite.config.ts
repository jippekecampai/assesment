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
  build: {
    // Vaste (niet-gehashte) asset-namen + één bundle, zodat Azure Easy Auth
    // ze met EXACTE excludedPaths kan uitsluiten (authV2 kent geen wildcards).
    // De kiosk-route /test moet zijn JS/CSS anoniem kunnen laden; staff blijft
    // achter Entra. Kiosk-cachebusting via index.html (geen hash → ok voor nu).
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: "assets/app.js",
        assetFileNames: "assets/app.[ext]",
      },
    },
  },
  server: {
    port: 4173,
    host: "127.0.0.1",
  },
});
