import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run build`          -> production build served by Express (BrowserRouter, base "/")
// `npm run build:preview`  -> portable static build (HashRouter, relative base)
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'preview' ? './' : '/',
  define: { __HASH_ROUTER__: JSON.stringify(mode === 'preview') },
  server: { port: 5173, proxy: { '/api': 'http://localhost:8000', '/uploads': 'http://localhost:8000' } },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three') || id.includes('three/examples')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/@lottiefiles')) {
            return 'vendor-lottie';
          }
          if (id.includes('node_modules/gsap')) {
            return 'vendor-gsap';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
}));
