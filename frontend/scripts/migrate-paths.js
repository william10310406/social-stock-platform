#!/usr/bin/env node

// 路徑遷移腳本 - 自動替換硬編碼路徑
const fs = require('fs');
const path = require('path');

// 路徑映射表
const PATH_MAPPINGS = {
  // 頁面路徑
  "'/src/pages/auth/login.html'": "RouteUtils.getPagePath('auth', 'login')",
  '"/src/pages/auth/login.html"': "RouteUtils.getPagePath('auth', 'login')",
  "'/src/pages/auth/register.html'": "RouteUtils.getPagePath('auth', 'register')",
  '"/src/pages/auth/register.html"': "RouteUtils.getPagePath('auth', 'register')",

  "'/src/pages/dashboard/index.html'": "RouteUtils.getPagePath('dashboard', 'index')",
  '"/src/pages/dashboard/index.html"': "RouteUtils.getPagePath('dashboard', 'index')",
  "'/src/pages/dashboard/profile.html'": "RouteUtils.getPagePath('dashboard', 'profile')",
  '"/src/pages/dashboard/profile.html"': "RouteUtils.getPagePath('dashboard', 'profile')",
  "'/src/pages/dashboard/friends.html'": "RouteUtils.getPagePath('dashboard', 'friends')",
  '"/src/pages/dashboard/friends.html"': "RouteUtils.getPagePath('dashboard', 'friends')",
  "'/src/pages/dashboard/chat.html'": "RouteUtils.getPagePath('dashboard', 'chat')",
  '"/src/pages/dashboard/chat.html"': "RouteUtils.getPagePath('dashboard', 'chat')",

  "'/src/pages/posts/detail.html'": "RouteUtils.getPagePath('posts', 'detail')",
  '"/src/pages/posts/detail.html"': "RouteUtils.getPagePath('posts', 'detail')",

  "'/index.html'": "RouteUtils.getPagePath('pages', 'home')",
  '"/index.html"': "RouteUtils.getPagePath('pages', 'home')",

  // 組件路徑
  "'/src/components/navbar.html'": 'ROUTES.components.navbar',
  '"/src/components/navbar.html"': 'ROUTES.components.navbar',

  // 腳本路徑
  "'/src/js/config/routes.js'": 'ROUTES.scripts.config.routes',
  '"/src/js/config/routes.js"': 'ROUTES.scripts.config.routes',
  "'/src/js/utils/pathManager.js'": 'ROUTES.scripts.utils.pathManager',
  '"/src/js/utils/pathManager.js"': 'ROUTES.scripts.utils.pathManager',

  // 常見的重定向模式
  "window.location.href = '/src/pages/auth/login.html'": 'RouteUtils.redirectToLogin()',
  'window.location.href = "/src/pages/auth/login.html"': 'RouteUtils.redirectToLogin()',
  "window.location.href = '/src/pages/dashboard/index.html'": 'RouteUtils.redirectToDashboard()',
  'window.location.href = "/src/pages/dashboard/index.html"': 'RouteUtils.redirectToDashboard()',
};

// 需要添加 RouteUtils 導入的文件模式
const NEEDS_IMPORT = [/\.js$/];

// 需要跳過的文件
const SKIP_FILES = [
  'migrate-paths.js',
  'routes.js', // 已經是配置文件
  'node_modules',
  '.git',
  'test',
  'coverage',
];

function shouldSkipFile(filePath) {
  return SKIP_FILES.some((skip) => filePath.includes(skip));
}

function addRouteUtilsImport(content, filePath) {
  // 檢查是否已經有導入
  if (
    content.includes('RouteUtils') &&
    (content.includes('import') || content.includes('require'))
  ) {
    return content;
  }

  // 檢查是否需要添加導入
  const needsImport = Object.values(PATH_MAPPINGS).some(
    (replacement) => content.includes(replacement) || content.includes('RouteUtils'),
  );

  if (!needsImport) {
    return content;
  }

  // 計算相對路徑到 routes.js
  const relativePath = path.relative(path.dirname(filePath), 'src/js/config/routes.js');
  const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;

  // 添加導入語句
  const importStatement = `// 導入路徑配置\nimport { RouteUtils, ROUTES } from '${importPath}';\n\n`;

  return importStatement + content;
}

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 應用路徑映射
    Object.entries(PATH_MAPPINGS).forEach(([oldPath, newPath]) => {
      if (content.includes(oldPath)) {
        content = content.replace(new RegExp(escapeRegExp(oldPath), 'g'), newPath);
        modified = true;
        console.log(`✅ 替換: ${oldPath} → ${newPath} in ${filePath}`);
      }
    });

    // 添加導入語句（如果需要）
    if (modified && NEEDS_IMPORT.some((pattern) => pattern.test(filePath))) {
      const newContent = addRouteUtilsImport(content, filePath);
      if (newContent !== content) {
        content = newContent;
        console.log(`📦 添加導入語句到: ${filePath}`);
      }
    }

    // 寫入文件
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ 處理文件失敗: ${filePath}`, error.message);
    return false;
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (shouldSkipFile(filePath)) {
      return;
    }

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath, callback);
    } else if (stat.isFile()) {
      callback(filePath);
    }
  });
}

function main() {
  console.log('🚀 開始路徑遷移...');
  console.log('📁 掃描目錄: frontend/');

  let totalFiles = 0;
  let modifiedFiles = 0;

  walkDirectory('src', (filePath) => {
    totalFiles++;

    // 只處理 JS 和某些配置文件
    if (filePath.match(/\.(js|json|html)$/)) {
      if (migrateFile(filePath)) {
        modifiedFiles++;
      }
    }
  });

  // 處理根目錄的特殊文件
  const specialFiles = [
    'public/sw.js',
    'scripts/check-routes.js',
    'scripts/validate-links.js',
    'tests/e2e/auth.spec.js',
    'vite.config.js',
  ];

  specialFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      totalFiles++;
      if (migrateFile(file)) {
        modifiedFiles++;
      }
    }
  });

  console.log('\n📊 遷移統計:');
  console.log(`📁 檢查文件: ${totalFiles}`);
  console.log(`✅ 修改文件: ${modifiedFiles}`);
  console.log(`📈 修改比例: ${((modifiedFiles / totalFiles) * 100).toFixed(1)}%`);

  if (modifiedFiles > 0) {
    console.log('\n🎉 路徑遷移完成！');
    console.log('\n⚠️  注意事項:');
    console.log('1. 請檢查修改的文件是否正確');
    console.log('2. 運行測試確保功能正常');
    console.log('3. 某些複雜的路徑可能需要手動調整');
  } else {
    console.log('\n✨ 沒有發現需要遷移的路徑');
  }
}

// 執行遷移
if (require.main === module) {
  main();
}

module.exports = { migrateFile, PATH_MAPPINGS };
