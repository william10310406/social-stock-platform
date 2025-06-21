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
        // 允許 Docker 和本地開發環境
        const allowedOrigins = [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://0.0.0.0:5173',
        ];

        // 如果沒有 origin（同源請求）或在允許列表中，則允許
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
    proxy: {
      '/api': {
        target: 'http://stock-insight-backend:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/ws': {
        target: 'ws://stock-insight-backend:5000',
        ws: true,
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('WebSocket proxy error', err);
          });
        },
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
