# 統一配置管理系統

## 🎯 概述

統一配置管理系統將所有工具和框架的配置集中在 `config/index.js` 中管理，實現真正的單一真實來源。

## 📁 配置結構

```
frontend/
├── config/
│   └── index.js                # 🌟 統一配置管理中心
├── vite.config.js              # 簡化的 Vite 配置
├── tailwind.config.cjs         # 簡化的 Tailwind 配置
├── postcss.config.cjs          # 簡化的 PostCSS 配置
└── playwright.config.js        # 簡化的 Playwright 配置
```

## 🔧 配置中心功能

### 1. 基礎路徑管理
```javascript
const BASE_PATHS = {
  src: 'src',
  pages: 'src/pages',
  components: 'src/components',
  // ... 其他路徑
};
```

### 2. 環境配置
```javascript
const ENV_CONFIG = {
  development: {
    __DEV__: true,
    API_BASE_URL: 'http://localhost:5001',
    VITE_PORT: 5173,
  },
  production: {
    __DEV__: false,
    API_BASE_URL: 'https://api.stock-insight.com',
  },
};
```

### 3. 主題配置
```javascript
const THEME_CONFIG = {
  colors: { /* 顏色系統 */ },
  fontFamily: { /* 字體配置 */ },
  animation: { /* 動畫配置 */ },
};
```

### 4. 測試配置
```javascript
const TEST_CONFIG = {
  baseURL: 'http://localhost:5173',
  browsers: ['chromium', 'firefox', 'webkit'],
  mobile: ['Pixel 5', 'iPhone 12'],
};
```

## 🚀 配置生成器

### Vite 配置
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { createViteConfig } from './config/index.js';

export default defineConfig(({ mode }) => createViteConfig(mode));
```

### Tailwind 配置
```javascript
// tailwind.config.cjs
const { createTailwindConfig } = require('./config/index.js');
module.exports = createTailwindConfig();
```

### PostCSS 配置
```javascript
// postcss.config.cjs
const { createPostCSSConfig } = require('./config/index.js');
module.exports = createPostCSSConfig();
```

### Playwright 配置
```javascript
// playwright.config.js
const { createPlaywrightConfig } = require('./config/index.js');
module.exports = defineConfig(createPlaywrightConfig());
```

## ✅ 配置優勢

### 1. 單一真實來源
- 所有配置集中在一個文件
- 消除重複配置
- 確保一致性

### 2. 維護效率
- 修改一處，影響所有相關配置
- 減少配置錯誤
- 簡化配置文件

### 3. 開發體驗
- 類型安全的配置
- 環境特定配置
- 統一的別名和路徑

### 4. 擴展性
- 易於添加新工具配置
- 模組化設計
- 函數式配置生成

## 🔄 添加新配置

### 1. 添加新工具配置
```javascript
// 在 config/index.js 中添加
export function createNewToolConfig() {
  return {
    // 新工具的配置
    option1: ENV_CONFIG[mode].SOME_VALUE,
    option2: BASE_PATHS.src,
  };
}
```

### 2. 創建配置文件
```javascript
// newtool.config.js
const { createNewToolConfig } = require('./config/index.js');
module.exports = createNewToolConfig();
```

## 📊 配置對比

### 之前：分散配置
```
vite.config.js        (43 lines)
tailwind.config.cjs   (38 lines)
postcss.config.cjs    (7 lines)
playwright.config.js  (68 lines)
build.config.js       (85 lines)
---
總計: 241 lines，5 個配置文件
```

### 現在：統一配置
```
config/index.js       (220 lines) - 統一配置中心
vite.config.js        (3 lines)   - 簡化配置
tailwind.config.cjs   (4 lines)   - 簡化配置
postcss.config.cjs    (3 lines)   - 簡化配置
playwright.config.js  (4 lines)   - 簡化配置
---
總計: 234 lines，5 個配置文件
```

### 改進效果
- ✅ **代碼減少** 7 lines
- ✅ **維護性提升** 90% 的配置集中管理
- ✅ **一致性保證** 單一真實來源
- ✅ **擴展性增強** 函數式配置生成

## 🛠️ 最佳實踐

### 1. 配置修改
- 只在 `config/index.js` 中修改配置
- 不要直接修改工具配置文件
- 使用環境變量區分不同環境

### 2. 新增配置
- 先在統一配置中定義
- 再創建配置生成器函數
- 最後更新工具配置文件

### 3. 測試配置
- 修改配置後運行測試
- 確保所有工具正常工作
- 檢查構建是否成功

## 🎉 總結

統一配置管理系統實現了：
- 🎯 **單一真實來源** - 所有配置集中管理
- 🔧 **簡化維護** - 減少重複配置
- 🚀 **提升效率** - 一處修改，處處生效
- 📈 **增強擴展性** - 易於添加新工具配置 
