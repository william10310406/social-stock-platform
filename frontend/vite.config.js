import { defineConfig } from 'vite';
import { resolve } from 'path';
import { BUILD_CONFIG, getFlatEntries, getEnvConfig } from './config/build.config.js';

export default defineConfig(({ mode }) => {
  const envConfig = getEnvConfig(mode);
  const entries = getFlatEntries();

  // 構建入口配置
  const rollupInputs = {};
  Object.entries(entries).forEach(([key, path]) => {
    rollupInputs[key] = resolve(__dirname, path);
  });

  return {
    root: '.',
    build: {
      outDir: BUILD_CONFIG.build.outDir,
      sourcemap: BUILD_CONFIG.build.sourcemap,
      minify: BUILD_CONFIG.build.minify,
      target: BUILD_CONFIG.build.target,
      rollupOptions: {
        input: rollupInputs,
      },
    },
    server: {
      port: BUILD_CONFIG.server.port,
      host: BUILD_CONFIG.server.host,
      fs: {
        strict: !BUILD_CONFIG.server.strictFs,
      },
      watch: {
        usePolling: BUILD_CONFIG.server.usePolling,
      },
    },
    resolve: {
      alias: Object.fromEntries(
        Object.entries(BUILD_CONFIG.aliases).map(([key, path]) => [key, resolve(__dirname, path)]),
      ),
    },
    define: {
      // 注入環境變量
      ...Object.fromEntries(
        Object.entries(envConfig).map(([key, value]) => [key, JSON.stringify(value)]),
      ),
    },
  };
});
