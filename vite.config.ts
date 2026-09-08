import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages sirve este proyecto en /stokatienda/ (subcarpeta), pero
  // Vercel y cualquier dominio propio lo sirven en la raíz "/". `npm run
  // deploy` (GitHub Pages) exporta GH_PAGES=1 para pedir el base correcto;
  // el build normal (el que corre Vercel) usa la raíz.
  base: process.env.GH_PAGES ? '/stokatienda/' : '/',
  plugins: [react(), tailwindcss()],
})
