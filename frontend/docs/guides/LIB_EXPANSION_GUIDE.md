# Stock Insight Platform - 組件庫擴展實施指南

## 📋 概覽

本指南提供將現有 `/lib` 組件庫擴展為支持客戶個性化的完整實施方案。基於您現有的 4 個核心組件（Toast、Modal、Loading、Formatter），我們將構建一個可擴展、可配置的組件庫架構。

## 🎯 擴展目標

### 短期目標 (1-2 個月)
- ✅ **主題系統**: CSS 變數 + 動態主題切換
- ✅ **組件配置化**: 每個組件支持深度配置
- ✅ **配置管理**: 統一的配置系統
- ✅ **向後兼容**: 現有代碼無需修改

### 長期目標 (3-6 個月)
- 🚀 **插件系統**: 支持自定義組件和功能
- 🚀 **多租戶支持**: 企業級客戶個性化
- 🚀 **可視化配置**: 主題構建器和組件預覽
- 🚀 **生態系統**: 第三方插件和社區貢獻

---

## 🏗️ 建議的擴展架構

### 新增目錄結構
```
src/lib/
├── index.js                    # 主入口 (現有)
├── components/                 # 組件目錄 (現有)
│   ├── Toast.js               # 現有組件
│   ├── Modal.js               # 現有組件
│   ├── Loading.js             # 現有組件
│   └── factory.js             # 🆕 組件工廠
├── data/                      # 數據工具 (現有)
│   ├── Formatter.js           # 現有工具
│   └── validator.js           # 🆕 配置驗證器
├── themes/                    # 🆕 主題系統
│   ├── default/
│   │   ├── colors.css
│   │   ├── typography.css
│   │   └── spacing.css
│   ├── corporate/
│   │   └── theme.css
│   ├── custom/
│   │   └── customer-theme.css
│   └── builder.js             # 主題構建器
├── config/                    # 🆕 配置管理
│   ├── customer.js            # 客戶配置入口
│   ├── themes.js              # 主題配置
│   ├── components.js          # 組件配置
│   └── defaults.js            # 默認配置
├── plugins/                   # 🆕 插件系統
│   ├── core/
│   ├── custom/
│   └── registry.js
└── styles/                    # 樣式目錄 (現有)
    ├── lib.css                # 現有樣式
    └── variables.css          # 🆕 CSS 變數
```

---

## 🚀 第一階段實施 (建議立即開始)

### 1. CSS 變數系統

首先創建 CSS 變數系統，這是所有個性化的基礎：

```css
/* src/lib/styles/variables.css */
:root {
  /* 顏色系統 */
  --lib-primary: #3b82f6;
  --lib-secondary: #64748b;
  --lib-success: #10b981;
  --lib-warning: #f59e0b;
  --lib-error: #ef4444;
  --lib-background: #ffffff;
  --lib-surface: #f8fafc;
  --lib-text: #1e293b;
  --lib-text-secondary: #64748b;

  /* 字體系統 */
  --lib-font-family: 'Inter', -apple-system, sans-serif;
  --lib-font-size-sm: 0.875rem;
  --lib-font-size-base: 1rem;
  --lib-font-size-lg: 1.125rem;
  --lib-font-weight-normal: 400;
  --lib-font-weight-medium: 500;
  --lib-font-weight-bold: 600;

  /* 間距系統 */
  --lib-spacing-xs: 0.25rem;
  --lib-spacing-sm: 0.5rem;
  --lib-spacing-md: 1rem;
  --lib-spacing-lg: 1.5rem;
  --lib-spacing-xl: 2rem;

  /* 圓角系統 */
  --lib-radius-sm: 0.25rem;
  --lib-radius-md: 0.5rem;
  --lib-radius-lg: 0.75rem;

  /* 陰影系統 */
  --lib-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --lib-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --lib-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* 動畫系統 */
  --lib-transition-fast: 150ms ease-in-out;
  --lib-transition-normal: 250ms ease-in-out;
  --lib-transition-slow: 350ms ease-in-out;
}

/* 深色主題 */
[data-theme="dark"] {
  --lib-primary: #60a5fa;
  --lib-background: #0f172a;
  --lib-surface: #1e293b;
  --lib-text: #f1f5f9;
  --lib-text-secondary: #94a3b8;
}

/* 企業主題 */
[data-theme="corporate"] {
  --lib-primary: #1e40af;
  --lib-secondary: #475569;
  --lib-radius-md: 0.25rem; /* 更方正的設計 */
  --lib-font-family: 'Roboto', sans-serif;
}
```

