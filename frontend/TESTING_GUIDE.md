# 🧪 Stock Insight Platform 測試指南

## 📋 概述

本指南提供了 Stock Insight Platform 的完整測試策略，包含單元測試、集成測試、端到端測試和性能測試。

## 🏗️ 測試架構

### 測試金字塔
```
        🔺 E2E Tests (端到端測試)
       🔺🔺 Integration Tests (集成測試)  
    🔺🔺🔺🔺 Unit Tests (單元測試)
```

### 測試覆蓋範圍
- **單元測試**: 70% 覆蓋率目標
- **集成測試**: API 和組件集成
- **端到端測試**: 關鍵用戶流程
- **性能測試**: 載入時間和響應性

## 🛠️ 測試工具

### 主要測試框架
- **Jest**: 單元測試和集成測試
- **Playwright**: 端到端測試
- **Testing Library**: DOM 測試工具

### 測試環境
- **Node.js**: 測試運行環境
- **JSDOM**: 瀏覽器環境模擬
- **Mock APIs**: 後端服務模擬

## 📁 測試結構

```
frontend/tests/
├── unit/                 # 單元測試
│   ├── test-setup.js    # 測試環境設置
│   └── utils/           # 工具函數測試
│       ├── routes.test.js
│       ├── errorManager.test.js
│       └── websocket.test.js
├── integration/         # 集成測試
│   └── api.test.js     # API 集成測試
├── e2e/                # 端到端測試
│   └── auth.spec.js    # 認證流程測試
└── performance/        # 性能測試
```

## 🚀 快速開始

### 1. 安裝依賴
```bash
cd frontend
npm install
```

### 2. 運行所有測試
```bash
# 運行全部測試套件
npm run test:all

# 運行單元測試
npm run test:unit

# 運行集成測試
npm run test:integration

# 運行端到端測試
npm run test:e2e
```

### 3. 測試覆蓋率
```bash
# 生成測試覆蓋率報告
npm run test:coverage

# 查看覆蓋率報告
open coverage/lcov-report/index.html
```

## 📊 測試類型詳解

### 單元測試 (Unit Tests)

**目標**: 測試獨立的函數和類別

**範例**:
```javascript
// tests/unit/utils/errorManager.test.js
describe('ErrorManager', () => {
  test('應該正確處理 API 錯誤', () => {
    const error = { status: 404 };
    const result = errorManager.handleApiError(error);
    expect(result.innerHTML).toContain('請求的資源不存在');
  });
});
```

**運行命令**:
```bash
npm run test:unit
npm run test:unit -- --watch  # 監視模式
```

### 集成測試 (Integration Tests)

**目標**: 測試組件之間的交互

**範例**:
```javascript
// tests/integration/api.test.js
describe('Authentication Flow', () => {
  test('應該成功登入並儲存 token', async () => {
    const result = await api.login(credentials);
    expect(result.access_token).toBeTruthy();
  });
});
```

**運行命令**:
```bash
npm run test:integration
```

### 端到端測試 (E2E Tests)

**目標**: 測試完整的用戶流程

**範例**:
```javascript
// tests/e2e/auth.spec.js
test('用戶登入流程', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="password"]', 'password123');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
```

**運行命令**:
```bash
npm run test:e2e
npm run test:e2e -- --headed  # 顯示瀏覽器
```

## 🎯 測試最佳實踐

### 1. 測試命名規範
```javascript
// ✅ 好的測試名稱
test('應該在用戶名無效時顯示錯誤訊息', () => {});

// ❌ 不好的測試名稱  
test('test login', () => {});
```

### 2. AAA 模式 (Arrange-Act-Assert)
```javascript
test('應該計算正確的總價', () => {
  // Arrange (準備)
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act (執行)
  const total = calculateTotal(items);
  
  // Assert (驗證)
  expect(total).toBe(30);
});
```

### 3. Mock 使用原則
```javascript
// ✅ Mock 外部依賴
jest.mock('../api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
}));

// ❌ 不要 Mock 被測試的函數
```

