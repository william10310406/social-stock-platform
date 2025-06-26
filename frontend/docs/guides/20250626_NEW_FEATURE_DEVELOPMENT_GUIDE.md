# 🚀 新功能開發指南

## 📋 概述

本指南規定了 Stock Insight Platform 新功能開發的標準化流程和文件放置規則，基於我們的企業級目錄結構。

## 📁 目錄結構規則

### 🎯 **第一階段已完成目錄（可立即使用）**

#### 1. **協議和接口定義** → `src/proto/`
**用途**：API 協議、數據類型、事件規範、配置契約
```bash
# API 協議定義
src/proto/user-contracts.js        # 用戶相關 API
src/proto/payment-contracts.js     # 支付相關 API
src/proto/trading-contracts.js     # 交易相關 API

# 數據類型定義
src/proto/user-types.js           # 用戶數據類型
src/proto/message-types.js        # 消息數據類型
src/proto/trading-types.js        # 交易數據類型

# 事件協議
src/proto/user-events.js          # 用戶事件協議
src/proto/system-events.js        # 系統事件協議

# 配置契約
src/proto/theme-config.js         # 主題配置
src/proto/feature-flags.js        # 功能開關
```

#### 2. **業務服務層** → `src/services/`
**用途**：業務邏輯封裝、API 調用、數據處理
```bash
# 業務服務
src/services/user-service.js       # 用戶業務邏輯
src/services/notification-service.js # 通知服務
src/services/payment-service.js    # 支付服務
src/services/trading-service.js    # 交易服務
src/services/analytics-service.js  # 分析服務

# 必須包含的標準功能
- 緩存管理
- 錯誤處理
- Toast/Loading 集成
- 事件發送
```

#### 3. **核心系統功能** → `src/core/`
**用途**：系統級功能、引擎、管理器
```bash
# 系統引擎
src/core/auth-engine.js           # 認證引擎
src/core/cache-manager.js         # 緩存管理器
src/core/event-bus.js             # 事件總線
src/core/security-manager.js      # 安全管理器

# 生命週期管理
src/core/module-loader.js         # 模組加載器
src/core/health-monitor.js        # 健康監控
```

### 🎯 **現有目錄（繼續使用）**

#### 4. **UI 組件庫** → `src/lib/`
**用途**：通用可重用組件
```bash
src/lib/DatePicker.js             # 日期選擇器
src/lib/DataTable.js              # 數據表格
src/lib/Chart.js                  # 圖表組件
src/lib/Carousel.js               # 輪播組件
```

#### 5. **業務組件** → `src/components/`
**用途**：特定業務邏輯組件
```bash
src/components/StockCard.js       # 股票卡片
src/components/UserProfile.js     # 用戶資料卡
src/components/TradingPanel.js    # 交易面板
```

#### 6. **頁面邏輯** → `src/pages/`
**用途**：頁面級別的功能和邏輯
```bash
src/pages/profile/                # 用戶資料頁面
├── profile.js                   # 主邏輯
├── profile.html                 # 模板
└── profile.css                  # 樣式

src/pages/settings/               # 設置頁面
src/pages/analytics/              # 分析頁面
```

#### 7. **工具函數** → `src/js/utils/`
**用途**：純函數、工具方法
```bash
src/js/utils/formatters.js       # 格式化工具
src/js/utils/validators.js       # 驗證工具
src/js/utils/calculators.js      # 計算工具
```

### 🚀 **第二階段即將推出（建議等待）**

#### 8. **可重用邏輯鉤子** → `src/hooks/`
**計劃時間**：第二階段開發
```bash
src/hooks/useLocalStorage.js      # 本地存儲鉤子
src/hooks/useWebSocket.js         # WebSocket 鉤子
src/hooks/useApi.js               # API 調用鉤子
```

#### 9. **常量管理** → `src/constants/`
**計劃時間**：第二階段開發
```bash
src/constants/api-endpoints.js    # API 端點常量
src/constants/ui-config.js        # UI 配置常量
src/constants/business-rules.js   # 業務規則常量
```

#### 10. **中間件** → `src/middleware/`
**計劃時間**：第二階段開發
```bash
src/middleware/auth.js            # 認證中間件
src/middleware/logging.js         # 日誌中間件
src/middleware/rate-limit.js      # 限流中間件
```

## 🔄 新功能開發決策流程

### 📊 決策樹
```
新功能開發
    ↓
┌─ 📋 定義 API/數據結構？
│   └─ YES → src/proto/
├─ ⚙️ 處理業務邏輯？
│   └─ YES → src/services/
├─ 🔧 系統核心功能？
│   └─ YES → src/core/
├─ 🎨 通用 UI 組件？
│   └─ YES → src/lib/
├─ 🏢 業務特定組件？
│   └─ YES → src/components/
├─ 📄 頁面級功能？
│   └─ YES → src/pages/
└─ 🛠️ 工具函數？
    └─ YES → src/js/utils/
```

