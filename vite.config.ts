import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    },
    headers: {
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), display-capture=(), clipboard-write=self',
      'Content-Security-Policy': [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://webobook.com https://apis.google.com https://js.paystack.co https://checkout.paystack.com https://interfaces.zapier.com https://*.zapier.com https://kuula.co https://*.kuula.co https://tour.panoee.net https://*.panoee.net;",
        "object-src 'none';",
        "base-uri 'self';",
        "form-action 'self';",
        "frame-ancestors 'none';",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://paystack.com https://interfaces.zapier.com https://*.zapier.com https://kuula.co https://*.kuula.co https://tour.panoee.net https://*.panoee.net;",
        // Tighten image sources to avoid allowing external fingerprinting pixel requests
        "img-src 'self' data: https: https://kuula.co https://*.kuula.co https://tour.panoee.net https://*.panoee.net;",
        "font-src 'self' data: https://fonts.gstatic.com;",
        "frame-src 'self' https://webobook.com https://checkout.paystack.com https://golden-tulip-34749.firebaseapp.com https://*.firebaseapp.com https://accounts.google.com https://interfaces.zapier.com https://*.zapier.com https://kuula.co https://*.kuula.co https://tour.panoee.net https://*.panoee.net;",
        // Allow Firebase/Google endpoints for Firestore/Auth and dev sockets
        "connect-src 'self' http://localhost:3001 https://api.paystack.co https://firestore.googleapis.com https://www.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://apis.google.com https://*.googleapis.com https://*.gstatic.com https://*.firebaseio.com https://*.firebase.com https://interfaces.zapier.com https://*.zapier.com https://kuula.co https://*.kuula.co https://tour.panoee.net https://*.panoee.net ws: wss:;"
      ].join(' '),
    },
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
}));
