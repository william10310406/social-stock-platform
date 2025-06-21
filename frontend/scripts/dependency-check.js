#!/usr/bin/env node

// 依賴檢查腳本 - 防止循環依賴和路徑問題
const fs = require('fs');
const path = require('path');

class DependencyChecker {
  constructor() {
    this.dependencies = new Map();
    this.visited = new Set();
    this.visiting = new Set();
    this.errors = [];
    this.warnings = [];
  }

  // 主要檢查函數
  async checkProject() {
    console.log('🔍 開始依賴檢查...\n');

    try {
      await this.scanJavaScriptFiles();
      this.checkCircularDependencies();
      this.checkRoutesDependencies();
      this.checkImportPaths();
      this.generateReport();
    } catch (error) {
      console.error('❌ 檢查過程中發生錯誤:', error.message);
      process.exit(1);
    }
  }

  // 掃描所有 JavaScript 文件
  async scanJavaScriptFiles() {
    const jsFiles = this.findJavaScriptFiles('src/js');

    for (const file of jsFiles) {
      await this.analyzeFile(file);
    }
  }

  // 查找 JavaScript 文件
  findJavaScriptFiles(dir) {
    const files = [];

    const scanDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    };

    scanDir(dir);
    return files;
  }

  // 分析單個文件
  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const imports = this.extractImports(content);

      this.dependencies.set(filePath, imports);
    } catch (error) {
      this.errors.push(`無法讀取文件 ${filePath}: ${error.message}`);
    }
  }

  // 提取導入語句
  extractImports(content) {
    const imports = [];

    // ES6 import 語句
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        type: 'import',
        path: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    // CommonJS require 語句
    const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;

    while ((match = requireRegex.exec(content)) !== null) {
      imports.push({
        type: 'require',
        path: match[1],
        line: this.getLineNumber(content, match.index),
      });
    }

    return imports;
  }

  // 獲取行號
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // 檢查循環依賴
  checkCircularDependencies() {
    console.log('🔄 檢查循環依賴...');

    for (const [file] of this.dependencies) {
      this.visited.clear();
      this.visiting.clear();

      if (this.hasCyclicDependency(file)) {
        this.errors.push(`發現循環依賴: ${file}`);
      }
    }
  }

  // 遞歸檢查循環依賴
  hasCyclicDependency(file) {
    if (this.visiting.has(file)) {
      return true; // 找到循環
    }

    if (this.visited.has(file)) {
      return false; // 已經檢查過
    }

    this.visiting.add(file);

    const imports = this.dependencies.get(file) || [];

    for (const imp of imports) {
      const resolvedPath = this.resolvePath(file, imp.path);

      if (resolvedPath && this.dependencies.has(resolvedPath)) {
        if (this.hasCyclicDependency(resolvedPath)) {
          return true;
        }
      }
    }

    this.visiting.delete(file);
    this.visited.add(file);

    return false;
  }

  // 解析相對路徑
  resolvePath(fromFile, importPath) {
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const dir = path.dirname(fromFile);
      let resolved = path.resolve(dir, importPath);

      // 如果沒有副檔名，嘗試添加 .js
      if (!path.extname(resolved)) {
        resolved += '.js';
      }

      return resolved;
    }

    return null; // 非相對路徑，可能是 npm 包
  }

  // 檢查 routes.js 的依賴
  checkRoutesDependencies() {
    console.log('📍 檢查路徑配置依賴...');

    const routesFile = path.resolve('src/js/config/routes.js');
    // 嘗試不同的路徑格式
    let routesDeps = this.dependencies.get(routesFile);

    if (!routesDeps) {
      // 嘗試相對路徑
      for (const [file] of this.dependencies) {
        if (file.endsWith('config/routes.js')) {
          routesDeps = this.dependencies.get(file);
          break;
        }
      }
    }

    if (!routesDeps) {
      this.errors.push('找不到 routes.js 文件');
      return;
    }

    // routes.js 不應該依賴其他業務模組
    const forbiddenImports = routesDeps.filter(
      (imp) =>
        imp.path.includes('../') && !imp.path.includes('config/') && !imp.path.includes('utils/'),
    );

    if (forbiddenImports.length > 0) {
      this.warnings.push(
        `routes.js 不應該導入業務模組: ${forbiddenImports.map((i) => i.path).join(', ')}`,
      );
    }
  }

  // 檢查導入路徑
  checkImportPaths() {
    console.log('🔗 檢查導入路徑...');

    for (const [file, imports] of this.dependencies) {
      for (const imp of imports) {
        // 檢查 routes.js 的導入路徑
        if (imp.path.includes('routes.js')) {
          const expectedPath = this.calculateExpectedRoutesPath(file);

          if (imp.path !== expectedPath) {
            this.warnings.push(
              `${file}:${imp.line} - routes.js 導入路徑可能不正確: ${imp.path} (建議: ${expectedPath})`,
            );
          }
        }

        // 檢查文件是否存在
        const resolvedPath = this.resolvePath(file, imp.path);
        if (resolvedPath && !fs.existsSync(resolvedPath)) {
          this.errors.push(`${file}:${imp.line} - 導入的文件不存在: ${imp.path}`);
        }
      }
    }
  }

  // 計算到 routes.js 的正確路徑
  calculateExpectedRoutesPath(fromFile) {
    const relativePath = path.relative(path.dirname(fromFile), 'src/js/config/routes.js');

    return relativePath.startsWith('.') ? relativePath : './' + relativePath;
  }

  // 生成報告
  generateReport() {
    console.log('\n📊 依賴檢查報告');
    console.log('='.repeat(50));

    console.log(`📁 掃描文件數: ${this.dependencies.size}`);
    console.log(`❌ 錯誤數: ${this.errors.length}`);
    console.log(`⚠️  警告數: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ 錯誤:');
      this.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      this.warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ 所有檢查都通過了！');
    }

    console.log('\n🛡️  預防建議:');
    console.log('  1. routes.js 應該是純配置文件，不導入業務模組');
    console.log('  2. 使用相對路徑導入 routes.js');
    console.log('  3. 避免深層嵌套的導入關係');
    console.log('  4. 定期運行此檢查腳本');

    // 退出碼
    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// 執行檢查
if (require.main === module) {
  const checker = new DependencyChecker();
  checker.checkProject();
}

module.exports = DependencyChecker;
