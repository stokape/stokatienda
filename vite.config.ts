import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages sirve este proyecto en /stokatienda/, no en la raíz del
  // dominio — sin este base, los assets (JS/CSS) resolverían a rutas
  // absolutas rotas una vez publicado.
  base: '/stokatienda/',
  plugins: [react(), tailwindcss()],
})
