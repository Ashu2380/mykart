import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  base: '/',  // Adjust for subdirectory deployment if needed
  build: {
    outDir: 'dist',
    sourcemap: false,  // Disable sourcemaps in production
  },
  server: {
    port: 5173,
    host: true,
  }
})
