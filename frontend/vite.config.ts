import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Support assets referenced by Swagger UI (/swagger-ui/**)
      '/swagger-ui': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // OpenAPI JSON used by Swagger UI
      '/v3/api-docs': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
