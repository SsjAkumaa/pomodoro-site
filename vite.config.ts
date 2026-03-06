import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',       // dossier où se trouve index.html
  build: {
    outDir: 'dist', // le dossier final pour Netlify
  }
})