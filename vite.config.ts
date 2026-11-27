import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build runs from any folder or subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 700,
  },
})
