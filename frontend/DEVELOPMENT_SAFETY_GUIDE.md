# 🛡️ 開發安全指南 - 防止路徑管理問題

## 📋 背景

這份指南是為了防止在未來開發中出現「大歸模」（依賴混亂）問題而建立的。遵循這些規則可以確保路徑管理系統的穩定性和可維護性。

---

## 🚨 常見問題和預防措施

### 1. **循環依賴問題** ⚠️

#### 問題描述
```javascript
// ❌ 危險：循環依賴
// routes.js
import { someFunction } from './helper.js';

// helper.js  
import { ROUTES } from './routes.js'; // 循環依賴！
```

#### 預防措施
- ✅ **routes.js 應該是純配置文件**，不導入任何業務模組
- ✅ **所有其他文件導入 routes.js**，而不是相反
- ✅ **定期運行依賴檢查**：`npm run test:deps`

### 2. **導入路徑錯誤** ⚠️

#### 問題描述
```javascript
// ❌ 錯誤：路徑不正確
import { RouteUtils } from '../../config/routes.js'; // 可能錯誤

// ❌ 錯誤：絕對路徑
import { RouteUtils } from '/src/js/config/routes.js';
```

#### 預防措施
```javascript
// ✅ 正確：使用相對路徑
import { RouteUtils } from './config/routes.js';        // 同級
import { RouteUtils } from '../config/routes.js';       // 上一級
import { RouteUtils } from '../../config/routes.js';    // 上兩級
```

### 3. **模組載入順序問題** ⚠️

#### 問題描述
```javascript
// ❌ 錯誤：在 routes.js 載入前使用
console.log(ROUTES.pages.auth.login); // undefined!
```

#### 預防措施
```javascript
// ✅ 正確：確保先導入
import { RouteUtils, ROUTES } from './config/routes.js';
console.log(ROUTES.pages.auth.login); // 正常工作
```

---

## 🏗️ 架構規則

### 核心原則

1. **單一依賴方向** 📍
   ```
   routes.js ← 所有其他文件
   (routes.js 不依賴任何業務文件)
   ```

2. **分層架構** 🏢
   ```
   配置層 (routes.js)
   ↑
   工具層 (utils/)
   ↑
   業務層 (features/)
   ```

3. **路徑管理責任** 🎯
   - `routes.js`: 定義所有路徑
   - `RouteUtils`: 提供路徑操作方法
   - 業務文件: 只使用，不定義路徑

---

## ✅ 正確的開發模式

### 1. **新增頁面時**

```javascript
// 1. 先在 routes.js 中添加路徑
const ROUTES = {
  pages: {
    // ... existing pages
    newFeature: {
      list: '/src/pages/new-feature/list.html',
      detail: '/src/pages/new-feature/detail.html',
    },
  },
};

// 2. 在業務文件中使用
import { RouteUtils } from './config/routes.js';

function navigateToNewFeature() {
  RouteUtils.navigate('newFeature', 'list');
}
```

### 2. **新增 API 端點時**

```javascript
// 1. 先在 routes.js 中添加 API 配置
const ROUTES = {
  api: {
    endpoints: {
      // ... existing endpoints
      newFeature: {
        list: '/api/new-feature',
        create: '/api/new-feature',
        detail: '/api/new-feature/:id',
      },
    },
  },
};

// 2. 在業務文件中使用
import { RouteUtils } from './config/routes.js';

async function fetchNewFeatureList() {
  const url = RouteUtils.getApiUrl('newFeature', 'list');
  return fetch(url);
}
```

### 3. **新增組件時**

```javascript
// 1. 先在 routes.js 中添加組件路徑
const ROUTES = {
  components: {
    // ... existing components
    newComponent: '/src/components/new-component.html',
  },
};

// 2. 在業務文件中使用
import { ROUTES } from './config/routes.js';

await loadComponent('newComponent', ROUTES.components.newComponent);
```

---

## 🔧 安全檢查工具

### 自動檢查命令

```bash
# 基本安全檢查
npm run check:safety

# 完整依賴檢查
npm run test:deps

# 完整測試（包含依賴檢查）
npm run test:ci
```

### 檢查項目

