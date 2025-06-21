#!/usr/bin/env node

// organize-project.js - 項目結構優化工具
// 自動檢查和優化項目文件結構

const fs = require('fs');
const path = require('path');

class ProjectOrganizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.issues = [];
    this.suggestions = [];
    this.fixes = [];
  }

  // 檢查項目結構
  checkProjectStructure() {
    console.log('🔍 檢查項目結構...\n');

    this.checkDirectoryStructure();
    this.checkFileNaming();
    this.checkFileSize();
    this.checkEmptyFiles();
    this.checkDuplicateFiles();

    this.generateReport();
  }

  // 檢查目錄結構
  checkDirectoryStructure() {
    const requiredDirs = [
      'src/js/config',
      'src/js/utils',
      'src/js/components',
      'src/css',
      'src/pages',
      'tests/unit',
      'tests/e2e',
      'docs',
      'scripts',
    ];

    console.log('📁 檢查目錄結構...');

    requiredDirs.forEach((dir) => {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        this.issues.push(`缺少必要目錄: ${dir}`);
        this.suggestions.push(`建議創建目錄: ${dir}`);
      } else {
        console.log(`  ✅ ${dir}`);
      }
    });
  }

  // 檢查文件命名規範
  checkFileNaming() {
    console.log('\n📝 檢查文件命名規範...');

    const srcDir = path.join(this.projectRoot, 'src');
    this.walkDirectory(srcDir, (filePath, fileName) => {
      // JavaScript 文件應該使用 camelCase
      if (fileName.endsWith('.js') && !this.isCamelCase(fileName.replace('.js', ''))) {
        this.issues.push(`文件命名不符合規範: ${filePath} (應使用 camelCase)`);
      }

      // CSS 文件應該使用 kebab-case
      if (fileName.endsWith('.css') && !this.isKebabCase(fileName.replace('.css', ''))) {
        this.issues.push(`CSS 文件命名不符合規範: ${filePath} (應使用 kebab-case)`);
      }

      // HTML 文件應該使用 kebab-case
      if (fileName.endsWith('.html') && !this.isKebabCase(fileName.replace('.html', ''))) {
        this.issues.push(`HTML 文件命名不符合規範: ${filePath} (應使用 kebab-case)`);
      }
    });
  }

  // 檢查文件大小
  checkFileSize() {
    console.log('\n📏 檢查文件大小...');

    const maxSizes = {
      '.js': 500 * 1024, // 500KB
      '.css': 100 * 1024, // 100KB
      '.html': 50 * 1024, // 50KB
    };

    const srcDir = path.join(this.projectRoot, 'src');
    this.walkDirectory(srcDir, (filePath, fileName) => {
      const ext = path.extname(fileName);
      const maxSize = maxSizes[ext];

      if (maxSize) {
        const stats = fs.statSync(filePath);
        if (stats.size > maxSize) {
          this.issues.push(
            `文件過大: ${filePath} (${(stats.size / 1024).toFixed(1)}KB > ${(maxSize / 1024).toFixed(1)}KB)`,
          );
          this.suggestions.push(`建議拆分大文件: ${filePath}`);
        }
      }
    });
  }

  // 檢查空文件
  checkEmptyFiles() {
    console.log('\n📄 檢查空文件...');

    const srcDir = path.join(this.projectRoot, 'src');
    this.walkDirectory(srcDir, (filePath, fileName) => {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        this.issues.push(`發現空文件: ${filePath}`);
        this.suggestions.push(`建議刪除或填充空文件: ${filePath}`);
      }
    });
  }

  // 檢查重複文件
  checkDuplicateFiles() {
    console.log('\n🔄 檢查重複文件...');

    const fileHashes = new Map();
    const crypto = require('crypto');

    const srcDir = path.join(this.projectRoot, 'src');
    this.walkDirectory(srcDir, (filePath, fileName) => {
      if (path.extname(fileName) === '.js') {
        const content = fs.readFileSync(filePath, 'utf8');
        const hash = crypto.createHash('md5').update(content).digest('hex');

        if (fileHashes.has(hash)) {
          this.issues.push(`發現重複文件: ${filePath} 與 ${fileHashes.get(hash)}`);
        } else {
          fileHashes.set(hash, filePath);
        }
      }
    });
  }

  // 遍歷目錄
  walkDirectory(dir, callback) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        this.walkDirectory(filePath, callback);
      } else {
        callback(filePath, file);
      }
    });
  }

  // 檢查是否為 camelCase
  isCamelCase(str) {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  // 檢查是否為 kebab-case
  isKebabCase(str) {
    return /^[a-z][a-z0-9-]*$/.test(str);
  }

  // 生成報告
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 項目結構檢查報告');
    console.log('='.repeat(60));

    if (this.issues.length === 0) {
      console.log('🎉 項目結構完美！沒有發現任何問題。');
      return;
    }

    console.log(`\n❌ 發現 ${this.issues.length} 個問題:`);
    this.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });

    if (this.suggestions.length > 0) {
      console.log(`\n💡 改進建議:`);
      this.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }

    console.log('\n🔧 修復建議:');
    console.log('  1. 運行 npm run quality:fix 修復代碼格式');
    console.log('  2. 重構大文件，拆分為多個小模組');
    console.log('  3. 刪除或填充空文件');
    console.log('  4. 重新命名不符合規範的文件');
  }

  // 自動修復一些問題
  autoFix() {
    console.log('🔧 自動修復項目結構問題...\n');

    // 創建缺失的目錄
    const requiredDirs = ['src/js/config', 'src/js/utils', 'src/js/components', 'docs'];

    requiredDirs.forEach((dir) => {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ 創建目錄: ${dir}`);
        this.fixes.push(`創建目錄: ${dir}`);
      }
    });

    // 刪除空文件
    const srcDir = path.join(this.projectRoot, 'src');
    this.walkDirectory(srcDir, (filePath, fileName) => {
      const stats = fs.statSync(filePath);
      if (stats.size === 0 && !fileName.includes('keep')) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  刪除空文件: ${filePath}`);
        this.fixes.push(`刪除空文件: ${filePath}`);
      }
    });

    if (this.fixes.length > 0) {
      console.log(`\n✅ 自動修復了 ${this.fixes.length} 個問題`);
    } else {
      console.log('\n🎉 沒有需要自動修復的問題');
    }
  }
}

// 主程序
function main() {
  const args = process.argv.slice(2);
  const organizer = new ProjectOrganizer();

  if (args.includes('--fix')) {
    organizer.autoFix();
  } else {
    organizer.checkProjectStructure();
  }
}

if (require.main === module) {
  main();
}

module.exports = ProjectOrganizer;
