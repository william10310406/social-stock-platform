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
        // 允許 Docker、本地開發環境和網路訪問
        const allowedOrigins = [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://0.0.0.0:5173',
          'http://192.168.1.106:5173',  // 手機訪問
        ];

        // 如果沒有 origin（同源請求）或在允許列表中，則允許
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // 開發模式下允許所有本地網路請求
          if (origin && origin.match(/^http:\/\/(192\.168\.|172\.16\.|10\.|localhost|127\.0\.0\.1)/)) {
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
        target: process.env.DOCKER_ENV === 'true'
          ? 'http://host.docker.internal:5001'  // 讓容器能訪問主機映射的端口
          : 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log('API proxy rewrite:', path);
          return path;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, _res) => {
            console.log('❌ API proxy error:', err.message, 'for', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxying API request:', req.method, req.url, '→', proxyReq.getHeader('host'));
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ API response:', proxyRes.statusCode, req.url);
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
