import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2015',
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Docker 必需
    strictPort: false,
    fs: {
      strict: false,
    },
    watch: {
      usePolling: true, // Docker 中必需
      interval: 1000,
    },
    hmr: {
      port: 5174,
      host: '0.0.0.0', // Docker 環境必需
      clientPort: 5174,
    },
    cors: {
      origin: (origin, callback) => {
        // 允許 Docker、本地開發環境、網路訪問和 ngrok
        const allowedOrigins = [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://0.0.0.0:5173',
          'http://192.168.1.106:5173',  // 手機訪問
          'https://2db9-1-161-62-121.ngrok-free.app',  // ngrok 遠程訪問
        ];

        // 如果沒有 origin（同源請求）或在允許列表中，則允許
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // 開發模式下允許本地網路和 ngrok 請求
          if (origin && (
            origin.match(/^http:\/\/(192\.168\.|172\.16\.|10\.|localhost|127\.0\.0\.1)/) ||
            origin.match(/^https:\/\/.*\.ngrok.*\.app$/)  // 支援所有 ngrok 網址
          )) {
            callback(null, true);
          } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
          }
        }
      },
      credentials: true,
    },
    proxy: {
      '/api': {
        target: 'http://stock-insight-backend:5000',  // Docker 環境優先
        changeOrigin: true,
        secure: false,
        timeout: 60000,  // 60秒超時
        headers: {
          'X-Forwarded-Proto': 'http',
          'X-Forwarded-Host': 'localhost',
        },
        rewrite: (path) => {
          console.log('API proxy rewrite:', path);
          return path;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, _res) => {
            console.log('❌ API proxy error:', err.message, 'for', req.url);
            // 如果容器間通信失敗，嘗試本地端口
            console.log('⚠️ Falling back to localhost:5001');
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxying API request:', req.method, req.url, '→', proxyReq.getHeader('host'));
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ API response:', proxyRes.statusCode, req.url);
          });
        },
      },
      // 添加 fallback 代理規則
      '/api-fallback': {
        target: 'http://localhost:5001',  // 本地開發 fallback
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-fallback/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Fallback proxy:', req.method, req.url);
          });
        },
      },
      '/socket.io': {
        target: 'http://stock-insight-backend:5000',
        ws: true,
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, _res) => {
            console.log('❌ Socket.IO proxy error:', err.message, 'for', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxying Socket.IO request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📡 Socket.IO response:', proxyRes.statusCode, req.url);
          });
          proxy.on('upgrade', (req, _socket, _head) => {
            console.log('⬆️ WebSocket upgrade request:', req.url);
          });
        },
      },
      // 添加通用 WebSocket 代理
      '/ws': {
        target: 'ws://stock-insight-backend:5000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  esbuild: {
    target: 'es2015',
    keepNames: true,
  },
});