### 🎯 開發順序（推薦）
1. **協議定義** (`src/proto/`) - 定義數據結構和 API
2. **服務層** (`src/services/`) - 實現業務邏輯
3. **組件層** (`src/lib/` 或 `src/components/`) - 建立 UI 組件
4. **頁面整合** (`src/pages/`) - 組合成完整功能

## 📝 具體範例

### 範例1: 新增「用戶通知系統」

#### 步驟1: 協議定義
```javascript
// src/proto/notification-types.js
export const NotificationTypes = {
  STOCK_ALERT: 'stock_alert',
  TRADE_COMPLETE: 'trade_complete',
  SYSTEM_UPDATE: 'system_update'
};

// src/proto/notification-contracts.js
export const NotificationApiContract = {
  endpoints: {
    getNotifications: '/api/notifications',
    markAsRead: '/api/notifications/{id}/read'
  }
};
```

#### 步驟2: 服務層
```javascript
// src/services/notification-service.js
import { NotificationTypes } from '../proto/notification-types.js';
import { Toast } from '../lib/index.js';

export class NotificationService {
  // 實現通知業務邏輯
}
```

#### 步驟3: UI 組件
```javascript
// src/lib/NotificationBell.js - 通用組件
// src/components/NotificationPanel.js - 業務組件
```

#### 步驟4: 頁面整合
```javascript
// src/pages/notifications/ - 通知頁面
```

### 範例2: 新增「股票分析工具」

1. **數據類型** → `src/proto/analysis-types.js`
2. **分析服務** → `src/services/analysis-service.js`
3. **圖表組件** → `src/lib/AnalysisChart.js`
4. **分析頁面** → `src/pages/analysis/`

## 🔧 技術要求

### ✅ 必須遵守的規範

#### 1. **import/export 標準**
```javascript
// ✅ 正確 - 使用相對路徑和 .js 擴展名
import { stockService } from '../services/index.js';
import { Toast } from '../lib/index.js';

// ❌ 錯誤 - 絕對路徑或無擴展名
import { stockService } from '/services';
```

#### 2. **統一導出 (index.js)**
每個目錄必須有 `index.js` 統一導出：
```javascript
// src/services/index.js
export { stockService } from './stock-service.js';
export { userService } from './user-service.js';
```

#### 3. **錯誤處理標準**
```javascript
// 必須集成 Toast 和 Loading
import { Toast, Loading } from '../lib/index.js';

try {
  Loading.show('載入中...');
  const result = await api.call();
  Toast.show('操作成功', 'success');
} catch (error) {
  Toast.show('操作失敗', 'error');
} finally {
  Loading.hide();
}
```

#### 4. **事件驅動架構**
```javascript
// 發送自定義事件
document.dispatchEvent(new CustomEvent('feature:update', {
  detail: { data: result }
}));
```

### 🧪 品質標準

#### 1. **必須通過檢查**
- ✅ ESLint 0 錯誤
- ✅ 測試覆蓋率 ≥ 95%
- ✅ Docker 兼容性 100%
- ✅ 統一路徑管理系統

#### 2. **禁止事項**
- ❌ 硬編碼 API 端點
- ❌ 直接操作 DOM（使用組件）
- ❌ 未處理的 Promise 拒絕
- ❌ 內聯樣式

## ⏰ 開發時機建議

### 🟢 **立即可用**
- `src/proto/` - 協議定義
- `src/services/` - 業務服務
- `src/core/` - 核心系統
- `src/lib/` - UI 組件庫
- `src/components/` - 業務組件
- `src/pages/` - 頁面功能

### 🟡 **建議等待第二階段**
- `src/hooks/` - 更標準化的可重用邏輯
- `src/constants/` - 統一常量管理
- `src/middleware/` - 中間件處理層

等待第二階段的優勢：
- 🏗️ 更完整的架構標準
- 🔧 更強大的工具支持
- 📋 更詳細的開發規範

## 🤝 團隊協作

### 📝 開發前檢查清單
- [ ] 確認功能屬於哪個層級
- [ ] 檢查是否有現有類似功能
- [ ] 規劃 API 協議和數據結構
- [ ] 評估是否需要新增 proto 定義

### 🔄 Code Review 重點
- [ ] 文件放置位置正確
- [ ] 遵循 import/export 規範
- [ ] 錯誤處理完整
- [ ] 測試覆蓋充分

## 📚 相關文檔

- [企業級架構擴展規劃](../reports/LIB_EXPANSION_RECOMMENDATION.md)
- [第一階段實施報告](../implementation/PHASE1_DIRECTORY_EXPANSION_REPORT.md)
- [統一路徑管理](../implementation/PATH_MANAGEMENT_SUMMARY.md)
- [代碼品質標準](../implementation/ARCHITECTURE_IMPROVEMENTS.md)

---

**📅 文檔版本**：v1.0  
**🔄 最後更新**：2025-06-22  
**📋 維護責任**：Stock Insight Platform 開發團隊

**⚠️ 重要提醒**：此指南是強制性的開發標準，所有新功能必須遵循！ 