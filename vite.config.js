import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        login: resolve(__dirname, 'frontend/login.html'),
        register: resolve(__dirname, 'frontend/register.html'),
        dashboard: resolve(__dirname, 'frontend/dashboard.html'),
        profile: resolve(__dirname, 'frontend/profile.html'),
        post: resolve(__dirname, 'frontend/post.html'),
        friends: resolve(__dirname, 'frontend/friends.html'),
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
  }
}); 