import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://webobook.com https://apis.google.com https://checkout.flutterwave.com;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
        // Tighten image sources to avoid allowing external fingerprinting pixel requests
        "img-src 'self' data:;",
        "font-src 'self' data: https://fonts.gstatic.com;",
        "frame-src 'self' https://webobook.com https://checkout.flutterwave.com https://checkout-v3-ui-prod.f4b-flutterwave.com https://api.flutterwave.com https://ravemodal-dev.herokuapp.com;",
        // Allow Firebase/Google endpoints for Firestore/Auth and dev sockets
        "connect-src 'self' https://firestore.googleapis.com https://www.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://apis.google.com https://*.googleapis.com https://*.gstatic.com https://*.firebaseio.com https://*.firebase.com https://api.flutterwave.com https://api.ravepay.co https://checkout.flutterwave.com https://checkout-v3-ui-prod.f4b-flutterwave.com https://ravemodal-dev.herokuapp.com ws: wss:;"
      ].join(' '),
      'Feature-Policy': "camera 'none'; microphone 'none'; geolocation 'none'; display-capture 'none'; clipboard-write 'self'",
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