### 4. 測試隔離
```javascript
describe('UserService', () => {
  beforeEach(() => {
    // 每個測試前重置狀態
    localStorage.clear();
    jest.clearAllMocks();
  });
});
```

## 📈 測試覆蓋率目標

### 覆蓋率要求
- **語句覆蓋率**: ≥ 70%
- **分支覆蓋率**: ≥ 70%
- **函數覆蓋率**: ≥ 70%
- **行覆蓋率**: ≥ 70%

### 覆蓋率報告
```bash
# 生成詳細覆蓋率報告
npm run test:coverage

# 覆蓋率報告位置
coverage/
├── lcov-report/index.html  # HTML 報告
├── lcov.info              # LCOV 格式
└── coverage-summary.json  # JSON 摘要
```

## 🔧 CI/CD 集成

### GitHub Actions 配置
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

### 測試命令
```bash
# CI 環境測試
npm run test:ci

# 包含：
# - 單元測試 + 覆蓋率
# - 集成測試
# - 路徑檢查
# - 鏈接驗證
```

## 🐛 調試測試

### Jest 調試
```bash
# 調試特定測試
npm test -- --testNamePattern="應該處理登入錯誤"

# 詳細輸出
npm test -- --verbose

# 監視模式
npm test -- --watch
```

### Playwright 調試
```bash
# 顯示瀏覽器
npm run test:e2e -- --headed

# 調試模式
npm run test:e2e -- --debug

# 特定測試
npm run test:e2e -- --grep "登入流程"
```

## 📝 測試數據管理

### 測試數據策略
```javascript
// 使用工廠函數創建測試數據
const createTestUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  ...overrides
});

// 使用 fixtures
const testData = {
  validCredentials: {
    username: 'testuser',
    password: 'password123'
  },
  invalidCredentials: {
    username: 'invalid',
    password: 'wrong'
  }
};
```

### 環境變數
```javascript
// 測試環境配置
process.env.NODE_ENV = 'test';
process.env.API_BASE_URL = 'http://localhost:5001';
```

## 🔍 測試報告

### HTML 報告
- **單元測試**: `coverage/lcov-report/index.html`
- **端到端測試**: `playwright-report/index.html`

### 命令行報告
```bash
# 簡潔報告
npm test

# 詳細報告
npm test -- --verbose

# 覆蓋率摘要
npm run test:coverage -- --coverageReporters=text-summary
```

## 🚨 常見問題

### 1. 測試超時
```javascript
// 增加超時時間
jest.setTimeout(10000);

// 或在測試中
test('長時間運行的測試', async () => {
  // 測試內容
}, 10000);
```

### 2. 異步測試
```javascript
// ✅ 正確的異步測試
test('應該獲取用戶數據', async () => {
  const user = await fetchUser(1);
  expect(user.id).toBe(1);
});

// ❌ 錯誤的異步測試
test('應該獲取用戶數據', () => {
  fetchUser(1).then(user => {
    expect(user.id).toBe(1); // 可能不會執行
  });
});
```

### 3. DOM 測試
```javascript
// 使用 JSDOM 進行 DOM 測試
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
```

## 📚 學習資源

### 官方文檔
- [Jest 官方文檔](https://jestjs.io/docs/getting-started)
- [Playwright 官方文檔](https://playwright.dev/docs/intro)
- [Testing Library 指南](https://testing-library.com/docs/)

### 最佳實踐
- [JavaScript 測試最佳實踐](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [前端測試策略](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

## 🎉 總結

完整的測試策略包含：

1. **🧪 單元測試** - 快速反饋，高覆蓋率
2. **🔗 集成測試** - 確保組件協作
3. **🎭 端到端測試** - 驗證用戶體驗
4. **⚡ 性能測試** - 保證應用響應性
5. **🔍 持續監控** - CI/CD 自動化

遵循這個測試指南，可以確保 Stock Insight Platform 的代碼品質和穩定性！ 
