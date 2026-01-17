import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'  // 暂时禁用PWA插件

export default defineConfig({
  plugins: [
    react(),
    // 暂时禁用PWA插件以解决构建问题
    // VitePWA({...})
  ],
  // GitHub Pages 仓库站点路径： https://<user>.github.io/CubeGame/
  base: '/CubeGame/'
})