1. **循環依賴檢測** 🔄
2. **路徑正確性驗證** 🔗
3. **routes.js 純潔性檢查** 📍
4. **文件存在性驗證** 📁

---

## ❌ 禁止的操作

### 1. **在 routes.js 中導入業務模組**
```javascript
// ❌ 絕對禁止
import { someBusinessFunction } from '../features/something.js';
```

### 2. **在業務文件中定義路徑**
```javascript
// ❌ 錯誤：路徑應該在 routes.js 中定義
const LOGIN_PATH = '/src/pages/auth/login.html';
```

### 3. **跳過路徑管理系統**
```javascript
// ❌ 錯誤：直接使用硬編碼路徑
window.location.href = '/src/pages/auth/login.html';

// ✅ 正確：使用路徑管理系統
RouteUtils.redirectToLogin();
```

### 4. **修改 RouteUtils 的核心邏輯**
```javascript
// ❌ 危險：不要隨意修改核心工具函數
RouteUtils.getPagePath = function() { /* 自定義邏輯 */ };
```

---

## 🚀 開發工作流程

### 新功能開發檢查清單

- [ ] 1. **規劃路徑結構** - 確定需要的頁面和 API 路徑
- [ ] 2. **更新 routes.js** - 添加新的路徑配置
- [ ] 3. **實施業務邏輯** - 使用 RouteUtils 而不是硬編碼
- [ ] 4. **運行安全檢查** - `npm run check:safety`
- [ ] 5. **測試路徑功能** - `npm run test:routes`
- [ ] 6. **完整測試** - `npm run test:ci`

### 重構時的檢查清單

- [ ] 1. **檢查現有依賴** - `npm run test:deps`
- [ ] 2. **逐步更新路徑** - 一次更新一個文件
- [ ] 3. **運行測試** - 每次更新後測試
- [ ] 4. **驗證功能** - 確保所有功能正常
- [ ] 5. **清理舊代碼** - 移除不再需要的硬編碼路徑

---

## 📊 監控和維護

### 定期檢查（建議每週）

```bash
# 運行完整檢查
npm run test:ci

# 檢查路徑一致性
npm run test:routes

# 檢查依賴關係
npm run test:deps
```

### 性能監控

1. **導入數量** - 避免過多的 routes.js 導入
2. **文件大小** - routes.js 應保持輕量
3. **載入時間** - 監控路徑解析的性能

### 文檔更新

1. **路徑變更時** - 更新相關文檔
2. **新功能添加時** - 更新使用示例
3. **架構調整時** - 更新本指南

---

## 🎯 最佳實踐總結

### 開發原則

1. **配置集中化** - 所有路徑在 routes.js 中定義
2. **依賴單向化** - 只有業務文件依賴 routes.js
3. **操作標準化** - 使用 RouteUtils 進行路徑操作
4. **檢查自動化** - 定期運行安全檢查

### 團隊協作

1. **代碼審查** - 重點檢查路徑管理相關代碼
2. **文檔維護** - 及時更新路徑相關文檔
3. **知識分享** - 確保團隊成員了解路徑管理規則
4. **工具使用** - 積極使用自動檢查工具

### 問題解決

1. **遇到循環依賴** - 重新設計模組結構
2. **路徑錯誤** - 使用依賴檢查工具定位
3. **性能問題** - 檢查是否過度使用動態路徑
4. **維護困難** - 考慮重構和簡化

---

## 📞 求助指南

### 遇到問題時

1. **運行檢查工具** - `npm run test:deps`
2. **查看錯誤報告** - 根據提示修復問題
3. **參考文檔** - 查看相關指南和示例
4. **尋求幫助** - 聯繫團隊成員或查看 Git 歷史

### 常見錯誤解決

- **循環依賴** → 重新設計模組關係
- **路徑錯誤** → 檢查相對路徑計算
- **導入失敗** → 確認文件存在和路徑正確
- **功能異常** → 檢查 routes.js 配置

---

## 🎉 結論

遵循這份安全指南可以：

- 🛡️ **防止循環依賴問題**
- 🔧 **確保路徑管理的一致性**
- 🚀 **提高開發效率**
- 📈 **降低維護成本**

**記住**：路徑管理系統的核心是**簡單、一致、可預測**。當你不確定時，優先選擇最簡單和最一致的方案！ 
