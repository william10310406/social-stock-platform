# 📋 開發規範和最佳實踐

## 🚨 **核心原則 - 必須遵循**

### 1️⃣ **強制防呆機制 - Git Hooks** ⭐ **最重要**
```bash
# 團隊成員必須安裝 Git hooks (強制要求)
./scripts/install-git-hooks.sh

# 檢查 hooks 是否正確安裝
./scripts/check-hooks-installation.sh

# 手動運行上傳檢查腳本
./scripts/enforce-rules.sh
```
> 🔒 **防呆保護**: 
> - 無法使用 `--no-verify` 跳過檢查
> - 推送前自動運行完整檢查 (8大類)
> - 測試失敗會強制阻止推送
> - 敏感文件檢查和提交品質保證

### 2️⃣ **測試優先原則** ⭐ **最重要**
```bash
# 任何修改都必須先測試通過才能提交
npm run test        # 運行所有測試
npm run quality     # 代碼品質檢查
npm run lint        # ESLint 檢查
```
> ⚠️ **用戶堅持**: 絕對不允許未測試通過的代碼提交

### 3️⃣ **統一路徑管理**
```javascript
// ❌ 錯誤 - 硬編碼路徑
const apiUrl = 'http://localhost:5000/api/stocks';

// ✅ 正確 - 使用 RouteUtils
import { RouteUtils } from './js/utils/routes.js';
const apiUrl = RouteUtils.getApiUrl('stocks');
```

### 4️⃣ **組件庫優先**
```javascript
// ❌ 錯誤 - 重複實現
function showAlert(message) { /* 自定義實現 */ }

// ✅ 正確 - 使用組件庫
import { Toast } from './lib/index.js';
Toast.show(message, 'success');
```

### 5️⃣ **文檔放置規則** ⭐ **強制性要求**
```bash
# ✅ 正確的文檔位置 - 所有文檔必須放在 frontend/docs/
frontend/docs/reports/         # 項目報告
frontend/docs/guides/          # 開發指南  
frontend/docs/architecture/    # 系統架構
frontend/docs/implementation/  # 功能實現記錄
frontend/docs/best-practices/  # 最佳實踐

# ❌ 錯誤位置 - 絕對禁止
docs/                         # 項目根目錄的 docs 禁用
```
> 🚨 **強制性規定**: 用戶明確要求所有未來的文檔都必須寫在 `frontend/docs/` 位置

### 6️⃣ **文檔同步更新**
- 重大功能 → 更新 `frontend/docs/implementation/`
- 架構變更 → 更新 `frontend/docs/architecture/`
- 問題修復 → 記錄在 `frontend/docs/reports/`

---

## 🏗️ **架構規範**

### 📂 **目錄結構規則**
```
src/
├── proto/         # Level 0 - 協議定義、API契約、數據類型 📋 第一階段已完成
├── services/      # Level 1 - 業務服務層、緩存管理 📋 第一階段已完成
├── core/          # Level 0-1 - 核心系統功能、引擎 📋 第一階段已完成
├── lib/           # Level 0 - 基礎組件庫
├── js/
│   ├── utils/     # Level 1 - 工具函數
│   ├── api/       # Level 1 - API 封裝
│   └── modules/   # Level 2 - 業務模組
├── hooks/         # Level 1 - 可重用邏輯鉤子 🔄 第二階段規劃中
├── constants/     # Level 0 - 常量管理 🔄 第二階段規劃中
└── middleware/    # Level 1 - 中間件處理層 🔄 第二階段規劃中
```

### 📋 **新功能開發規則** ⭐ **重要**
- **文件放置指南**: 必須參考 `docs/guides/NEW_FEATURE_DEVELOPMENT_GUIDE.md`
- **決策流程**: 協議定義 → 服務層 → 組件層 → 頁面整合
- **強制性標準**: 這是團隊必須遵循的開發規範

### 🔗 **依賴層級規則**
- **Level 0** (lib): 不依賴任何內部模組
- **Level 1** (utils/api): 只能依賴 Level 0
- **Level 2** (modules): 可依賴 Level 0-1
- **禁止**: 循環依賴、跨層級依賴

### 📄 **模組導入規範**
```javascript
// ✅ 正確的導入順序
// 1. 第三方庫
import axios from 'axios';

// 2. 內部組件庫
import { Toast, Modal } from '../lib/index.js';

// 3. 工具函數
import { RouteUtils } from '../utils/routes.js';

// 4. 業務模組
import { StockAPI } from '../api/stocks.js';
```

---

## 💻 **編碼標準**

