import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['framer-motion', 'gsap'],
          data: ['@tanstack/react-query'],
          ui: ['react-hot-toast', 'i18next', 'react-i18next']
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
})