import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192x192.png", "icon-512x512.png"],
      manifest: {
        name: "SkillsSphere AI",
        short_name: "SkillsSphere",
        description: "Learn in live classrooms, analyze resumes, practice mock interviews, and track career progress in one full-stack AI platform.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000, // 5 MB
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],

  // Pre-bundle heavy dependencies on startup for faster cold starts
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-redux",
      "@reduxjs/toolkit",
      "recharts",
      "lucide-react",
      "socket.io-client",
      "zod",
    ],
  },

  build: {
    // Disable source maps in production for smaller bundles
    sourcemap: false,
    // Target modern browsers for smaller output
    target: "es2020",
    // Suppress warning for large chunks
    chunkSizeWarningLimit: 3000,
    // Manual chunk splitting for optimal caching
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
          "vendor-charts": ["recharts"],
          "vendor-editor": ["@monaco-editor/react"],
          "vendor-icons": ["lucide-react"],
          "vendor-socket": ["socket.io-client"],
        },
      },
    },
  },

  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5000",
        ws: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            if (err.code !== "ECONNABORTED") {
              console.error("Vite proxy error:", err);
            }
          });
        },
      },
    },
  },
});