### 🎯 **JavaScript 規範**
```javascript
// ✅ 使用 ES6+ 語法
const fetchStocks = async () => {
    try {
        const response = await StockAPI.getAll();
        return response.data;
    } catch (error) {
        Toast.show('獲取股票數據失敗', 'error');
        throw error;
    }
};

// ✅ 防禦性編程
function processStockData(data) {
    if (!data || !Array.isArray(data)) {
        console.warn('Invalid stock data:', data);
        return [];
    }
    
    return data.map(stock => ({
        symbol: stock.symbol || 'N/A',
        name: stock.name || 'Unknown',
        price: parseFloat(stock.price) || 0
    }));
}
```

### 🎨 **CSS 規範**
```css
/* ✅ 使用 TailwindCSS 優先 */
<div class="bg-blue-500 text-white p-4 rounded-lg">

/* ✅ 自定義 CSS 使用 BEM 命名 */
.stock-card {
    @apply bg-white shadow-lg rounded-lg p-4;
}

.stock-card__title {
    @apply text-xl font-bold text-gray-800;
}

.stock-card__price--positive {
    @apply text-green-600;
}
```

### 📝 **HTML 規範**
```html
<!-- ✅ 語義化標籤 -->
<article class="stock-item">
    <header class="stock-item__header">
        <h3 class="stock-item__symbol">2330</h3>
        <span class="stock-item__name">台積電</span>
    </header>
    <section class="stock-item__data">
        <span class="stock-item__price">$580</span>
    </section>
</article>

<!-- ✅ 可訪問性 -->
<button 
    aria-label="加入關注清單"
    class="btn btn--primary"
    data-stock-symbol="2330">
    ⭐
</button>
```

---

## 🧪 **測試規範**

### 📋 **測試檢查清單**
```bash
# 1. 單元測試
npm run test:unit

# 2. 組件庫測試
npm run lib:test

# 3. E2E 測試
npm run test:e2e

# 4. 代碼品質
npm run lint
npm run format

# 5. Docker 測試
npm run docker:test
```

### 🎯 **測試覆蓋要求**
- **最低要求**: 90% 測試通過率
- **目標**: 97%+ 測試通過率 (當前: 97.4%)
- **關鍵功能**: 100% 測試覆蓋

### 🔍 **測試最佳實踐**
```javascript
// ✅ 描述性測試名稱
describe('StockAPI', () => {
    test('should fetch all stocks successfully', async () => {
        // 測試實現
    });
    
    test('should handle API error gracefully', async () => {
        // 錯誤處理測試
    });
});

// ✅ 模擬外部依賴
jest.mock('../api/stocks.js');
```

---

## 🐳 **Docker 開發規範**

### 🔧 **環境一致性**
```bash
# ✅ 使用統一的 Docker 環境
npm run docker:up     # 啟動開發環境
npm run docker:test   # 測試 Docker 兼容性
```

### 📦 **容器配置原則**
- 所有腳本必須 Docker 兼容
- 使用相對路徑，避免硬編碼
- 支援環境變數配置
- 提供 fallback 機制

---

## 🔄 **Git 工作流程**

### 📝 **提交規範**
```bash
# ✅ 語義化提交訊息
git commit -m "feat: 新增股票搜尋功能"
git commit -m "fix: 修復 Socket.IO 連接問題"
git commit -m "docs: 更新 API 文檔"
git commit -m "test: 增加組件庫測試"
```

### 🔀 **分支策略**
- `main`: 生產就緒代碼
- `develop`: 開發分支
- `feature/*`: 功能分支
- `fix/*`: 修復分支

### ✅ **提交前檢查**
```bash
# 必須通過的檢查
npm run quality      # 代碼品質
npm run test         # 所有測試
npm run lint         # ESLint 檢查
npm run format       # 代碼格式化
```

---

## 🚨 **常見錯誤避免**

### ❌ **絕對禁止**
1. **硬編碼路徑** - 使用 RouteUtils
2. **未測試提交** - 必須先測試通過
3. **循環依賴** - 遵循層級架構
4. **重複實現** - 使用組件庫
5. **跳過文檔** - 重大修改需更新文檔

### ⚠️ **需要注意**
1. **向後兼容** - 保持現有 API 穩定
2. **性能影響** - 避免不必要的重渲染
3. **錯誤處理** - 提供友好的錯誤訊息
4. **可訪問性** - 支援鍵盤導航和螢幕閱讀器

---

## 🎯 **AI 工具特別指引**

### 🤖 **給 AI 的建議**
1. **開始前**: 閱讀 `memory/PROJECT_STATUS.md`
2. **架構了解**: 查看 `docs/architecture/`
3. **遵循規範**: 使用既定的路徑管理和組件庫
4. **測試驗證**: 確保所有修改都能通過測試

### 💡 **最佳實踐**
- 優先使用現有組件和工具
- 保持代碼風格一致
- 提供清晰的錯誤處理
- 考慮 Docker 環境兼容性

---

**記住**: 這些規範不是限制，而是為了確保代碼品質、團隊協作和長期維護性！🚀 
