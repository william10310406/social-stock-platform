#!/usr/bin/env node
// 路徑檢查腳本
// 自動測試所有頁面、資源和 API 端點

const http = require('http');
const https = require('https');
const { URL } = require('url');
const { ROUTES } = require('../src/js/config/routes.js');
const { ScriptEnvironment } = require('./script-env.js');

// 初始化環境配置
const scriptEnv = new ScriptEnvironment();
const { config } = scriptEnv.getEnvironmentInfo();

// 顯示環境信息
scriptEnv.printEnvironmentInfo();

const BASE_URL = config.urls.frontend;
const API_BASE_URL = config.urls.backend;

// 從統一配置獲取路徑
const PATHS_TO_CHECK = [
  // 主頁面
  ROUTES.pages.home,

  // 認證頁面
  ...Object.values(ROUTES.pages.auth),

  // 儀表板頁面
  ...Object.values(ROUTES.pages.dashboard),

  // 文章頁面
  ...Object.values(ROUTES.pages.posts),
];

const SCRIPTS_TO_CHECK = [
  // 配置腳本
  ...Object.values(ROUTES.scripts.config),

  // 工具腳本
  ...Object.values(ROUTES.scripts.utils),

  // 核心腳本
  ...Object.values(ROUTES.scripts.core),

  // 功能腳本
  ...Object.values(ROUTES.scripts.features),
];

const COMPONENTS_TO_CHECK = Object.values(ROUTES.components);

// 定義所有需要檢查的路徑
const ROUTES_TO_CHECK = {
  // 主要頁面
  pages: [
    '/index.html',
    '/src/pages/auth/login.html',
    '/src/pages/auth/register.html',
    '/src/pages/dashboard/index.html',
    '/src/pages/dashboard/profile.html',
    '/src/pages/dashboard/friends.html',
    '/src/pages/dashboard/chat.html',
    '/src/pages/posts/detail.html',
  ],

  // 靜態資源
  assets: [
    '/src/css/style.css',
    '/src/js/config/routes.js',
    '/src/js/utils/pathManager.js',
    '/src/js/utils/pwa.js',
    '/src/js/utils/websocket.js',
    '/src/js/utils/loadingManager.js',
    '/src/js/template.js',
    '/src/js/api.js',
    '/src/js/auth.js',
    '/src/js/dashboard.js',
    '/src/js/chat.js',
    '/src/js/friends.js',
    '/src/js/profile.js',
    '/src/js/post.js',
    '/src/components/navbar.html',
  ],

  // PWA 相關
  pwa: ['/manifest.json', '/sw.js'],

  // API 端點 (需要後端運行)
  api: ['/api/health'],
};

// 顏色輸出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// HTTP 請求函數
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: config.timeout,
    };

    const req = client.request(options, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers,
        url: url,
      });
    });

    req.on('error', (error) => {
      reject({
        error: error.message,
        url: url,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        url: url,
      });
    });

    req.end();
  });
}

// 檢查單個路徑
async function checkRoute(url, expectedStatus = 200) {
  try {
    const result = await makeRequest(url);
    // 接受 200 和重定向狀態碼
    const isSuccess = [200, 301, 302].includes(result.status);

    return {
      url,
      status: result.status,
      success: isSuccess,
      error: null,
    };
  } catch (error) {
    return {
      url,
      status: null,
      success: false,
      error: error.error || error.message,
    };
  }
}

// 檢查路徑組
async function checkRouteGroup(groupName, routes, baseUrl = BASE_URL) {
  log(`\n${colors.bold}${colors.cyan}檢查 ${groupName}...${colors.reset}`);
  const results = [];

  for (const route of routes) {
    const fullUrl = baseUrl + route;
    const result = await checkRoute(fullUrl);
    results.push(result);

    if (result.success) {
      log(`  ✅ ${route} (${result.status})`, colors.green);
    } else {
      log(`  ❌ ${route} (${result.status || 'ERROR'}) - ${result.error || ''}`, colors.red);
    }
  }

  return results;
}

