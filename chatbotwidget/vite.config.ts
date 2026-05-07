import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'replace-root-with-host',
      enforce: 'post',
      generateBundle(_options, bundle) {
        for (const key in bundle) {
          if (key.endsWith('.css') && bundle[key].type === 'asset') {
            const asset = bundle[key];
            if (typeof asset.source === 'string') {
              asset.source = asset.source.replace(/:root/g, ':host');
            }
          }
        }
      }
    }
  ],
  // --- THÊM KHỐI SERVER NÀY ĐỂ CHẠY LOCAL ---
  server: {
    port: 5173,
    proxy: {
      // Khi code gọi tới /api/...
      '/api': {
        target: 'http://14.161.1.28:8000', // Địa chỉ Backend local của bạn
        changeOrigin: true,
        // Rewrite này cực quan trọng: Nó bỏ chữ /api trước khi gửi sang Backend
        // Giống hệt cái proxy_pass http://...:8000/; (có dấu gạch chéo cuối) ở Nginx
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Bật hỗ trợ WebSocket cho Local
        ws: true,
      }
    }
  },
  // -----------------------------------------
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
  },
  preview: {
    cors: true,
    port: 4173,
    strictPort: true,
  },
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'chatbot-widget.js',
        assetFileNames: 'chatbot-widget.[ext]',
        manualChunks: undefined,
      },
    },
  },
})