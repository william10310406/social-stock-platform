#!/usr/bin/env node
/**
 * 腳本環境配置模組
 * 提供統一的 Docker 環境檢測和配置管理
 */

const fs = require('fs');
const path = require('path');

class ScriptEnvironment {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.dockerConfig = this.detectDockerEnvironment();
    this.envConfig = this.loadEnvironmentConfig();
  }

  /**
   * 尋找項目根目錄
   */
  findProjectRoot() {
    let currentDir = process.cwd();

    while (currentDir !== path.parse(currentDir).root) {
      if (
        fs.existsSync(path.join(currentDir, 'package.json')) ||
        fs.existsSync(path.join(currentDir, 'docker-compose.yml'))
      ) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }

    return process.cwd();
  }

  /**
   * 檢測 Docker 環境
   */
  detectDockerEnvironment() {
    const checks = {
      // 檔案存在檢查
      dockerFile: fs.existsSync('/.dockerenv'),

      // 環境變數檢查
      nodeEnv: process.env.NODE_ENV === 'docker',
      dockerEnv: process.env.DOCKER_ENV === 'true',

      // 容器名稱檢查
      frontendContainer: process.env.FRONTEND_URL?.includes('://frontend:'),
      backendContainer: process.env.BACKEND_URL?.includes('://backend:'),

      // 主機名檢查
      hostname: process.env.HOSTNAME?.startsWith('stock-insight-'),

      // Docker Compose 服務檢查
      dockerCompose: fs.existsSync(path.join(this.projectRoot, 'docker-compose.yml')),
    };

    const isDocker = Object.values(checks).some((check) => check === true);

    return {
      isDocker,
      checks,
      confidence: Object.values(checks).filter(Boolean).length / Object.keys(checks).length,
    };
  }

  /**
   * 載入環境配置
   */
  loadEnvironmentConfig() {
    const { isDocker } = this.dockerConfig;

    // 基礎配置
    const baseConfig = {
      // 前端配置
      frontend: {
        host: isDocker ? 'frontend' : 'localhost',
        port: parseInt(process.env.FRONTEND_PORT || '5173'),
        protocol: 'http',
      },

      // 後端配置
      backend: {
        host: isDocker ? 'backend' : 'localhost',
        port: parseInt(process.env.BACKEND_PORT || '5001'),
        protocol: 'http',
      },

      // 資料庫配置
      database: {
        host: isDocker ? 'db' : 'localhost',
        port: parseInt(process.env.DB_PORT || '5433'),
        name: process.env.DB_NAME || 'stock_insight',
      },

      // Redis 配置
      redis: {
        host: isDocker ? 'redis' : 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },

      // 通用配置
      timeout: parseInt(process.env.REQUEST_TIMEOUT || '10000'),
      retries: parseInt(process.env.MAX_RETRIES || '3'),
      debug: process.env.DEBUG === 'true',
    };

    // URL 構建
    const urls = {
      frontend:
        process.env.FRONTEND_URL ||
        `${baseConfig.frontend.protocol}://${baseConfig.frontend.host}:${baseConfig.frontend.port}`,

      backend:
        process.env.BACKEND_URL ||
        (isDocker
          ? ''
          : `${baseConfig.backend.protocol}://${baseConfig.backend.host}:${baseConfig.backend.port}`),

      api: isDocker
        ? '/api'
        : `${baseConfig.backend.protocol}://${baseConfig.backend.host}:${baseConfig.backend.port}/api`,
    };

    return {
      ...baseConfig,
      urls,
      isDocker,
      environment: process.env.NODE_ENV || (isDocker ? 'docker' : 'development'),
    };
  }

  /**
   * 獲取完整環境信息
   */
  getEnvironmentInfo() {
    return {
      projectRoot: this.projectRoot,
      docker: this.dockerConfig,
      config: this.envConfig,
    };
  }

  /**
   * 打印環境信息
   */
  printEnvironmentInfo() {
    const { dockerConfig, envConfig } = this;

    console.log('🔍 腳本環境檢測結果:');
    console.log('='.repeat(40));
    console.log(`📍 項目根目錄: ${this.projectRoot}`);
    console.log(
      `🐳 Docker 環境: ${dockerConfig.isDocker ? '是' : '否'} (信心度: ${(dockerConfig.confidence * 100).toFixed(1)}%)`,
    );
    console.log(`🌍 執行環境: ${envConfig.environment}`);
    console.log(`⚙️  設定:`);
    console.log(`   - 前端: ${envConfig.urls.frontend}`);
    console.log(`   - 後端: ${envConfig.urls.backend || '使用代理'}`);
    console.log(`   - API: ${envConfig.urls.api}`);
    console.log(`   - 超時: ${envConfig.timeout}ms`);

    if (envConfig.debug) {
      console.log('\n🔍 詳細檢測結果:');
      Object.entries(dockerConfig.checks).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value ? '✅' : '❌'}`);
      });
    }

    console.log('='.repeat(40));
  }

  /**
   * 靜態方法：快速獲取環境配置
   */
  static getConfig() {
    const env = new ScriptEnvironment();
    return env.getEnvironmentInfo();
  }

  /**
   * 靜態方法：快速檢查是否為 Docker 環境
   */
  static isDocker() {
    const env = new ScriptEnvironment();
    return env.dockerConfig.isDocker;
  }
}

module.exports = {
  ScriptEnvironment,
  getConfig: ScriptEnvironment.getConfig,
  isDocker: ScriptEnvironment.isDocker,
};

// 當作為主模組執行時，顯示環境信息
if (require.main === module) {
  console.log('🧪 測試前端腳本環境配置模組...\n');

  try {
    const env = new ScriptEnvironment();
    env.printEnvironmentInfo();

    console.log('\n✅ 前端環境配置模組測試成功！');
  } catch (error) {
    console.error('❌ 前端環境配置模組測試失敗:', error.message);
    process.exit(1);
  }
}
