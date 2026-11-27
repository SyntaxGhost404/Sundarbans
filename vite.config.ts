import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Relative base so the build runs from any folder or subpath.
// `--mode preview-host` swaps the self-hosted fonts for linked ones.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@fonts': fileURLToPath(new URL(mode === 'preview-host' ? './src/fonts-hosted.ts' : './src/fonts.ts', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 700,
    outDir: mode === 'preview-host' ? 'dist-preview' : 'dist',
  },
}))
