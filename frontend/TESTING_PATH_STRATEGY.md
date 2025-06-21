# 🧪 測試路徑管理策略說明

## 📋 問題背景

用戶發現測試文件中仍然存在硬編碼路徑，想了解為什麼會這樣。本文檔解釋了不同類型測試中路徑管理的策略和原因。

---

## 🎯 測試分類與路徑策略

### 1. **單元測試** - 故意使用硬編碼路徑 ✅

#### 文件：
- `tests/unit/utils/routes.test.js`
- `tests/unit/utils/path-management.test.js`

#### 策略：**必須使用硬編碼路徑**

```javascript
// ✅ 正確：測試驗證系統返回正確的硬編碼路徑
expect(ROUTES.pages.auth.login).toBe('/src/pages/auth/login.html');
expect(RouteUtils.getPagePath('auth', 'login')).toBe('/src/pages/auth/login.html');
```

#### 原因：
1. **測試目的**：驗證路徑管理系統本身是否正確
2. **驗證邏輯**：確保系統返回**預期的硬編碼值**
3. **測試原則**：如果測試中也使用動態路徑，就無法驗證系統的正確性

#### 類比說明：
```javascript
// 如果我們要測試一個加法函數
function add(a, b) { return a + b; }

// 測試必須使用具體數字，不能使用變量
test('加法函數', () => {
  expect(add(2, 3)).toBe(5); // ✅ 正確
  // expect(add(x, y)).toBe(z); // ❌ 錯誤，無法驗證
});
```

### 2. **E2E 測試** - 使用統一路徑管理 ✅

#### 文件：
- `tests/e2e/auth.spec.js`
- `tests/e2e/test-config.js` (新增)

#### 策略：**使用統一路徑管理**

```javascript
// ❌ 舊方式：硬編碼
await page.goto('http://localhost:5173/src/pages/auth/login.html');

// ✅ 新方式：統一管理
await page.goto(TestRouteUtils.getPageUrl('auth', 'login'));
```

#### 原因：
1. **測試目的**：驗證用戶完整流程，不是測試路徑系統本身
2. **維護性**：路徑變更時只需更新配置文件
3. **一致性**：與應用代碼使用相同的路徑管理策略

---

## 🏗️ E2E 測試路徑架構

### 測試配置助手 (`test-config.js`)

```javascript
const TEST_CONFIG = {
  BASE_URL: 'http://localhost:5173',
  PAGES: {
    AUTH: {
      LOGIN: '/src/pages/auth/login.html',
      REGISTER: '/src/pages/auth/register.html',
    },
    DASHBOARD: {
      INDEX: '/src/pages/dashboard/index.html',
      // ...
    },
  },
};

const TestRouteUtils = {
  getPageUrl(category, page) {
    const path = TEST_CONFIG.PAGES[category.toUpperCase()]?.[page.toUpperCase()];
    return `${TEST_CONFIG.BASE_URL}${path}`;
  },
};
```

### 為什麼需要特殊的測試配置？

1. **環境差異**：
   - E2E 測試運行在 Node.js 環境
   - 無法直接使用瀏覽器端的 ES6 模組
   - 需要 CommonJS 格式 (`module.exports`)

2. **URL 需求**：
   - E2E 測試需要完整 URL（包含域名端口）
   - 應用代碼只需相對路徑

3. **獨立性**：
   - 測試不應依賴應用代碼的具體實現
   - 需要獨立的配置管理

---

## 📊 路徑管理策略對比

| 測試類型 | 路徑策略 | 原因 | 示例 |
|---------|---------|------|------|
| **單元測試** | 硬編碼路徑 | 驗證系統正確性 | `expect(path).toBe('/src/pages/auth/login.html')` |
| **E2E 測試** | 統一路徑管理 | 維護性和一致性 | `TestRouteUtils.getPageUrl('auth', 'login')` |
| **集成測試** | 統一路徑管理 | 測試實際使用場景 | `RouteUtils.getPagePath('auth', 'login')` |

---

## 🔍 具體文件分析

### 1. `tests/unit/utils/path-management.test.js`

```javascript
describe('ROUTES 配置', () => {
  test('應該包含所有必要的頁面路徑', () => {
    // ✅ 這些硬編碼路徑是必要的
    expect(ROUTES.pages.auth.login).toBe('/src/pages/auth/login.html');
    expect(ROUTES.pages.auth.register).toBe('/src/pages/auth/register.html');
  });
});
```

**分析**：這個測試在驗證 `ROUTES` 配置對象是否包含正確的路徑值。如果我們不使用硬編碼路徑來驗證，就無法確保配置的正確性。

### 2. `tests/unit/utils/routes.test.js`

```javascript
test('getCurrentPageCategory', () => {
  // Mock 當前頁面路徑
  window.location.pathname = '/src/pages/auth/login.html';
  // ✅ 這個硬編碼路徑用於模擬測試環境
  expect(getCurrentPageCategory()).toBe('auth');
});
```

**分析**：這裡使用硬編碼路徑來模擬瀏覽器環境，測試路徑解析功能。

### 3. `tests/e2e/auth.spec.js`

```javascript
// ✅ 現在使用統一路徑管理
test('用戶登入流程', async ({ page }) => {
  await page.goto(TestRouteUtils.getPageUrl('auth', 'login'));
  // 測試登入流程...
});
```

**分析**：E2E 測試關注的是用戶流程，不是路徑系統本身，所以使用統一路徑管理。

---

## 🎯 最佳實踐總結

### ✅ 正確做法

1. **單元測試**：
   - 測試路徑管理系統時使用硬編碼路徑
   - 確保測試驗證的是實際的路徑值

2. **E2E 測試**：
   - 使用統一路徑管理
   - 創建專門的測試配置助手

3. **集成測試**：
   - 使用統一路徑管理
   - 測試實際的使用場景

### ❌ 錯誤做法

1. **在單元測試中使用動態路徑**：
   ```javascript
   // ❌ 錯誤：無法驗證系統正確性
   expect(ROUTES.pages.auth.login).toBe(RouteUtils.getPagePath('auth', 'login'));
   ```

2. **在 E2E 測試中硬編碼路徑**：
   ```javascript
   // ❌ 錯誤：維護困難
   await page.goto('http://localhost:5173/src/pages/auth/login.html');
   ```

---

## 🔄 遷移完成狀態

### ✅ 已完成
- **E2E 測試**：已更新使用 `TestRouteUtils`
- **測試配置**：創建了 `test-config.js`
- **策略文檔**：本文檔

### ✅ 保持現狀（正確）
- **單元測試**：繼續使用硬編碼路徑（這是正確的）

---

## 💡 總結

測試文件中的硬編碼路徑分為兩種情況：

1. **單元測試中的硬編碼路徑是必要的** ✅
   - 用於驗證路徑管理系統本身
   - 確保系統返回正確的路徑值

2. **E2E 測試現在使用統一路徑管理** ✅
   - 提高維護性和一致性
   - 使用專門的測試配置助手

這種策略確保了：
- 🎯 **測試準確性** - 單元測試能正確驗證系統
- 🔧 **維護便利性** - E2E 測試易於維護
- 🏗️ **架構一致性** - 不同層級使用適當的策略

**結論**：不是所有硬編碼路徑都需要消除，關鍵是在正確的地方使用正確的策略！ 
