#!/usr/bin/env node
// 鏈接驗證腳本
// 檢查 HTML 文件中的所有內部鏈接是否正確

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

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

// 尋找項目根目錄
function findProjectRoot() {
  let currentDir = process.cwd();

  // 如果當前在 scripts 目錄，向上查找
  while (currentDir !== path.parse(currentDir).root) {
    if (
      fs.existsSync(path.join(currentDir, 'package.json')) ||
      fs.existsSync(path.join(currentDir, 'src'))
    ) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return process.cwd();
}

// 遞歸查找所有 HTML 文件
function findHtmlFiles(dir, htmlFiles = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 跳過 node_modules 和 .git 目錄
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        findHtmlFiles(filePath, htmlFiles);
      }
    } else if (file.endsWith('.html')) {
      htmlFiles.push(filePath);
    }
  });

  return htmlFiles;
}

// 解析 HTML 文件並提取鏈接
function extractLinks(htmlFile) {
  try {
    const content = fs.readFileSync(htmlFile, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;

    const links = [];

    // 提取 href 鏈接
    const aElements = document.querySelectorAll('a[href]');
    aElements.forEach((element) => {
      const href = element.getAttribute('href');
      if (
        href &&
        !href.startsWith('http') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('#')
      ) {
        links.push({
          type: 'link',
          href: href,
          text: element.textContent.trim(),
          line: getLineNumber(content, element.outerHTML),
        });
      }
    });

    // 提取腳本源文件
    const scriptElements = document.querySelectorAll('script[src]');
    scriptElements.forEach((element) => {
      const src = element.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('//')) {
        links.push({
          type: 'script',
          href: src,
          text: `<script src="${src}">`,
          line: getLineNumber(content, element.outerHTML),
        });
      }
    });

    // 提取樣式表鏈接
    const linkElements = document.querySelectorAll('link[href]');
    linkElements.forEach((element) => {
      const href = element.getAttribute('href');
      const rel = element.getAttribute('rel');
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        links.push({
          type: 'stylesheet',
          href: href,
          text: `<link rel="${rel}" href="${href}">`,
          line: getLineNumber(content, element.outerHTML),
        });
      }
    });

    // 提取圖片源文件
    const imgElements = document.querySelectorAll('img[src]');
    imgElements.forEach((element) => {
      const src = element.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
        links.push({
          type: 'image',
          href: src,
          text: `<img src="${src}">`,
          line: getLineNumber(content, element.outerHTML),
        });
      }
    });

    return links;
  } catch (error) {
    log(`❌ 解析 ${htmlFile} 失敗: ${error.message}`, colors.red);
    return [];
  }
}

// 獲取元素在文件中的行號
function getLineNumber(content, elementHtml) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(elementHtml.substring(0, 50))) {
      return i + 1;
    }
  }
  return '?';
}

// 檢查文件是否存在
function checkFileExists(filePath, basePath) {
  // 處理不同類型的路徑
  let fullPath;

  if (filePath.startsWith('/')) {
    // 絕對路徑，從項目根目錄開始
    fullPath = path.join(basePath, filePath.substring(1));
  } else {
    // 相對路徑
    fullPath = path.resolve(path.dirname(basePath), filePath);
  }

  return fs.existsSync(fullPath);
}

// 驗證單個 HTML 文件
function validateHtmlFile(htmlFile, projectRoot) {
  log(`\n${colors.cyan}檢查: ${path.relative(projectRoot, htmlFile)}${colors.reset}`);

  const links = extractLinks(htmlFile);
  const results = [];

  if (links.length === 0) {
    log(`  ℹ️  沒有找到內部鏈接`, colors.yellow);
    return results;
  }

  links.forEach((link) => {
    const exists = checkFileExists(link.href, htmlFile);
    const result = {
      file: htmlFile,
      link: link,
      exists: exists,
    };

    results.push(result);

    if (exists) {
      log(`  ✅ ${link.type}: ${link.href}`, colors.green);
    } else {
      log(`  ❌ ${link.type}: ${link.href} (行 ${link.line})`, colors.red);
      log(`     ${link.text}`, colors.red);
    }
  });

  return results;
}

// 生成驗證報告
function generateValidationReport(allResults) {
  const totalLinks = allResults.length;
  const validLinks = allResults.filter((r) => r.exists).length;
  const brokenLinks = totalLinks - validLinks;

  log(`\n${colors.bold}${colors.cyan}=== 鏈接驗證報告 ===${colors.reset}`);
  log(`📊 總共檢查: ${totalLinks} 個鏈接`);
  log(`✅ 有效: ${validLinks}`, colors.green);
  log(`❌ 損壞: ${brokenLinks}`, brokenLinks > 0 ? colors.red : colors.green);
  log(`📈 有效率: ${totalLinks > 0 ? ((validLinks / totalLinks) * 100).toFixed(1) : 0}%`);

  if (brokenLinks > 0) {
    log(`\n${colors.bold}${colors.red}損壞的鏈接詳細信息:${colors.reset}`);

    // 按文件分組顯示損壞的鏈接
    const brokenByFile = {};
    allResults
      .filter((r) => !r.exists)
      .forEach((r) => {
        const fileName = path.relative(process.cwd(), r.file);
        if (!brokenByFile[fileName]) {
          brokenByFile[fileName] = [];
        }
        brokenByFile[fileName].push(r.link);
      });

    Object.entries(brokenByFile).forEach(([fileName, links]) => {
      log(`\n📄 ${fileName}:`);
      links.forEach((link) => {
        log(`  ❌ ${link.href} (行 ${link.line}) - ${link.type}`, colors.red);
      });
    });

    log(`\n${colors.yellow}修復建議:${colors.reset}`);
    log(`1. 檢查文件路徑是否正確`);
    log(`2. 確保引用的文件確實存在`);
    log(`3. 檢查大小寫是否匹配（區分大小寫的系統）`);
    log(`4. 使用相對路徑時注意當前文件位置`);
  }

  return {
    total: totalLinks,
    valid: validLinks,
    broken: brokenLinks,
    validRate: totalLinks > 0 ? (validLinks / totalLinks) * 100 : 100,
  };
}

// 主函數
async function main() {
  log(`${colors.bold}${colors.blue}🔗 Stock Insight Platform 鏈接驗證工具${colors.reset}`);

  const projectRoot = findProjectRoot();
  log(`項目根目錄: ${projectRoot}\n`);

  // 查找所有 HTML 文件
  const htmlFiles = findHtmlFiles(projectRoot);
  log(`找到 ${htmlFiles.length} 個 HTML 文件\n`);

  if (htmlFiles.length === 0) {
    log(`❌ 未找到 HTML 文件`, colors.red);
    process.exit(1);
  }

  // 驗證所有文件
  const allResults = [];
  for (const htmlFile of htmlFiles) {
    const results = validateHtmlFile(htmlFile, projectRoot);
    allResults.push(...results);
  }

  // 生成報告
  const report = generateValidationReport(allResults);

  // 退出代碼
  process.exit(report.broken > 0 ? 1 : 0);
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
  extractLinks,
  validateHtmlFile,
  generateValidationReport,
  findHtmlFiles,
};