### 2. 主題管理系統

```javascript
// src/lib/config/themes.js
export const ThemeManager = {
  currentTheme: 'default',
  availableThemes: ['default', 'dark', 'corporate'],
  
  // 應用主題
  applyTheme(themeName) {
    if (!this.availableThemes.includes(themeName)) {
      console.warn(`Theme "${themeName}" not found, using default`);
      themeName = 'default';
    }
    
    document.documentElement.setAttribute('data-theme', themeName);
    this.currentTheme = themeName;
    
    // 觸發主題變更事件
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: themeName }
    }));
    
    console.log(`🎨 Theme applied: ${themeName}`);
  },
  
  // 獲取當前主題
  getCurrentTheme() {
    return this.currentTheme;
  },
  
  // 註冊新主題
  registerTheme(name, cssVariables) {
    if (!this.availableThemes.includes(name)) {
      this.availableThemes.push(name);
    }
    
    // 動態注入 CSS 變數
    const style = document.createElement('style');
    style.textContent = `
      [data-theme="${name}"] {
        ${Object.entries(cssVariables).map(([key, value]) => 
          `--lib-${key}: ${value};`
        ).join('\n        ')}
      }
    `;
    document.head.appendChild(style);
  },
  
  // 從配置應用主題
  applyThemeFromConfig(config) {
    if (config.customTheme) {
      this.registerTheme('custom', config.customTheme);
      this.applyTheme('custom');
    } else if (config.theme) {
      this.applyTheme(config.theme);
    }
  }
};
```

### 3. 組件配置化改造

以 Toast 組件為例，展示如何添加配置支持：

```javascript
// src/lib/components/Toast.js (配置化版本)
export class ConfigurableToast {
  constructor(config = {}) {
    // 合併默認配置和用戶配置
    this.config = {
      position: 'top-right',
      duration: 3000,
      maxToasts: 5,
      animation: 'slide',
      theme: 'default',
      customStyles: {},
      ...config
    };
    
    this.container = null;
    this.toasts = [];
    this.init();
  }
  
  init() {
    this.createContainer();
    this.loadStyles();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = `toast-container toast-${this.config.position}`;
    this.container.setAttribute('data-theme', this.config.theme);
    
    // 應用自定義樣式
    if (this.config.customStyles.container) {
      Object.assign(this.container.style, this.config.customStyles.container);
    }
    
    document.body.appendChild(this.container);
  }
  
  show(message, type = 'info', options = {}) {
    const toastConfig = { ...this.config, ...options };
    const toast = this.createToast(message, type, toastConfig);
    
    this.toasts.push(toast);
    this.container.appendChild(toast.element);
    
    // 管理最大數量
    if (this.toasts.length > this.config.maxToasts) {
      this.removeOldestToast();
    }
    
    // 動畫進入
    this.animateIn(toast.element);
    
    // 自動移除
    if (toastConfig.duration > 0) {
      setTimeout(() => this.remove(toast.id), toastConfig.duration);
    }
    
    return toast.id;
  }
  
  createToast(message, type, config) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const element = document.createElement('div');
    
    element.className = `toast toast-${type} toast-${config.animation}`;
    element.setAttribute('data-toast-id', id);
    
    // 使用 CSS 變數進行樣式配置
    element.style.cssText = `
      background: var(--lib-${type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'surface'});
      color: var(--lib-text);
      border-radius: var(--lib-radius-md);
      box-shadow: var(--lib-shadow-lg);
      font-family: var(--lib-font-family);
      transition: var(--lib-transition-normal);
    `;
    
    element.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="window.lib.toast.remove('${id}')">&times;</button>
      </div>
    `;
    
    return { id, element, type, config };
  }
  
  // ... 其他方法保持不變，但使用 CSS 變數
}

