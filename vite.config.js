import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'  // 暂时禁用PWA插件

export default defineConfig({
  plugins: [
    react(),
    // 暂时禁用PWA插件以解决构建问题
    // VitePWA({...})
  ],
  base: '/'
})
