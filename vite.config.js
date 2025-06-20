import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        // 主頁面
        main: resolve(__dirname, 'frontend/index.html'),

        // 認證頁面
        login: resolve(__dirname, 'frontend/src/pages/auth/login.html'),
        register: resolve(__dirname, 'frontend/src/pages/auth/register.html'),

        // 儀表板頁面
        dashboard: resolve(__dirname, 'frontend/src/pages/dashboard/index.html'),
        profile: resolve(__dirname, 'frontend/src/pages/dashboard/profile.html'),
        friends: resolve(__dirname, 'frontend/src/pages/dashboard/friends.html'),
        chat: resolve(__dirname, 'frontend/src/pages/dashboard/chat.html'),

        // 文章頁面
        postDetail: resolve(__dirname, 'frontend/src/pages/posts/detail.html'),
      },
    },
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      strict: false,
    },
    watch: {
      usePolling: true,
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend/src'),
    }
  }
});
