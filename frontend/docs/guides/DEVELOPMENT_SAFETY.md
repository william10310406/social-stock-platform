# 開發安全指南

## 🛡️ 核心原則

### 1. 統一路徑管理
- ✅ 必須使用 `RouteUtils` 進行路徑操作
- ❌ 禁止硬編碼路徑
- 🔍 每次提交前運行 `npm run test:routes`

### 2. 依賴管理
- ✅ 避免循環依賴
- ✅ 使用 `npm run test:deps` 檢查
- ✅ routes.js 保持純配置

### 3. 測試要求
- ✅ 新功能必須有測試
- ✅ 測試覆蓋率 100%
- ✅ 所有檢查必須通過

## 🚨 常見問題預防

### 路徑問題
```javascript
// ❌ 錯誤
window.location.href = '/src/pages/auth/login.html';

// ✅ 正確
RouteUtils.redirectToLogin();
```

### 依賴問題
```javascript
// ❌ 錯誤 - 循環依賴
// a.js 導入 b.js，b.js 又導入 a.js

// ✅ 正確 - 單向依賴
// 使用統一配置文件作為依賴中心
```

## 🔧 開發工作流

1. **開發新功能**
   ```bash
   # 1. 添加路徑配置
   # 2. 實施功能
   # 3. 添加測試
   npm run test:deps
   npm run test:routes
   npm test
   ```

2. **提交代碼**
   ```bash
   npm run test:ci  # 完整檢查
   git add .
   git commit -m "feat: 新功能描述"
   ```

## 📋 檢查清單

- [ ] 使用統一路徑管理
- [ ] 無循環依賴
- [ ] 測試 100% 通過
- [ ] 文檔已更新
- [ ] 所有檢查工具通過 
