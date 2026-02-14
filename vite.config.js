import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/recipe2-api': {
        target: 'http://cosylab.iiitd.edu.in:6969',
        changeOrigin: true,
      },
    },
  },
})
