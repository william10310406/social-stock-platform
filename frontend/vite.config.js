import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, ''),
  build: {
    rollupOptions: {
      input: {
        // 主頁面
        main: resolve(__dirname, 'index.html'),

        // 認證頁面
        login: resolve(__dirname, 'src/pages/auth/login.html'),
        register: resolve(__dirname, 'src/pages/auth/register.html'),

        // 儀表板頁面
        dashboard: resolve(__dirname, 'src/pages/dashboard/index.html'),
        profile: resolve(__dirname, 'src/pages/dashboard/profile.html'),
        friends: resolve(__dirname, 'src/pages/dashboard/friends.html'),
        chat: resolve(__dirname, 'src/pages/dashboard/chat.html'),

        // 文章頁面
        postDetail: resolve(__dirname, 'src/pages/posts/detail.html'),
      },
    },
    outDir: resolve(__dirname, 'dist'),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
