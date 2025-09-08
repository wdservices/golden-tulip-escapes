import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), display-capture=(), clipboard-write=self',
      'Content-Security-Policy': [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://webobook.com;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
        "img-src 'self' data: https:;",
        "font-src 'self' data: https://fonts.gstatic.com;",
        "frame-src 'self' https://webobook.com;",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://webobook.com;"
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