// 工廠函數支持配置
export function createToast(config = {}) {
  return new ConfigurableToast(config);
}

// 向後兼容的默認實例
export const toast = new ConfigurableToast();
export { ConfigurableToast as Toast };
```

### 4. 配置管理系統

```javascript
// src/lib/config/customer.js
export class CustomerConfig {
  constructor() {
    this.config = this.loadConfig();
    this.watchers = [];
  }
  
  // 載入配置（支持多種來源）
  loadConfig() {
    const config = {
      // 默認配置
      theme: 'default',
      components: {
        toast: {
          position: 'top-right',
          duration: 3000
        },
        modal: {
          backdrop: true,
          keyboard: true
        },
        loading: {
          spinner: 'dots',
          overlay: true
        }
      },
      branding: {
        primaryColor: '#3b82f6',
        logo: null,
        fontFamily: 'Inter'
      }
    };
    
    // 從環境變數載入
    const envConfig = this.loadFromEnv();
    
    // 從本地存儲載入
    const localConfig = this.loadFromLocalStorage();
    
    // 從 API 載入（異步）
    this.loadFromAPI().then(apiConfig => {
      this.updateConfig(apiConfig);
    });
    
    return this.mergeConfigs(config, envConfig, localConfig);
  }
  
  loadFromEnv() {
    const config = {};
    
    // 檢查環境變數
    if (window.CUSTOMER_THEME) {
      config.theme = window.CUSTOMER_THEME;
    }
    
    if (window.CUSTOMER_PRIMARY_COLOR) {
      config.branding = config.branding || {};
      config.branding.primaryColor = window.CUSTOMER_PRIMARY_COLOR;
    }
    
    return config;
  }
  
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('customer-config');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Failed to load config from localStorage:', e);
      return {};
    }
  }
  
  async loadFromAPI() {
    try {
      // 假設有一個配置 API
      const response = await fetch('/api/customer/config');
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Failed to load config from API:', e);
    }
    return {};
  }
  
  mergeConfigs(...configs) {
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {});
  }
  
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
  
  // 更新配置
  updateConfig(newConfig) {
    const oldConfig = { ...this.config };
    this.config = this.mergeConfigs(this.config, newConfig);
    
    // 觸發變更監聽器
    this.watchers.forEach(watcher => {
      watcher(this.config, oldConfig);
    });
    
    // 保存到本地存儲
    this.saveToLocalStorage();
  }
  
  saveToLocalStorage() {
    try {
      localStorage.setItem('customer-config', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save config to localStorage:', e);
    }
  }
  
  // 獲取配置
  get(path) {
    return this.getNestedValue(this.config, path);
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
  
  // 監聽配置變更
  watch(callback) {
    this.watchers.push(callback);
    return () => {
      const index = this.watchers.indexOf(callback);
      if (index > -1) {
        this.watchers.splice(index, 1);
      }
    };
  }
}

// 全局配置實例
export const customerConfig = new CustomerConfig();
```

### 5. 更新主入口文件

```javascript
// src/lib/index.js (更新版本)
/**
 * Stock Insight Platform - Component Library v2.0
 * 支持客戶個性化的可配置組件庫
 */

// 導入配置系統
import { customerConfig } from './config/customer.js';
import { ThemeManager } from './config/themes.js';

// 導入組件（保持向後兼容）
import toast, { Toast, createToast } from './components/Toast.js';
import Modal from './components/Modal.js';
import loading, { Loading } from './components/Loading.js';
import formatter, { Formatter } from './data/Formatter.js';

// 導入新功能
import { ComponentFactory } from './components/factory.js';

// 統一導出（保持向後兼容）
export {
  // 原有組件
  toast, Toast, createToast,
  Modal,
  loading, Loading,
  formatter, Formatter,
  
  // 新增功能
  customerConfig,
  ThemeManager,
  ComponentFactory
};

// 默認導出
export default {
  // 組件
  toast, Toast, createToast,
  Modal, loading, Loading,
  formatter, Formatter,
  
  // 配置和主題
  config: customerConfig,
  theme: ThemeManager,
  factory: ComponentFactory,
  
  // 便捷方法
  configure: (config) => customerConfig.updateConfig(config),
  setTheme: (theme) => ThemeManager.applyTheme(theme)
};

// 全局註冊（向後兼容）
if (typeof window !== 'undefined') {
  // 保持現有的全局變數
  window.toast = toast;
  window.Toast = Toast;
  window.Modal = Modal;
  window.loading = loading;
  window.Loading = Loading;
  window.formatter = formatter;
  window.Formatter = Formatter;
  
  // 新增全局配置
  window.lib = {
    // 組件
    toast, Toast, createToast,
    Modal, loading, Loading,
    formatter, Formatter,
    
    // 配置系統
    config: customerConfig,
    theme: ThemeManager,
    factory: ComponentFactory,
    
    // 便捷方法
    configure: (config) => customerConfig.updateConfig(config),
    setTheme: (theme) => ThemeManager.applyTheme(theme)
  };
  
  // 初始化
  const initLib = () => {
    // 應用配置
    const config = customerConfig.config;
    
    // 應用主題
    if (config.theme) {
      ThemeManager.applyTheme(config.theme);
    }
    
    // 應用品牌配置
    if (config.branding) {
      ThemeManager.applyThemeFromConfig(config);
    }
    
    console.log('📚 Component Library v2.0 loaded:', {
      components: ['Toast', 'Modal', 'Loading', 'Formatter'],
      features: ['Theming', 'Configuration', 'Factory'],
      theme: ThemeManager.getCurrentTheme(),
      global: 'window.lib'
    });
  };
  
  // 在 DOM 準備好後初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLib);
  } else {
    initLib();
  }
}
```

---

## 📋 實施檢查清單

### ✅ 第一階段 (立即開始)
- [ ] 創建 CSS 變數系統 (`styles/variables.css`)
- [ ] 實施主題管理器 (`config/themes.js`)
- [ ] 配置化現有組件 (Toast, Modal, Loading)
- [ ] 建立配置管理系統 (`config/customer.js`)
- [ ] 更新主入口文件 (`index.js`)
- [ ] 創建基礎測試

### 🚀 第二階段 (1-2 個月後)
- [ ] 組件工廠系統
- [ ] 插件架構基礎
- [ ] 可視化配置界面
- [ ] 更多主題選項
- [ ] 性能優化

### 🎯 第三階段 (3-4 個月後)
- [ ] 多租戶支持
- [ ] 企業級功能
- [ ] 第三方集成
- [ ] 社區生態系統

---

## 🔧 使用範例

### 基礎使用（向後兼容）
```javascript
// 現有代碼無需修改
toast.show('Hello World!');
Modal.show('Title', 'Content');
```

### 配置化使用
```javascript
// 應用企業主題
lib.setTheme('corporate');

// 自定義配置
lib.configure({
  theme: 'dark',
  components: {
    toast: {
      position: 'bottom-right',
      duration: 5000
    }
  },
  branding: {
    primaryColor: '#1e40af',
    fontFamily: 'Roboto'
  }
});

// 創建自定義組件實例
const customToast = createToast({
  position: 'top-center',
  theme: 'corporate',
  customStyles: {
    container: { zIndex: 9999 }
  }
});
```

### 動態主題切換
```javascript
// 監聽主題變更
window.addEventListener('themeChanged', (event) => {
  console.log('Theme changed to:', event.detail.theme);
});

// 切換主題
lib.setTheme('dark');
```

---

## 🎉 預期效果

實施完成後，您將擁有：

1. **100% 向後兼容** - 現有代碼無需修改
2. **靈活的主題系統** - 支持品牌個性化
3. **深度可配置** - 每個組件都可自定義
4. **企業級功能** - 多租戶和白標支持
5. **開發者友好** - 清晰的 API 和文檔
6. **性能優化** - 按需載入和緩存機制

這個架構將為您的平台提供強大的客戶個性化能力，同時保持代碼的整潔和可維護性！ 