// 檢查服務是否運行
async function checkService(name, url) {
  try {
    await makeRequest(url);
    log(`✅ ${name} 服務正在運行`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${name} 服務未運行 - ${error.error}`, colors.red);
    return false;
  }
}

// 生成報告
function generateReport(allResults) {
  const totalChecks = allResults.reduce((sum, group) => sum + group.results.length, 0);
  const successfulChecks = allResults.reduce(
    (sum, group) => sum + group.results.filter((r) => r.success).length,
    0,
  );
  const failedChecks = totalChecks - successfulChecks;

  log(`\n${colors.bold}${colors.cyan}=== 路徑檢查報告 ===${colors.reset}`);
  log(`📊 總共檢查: ${totalChecks} 個路徑`);
  log(`✅ 成功: ${successfulChecks}`, colors.green);
  log(`❌ 失敗: ${failedChecks}`, failedChecks > 0 ? colors.red : colors.green);
  log(`📈 成功率: ${((successfulChecks / totalChecks) * 100).toFixed(1)}%`);

  // 詳細失敗報告
  if (failedChecks > 0) {
    log(`\n${colors.bold}${colors.red}失敗的路徑:${colors.reset}`);
    allResults.forEach((group) => {
      const failedRoutes = group.results.filter((r) => !r.success);
      if (failedRoutes.length > 0) {
        log(`\n${group.name}:`);
        failedRoutes.forEach((route) => {
          log(`  ❌ ${route.url} - ${route.error || `HTTP ${route.status}`}`, colors.red);
        });
      }
    });

    log(`\n${colors.yellow}修復建議:${colors.reset}`);
    log(`1. 確保前端服務運行: docker-compose up -d frontend`);
    log(`2. 確保後端服務運行: docker-compose up -d backend`);
    log(`3. 檢查文件是否存在於正確位置`);
    log(`4. 檢查網路連接和防火牆設置`);
  }

  return {
    total: totalChecks,
    successful: successfulChecks,
    failed: failedChecks,
    successRate: (successfulChecks / totalChecks) * 100,
  };
}

// 主函數
async function main() {
  log(`${colors.bold}${colors.blue}🔍 Stock Insight Platform 路徑檢查工具${colors.reset}`);
  log(`開始檢查所有路徑的可訪問性...\n`);

  // 檢查服務狀態
  log(`${colors.bold}${colors.cyan}檢查服務狀態...${colors.reset}`);
  const frontendRunning = await checkService('前端', BASE_URL + '/index.html');
  const backendRunning = await checkService('後端', API_BASE_URL + '/api/health');

  if (!frontendRunning) {
    log(`\n${colors.yellow}⚠️  前端服務未運行，請執行: docker-compose up -d${colors.reset}`);
    process.exit(1);
  }

  const allResults = [];

  // 檢查所有路徑組
  for (const [groupName, routes] of Object.entries(ROUTES_TO_CHECK)) {
    if (groupName === 'api' && !backendRunning) {
      log(`\n${colors.yellow}⚠️  跳過 API 檢查，後端服務未運行${colors.reset}`);
      continue;
    }

    const baseUrl = groupName === 'api' ? API_BASE_URL : BASE_URL;
    const results = await checkRouteGroup(groupName, routes, baseUrl);
    allResults.push({ name: groupName, results });
  }

  // 生成報告
  const report = generateReport(allResults);

  // 退出代碼
  process.exit(report.failed > 0 ? 1 : 0);
}

// 處理未捕獲的錯誤
process.on('unhandledRejection', (error) => {
  log(`\n❌ 未捕獲的錯誤: ${error.message}`, colors.red);
  process.exit(1);
});

// 執行主函數
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ 執行錯誤: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = {
  checkRoute,
  checkRouteGroup,
  generateReport,
  ROUTES_TO_CHECK,
};
