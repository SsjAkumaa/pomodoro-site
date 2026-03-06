import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',          // La racine du projet où se trouve index.html
  build: {
    outDir: 'dist',   // dossier final pour Netlify
  },
})