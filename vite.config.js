import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // iOS Safari 12+ 호환성 보장 (iPhone 6s 이상)
    target: ['es2015', 'safari12', 'chrome87', 'firefox78', 'edge88'],
    // 청크 크기 경고 임계값
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api-bokji': {
        target: 'https://api.odcloud.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-bokji/, '')
      },
      '/api-nursing': {
        target: 'https://sooyusil.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-nursing/, '')
      }
    }
  }
})
