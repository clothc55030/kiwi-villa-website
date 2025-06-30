// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: 'https://www.kiwi-villa.com', // Necessary for sitemap
  integrations: [
    sitemap(),
    partytown()
  ],
  build: {
    format: 'file'
  },
  // 圖片優化配置
  image: {
    // 使用內建的圖片服務
    remotePatterns: [{
      protocol: 'https',
      hostname: 'www.kiwi-villa.com'
    }],
  },
  // 性能優化配置
  vite: {
    // @ts-expect-error - pnpm type mismatch issue
    plugins: [tailwindcss()],
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        drafts: {
          customMedia: true
        }
      }
    },
    build: {
      // 內聯小於 4kb 的資源
      assetsInlineLimit: 4096,
      // CSS 代碼分割
      cssCodeSplit: true,
      // 壓縮選項
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    // 預載入優化
    optimizeDeps: {
      include: ['motion']
    }
  }
});