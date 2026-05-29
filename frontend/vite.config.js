import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/puzzle': 'http://localhost:8000',
      '/guess': 'http://localhost:8000',
    },
  },
})
