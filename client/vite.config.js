import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Backend target for the dev proxy. Override when the API runs elsewhere,
// e.g. `VITE_BACKEND_URL=http://server:5000 npm run dev`.
const backendTarget = process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
