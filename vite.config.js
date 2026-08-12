import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const bwApiKey = env.BW_API_KEY
  const nursingApiKey = env.NURSING_API_KEY

  return {
    plugins: [react()],
    build: {
      target: ['es2015', 'safari12', 'chrome87', 'firefox78', 'edge88'],
      chunkSizeWarningLimit: 1000,
      emptyOutDir: false,
    },
    server: {
      proxy: {
        '/api/child-facilities': {
          target: 'https://apis.data.go.kr',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost')
            const pageNo = url.searchParams.get('pageNo') || '1'
            const numOfRows = url.searchParams.get('numOfRows') || '200'
            return `/B554287/sclWlfrFcltInfoInqirService1/getFcltListInfoInqire?serviceKey=${encodeURIComponent(bwApiKey || '')}&pageNo=${encodeURIComponent(pageNo)}&numOfRows=${encodeURIComponent(numOfRows)}&_type=json`
          },
        },
        '/api/nursing-rooms': {
          target: 'https://sooyusil.com',
          changeOrigin: true,
          rewrite: () => `/api/nursingRoomJSON.do?confirmApiKey=${encodeURIComponent(nursingApiKey || '')}`,
        },
      },
    },
  }
})
