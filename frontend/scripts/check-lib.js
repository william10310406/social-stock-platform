#!/usr/bin/env node

/**
 * Component Library Checker
 * 檢查 /lib 目錄結構和文件完整性
 */

const fs = require('fs');
const path = require('path');

// 顏色輸出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}📚 ${msg}${colors.reset}`),
};

// 預期的文件結構
const expectedStructure = {
  'src/lib/index.js': {
    type: 'file',
    description: '組件庫統一入口',
    required: ['export', 'import', 'window.lib'],
  },
  'src/lib/components/Toast.js': {
    type: 'file',
    description: 'Toast 提示組件',
    required: ['class Toast', 'window.toast', 'success', 'error'],
  },
  'src/lib/components/Modal.js': {
    type: 'file',
    description: 'Modal 模態框組件',
    required: ['class Modal', 'window.Modal', 'confirm', 'alert'],
  },
  'src/lib/components/Loading.js': {
    type: 'file',
    description: 'Loading 載入組件',
    required: ['class Loading', 'window.loading', 'showFullscreen', 'skeleton'],
  },
  'src/lib/data/Formatter.js': {
    type: 'file',
    description: 'Formatter 格式化工具',
    required: ['class Formatter', 'window.formatter', 'currency', 'stockChange'],
  },
};

// 基礎路徑
const basePath = path.join(__dirname, '..');

function checkFileExists(filePath) {
  const fullPath = path.join(basePath, filePath);
  return fs.existsSync(fullPath);
}

function readFileContent(filePath) {
  const fullPath = path.join(basePath, filePath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    return null;
  }
}

function checkFileContent(filePath, required) {
  const content = readFileContent(filePath);
  if (!content) return { passed: false, missing: required };

  const missing = required.filter((keyword) => !content.includes(keyword));
  return {
    passed: missing.length === 0,
    missing,
  };
}

function checkDirectoryStructure() {
  log.title('檢查目錄結構');

  const directories = ['src/lib', 'src/lib/components', 'src/lib/data'];

  let allDirsExist = true;

  directories.forEach((dir) => {
    const fullPath = path.join(basePath, dir);
    if (fs.existsSync(fullPath)) {
      log.success(`目錄存在: ${dir}`);
    } else {
      log.error(`目錄不存在: ${dir}`);
      allDirsExist = false;
    }
  });

  return allDirsExist;
}

function checkFiles() {
  log.title('檢查文件完整性');

  let allFilesPassed = true;
  const results = [];

  Object.entries(expectedStructure).forEach(([filePath, config]) => {
    console.log(`\n${colors.blue}檢查文件: ${filePath}${colors.reset}`);

    // 檢查文件是否存在
    if (!checkFileExists(filePath)) {
      log.error(`文件不存在: ${config.description}`);
      allFilesPassed = false;
      results.push({ file: filePath, status: 'missing', description: config.description });
      return;
    }

    log.success(`文件存在: ${config.description}`);

    // 檢查文件內容
    const contentCheck = checkFileContent(filePath, config.required);
    if (contentCheck.passed) {
      log.success(`內容檢查通過: 所有必需關鍵字存在`);
      results.push({ file: filePath, status: 'passed', description: config.description });
    } else {
      log.warning(`內容檢查部分通過: 缺少關鍵字 [${contentCheck.missing.join(', ')}]`);
      results.push({
        file: filePath,
        status: 'partial',
        description: config.description,
        missing: contentCheck.missing,
      });
    }
  });

  return { allPassed: allFilesPassed, results };
}

function checkPackageIntegration() {
  log.title('檢查包整合');

  // 檢查是否有 package.json 腳本
  const packagePath = path.join(basePath, 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // 檢查是否有相關腳本
      const scripts = packageContent.scripts || {};
      const libScripts = Object.keys(scripts).filter(
        (script) => script.includes('lib') || script.includes('component'),
      );

      if (libScripts.length > 0) {
        log.success(`找到組件庫相關腳本: ${libScripts.join(', ')}`);
      } else {
        log.info('未找到組件庫相關 npm 腳本');
      }
    } catch (error) {
      log.warning('無法解析 package.json');
    }
  } else {
    log.info('未找到 package.json');
  }

  // 檢查測試頁面
  const testPagePath = 'src/pages/test/lib-test.html';
  if (checkFileExists(testPagePath)) {
    log.success('測試頁面存在: lib-test.html');
  } else {
    log.warning('測試頁面不存在: lib-test.html');
  }
}

function generateReport(results) {
  log.title('生成檢查報告');

  const passed = results.filter((r) => r.status === 'passed').length;
  const partial = results.filter((r) => r.status === 'partial').length;
  const missing = results.filter((r) => r.status === 'missing').length;
  const total = results.length;

  console.log(`\n${colors.bold}📊 檢查結果統計:${colors.reset}`);
  console.log(`✅ 完全通過: ${passed}/${total}`);
  console.log(`⚠️  部分通過: ${partial}/${total}`);
  console.log(`❌ 未通過: ${missing}/${total}`);
  console.log(`📈 通過率: ${Math.round(((passed + partial * 0.5) / total) * 100)}%`);

  if (missing > 0) {
    console.log(`\n${colors.red}${colors.bold}缺失的文件:${colors.reset}`);
    results
      .filter((r) => r.status === 'missing')
      .forEach((r) => {
        console.log(`  - ${r.file}: ${r.description}`);
      });
  }

  if (partial > 0) {
    console.log(`\n${colors.yellow}${colors.bold}部分通過的文件:${colors.reset}`);
    results
      .filter((r) => r.status === 'partial')
      .forEach((r) => {
        console.log(`  - ${r.file}: 缺少 [${r.missing.join(', ')}]`);
      });
  }

  // 建議
  console.log(`\n${colors.blue}${colors.bold}建議:${colors.reset}`);
  if (passed === total) {
    console.log('🎉 所有組件文件檢查通過！可以開始使用組件庫。');
    console.log('💡 建議運行測試頁面進行功能驗證: frontend/src/pages/test/lib-test.html');
  } else {
    console.log('🔧 請修復上述問題後重新運行檢查。');
    console.log('📖 參考文檔: frontend/docs/implementation/LIB_IMPLEMENTATION_COMPLETE.md');
  }
}

function main() {
  console.log(`${colors.bold}${colors.blue}
╔══════════════════════════════════════╗
║     Component Library Checker        ║
║   Stock Insight Platform v1.0.0     ║
╚══════════════════════════════════════╝
${colors.reset}`);

  try {
    // 1. 檢查目錄結構
    const dirsOk = checkDirectoryStructure();

    // 2. 檢查文件
    const { allPassed, results } = checkFiles();

    // 3. 檢查包整合
    checkPackageIntegration();

    // 4. 生成報告
    generateReport(results);

    // 5. 退出代碼
    const exitCode = dirsOk && allPassed ? 0 : 1;
    process.exit(exitCode);
  } catch (error) {
    log.error(`檢查過程中發生錯誤: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  checkFileExists,
  checkFileContent,
  checkDirectoryStructure,
  checkFiles,
  main,
};
