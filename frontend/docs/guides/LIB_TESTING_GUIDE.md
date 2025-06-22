# 📚 組件庫測試指南

## 概述

本指南提供了多種方式來確認 Stock Insight Platform 的 `/lib` 組件庫功能是否正常工作。

## 🎯 測試方法一覽

| 方法 | 適用場景 | 執行時間 | 詳細程度 |
|------|----------|----------|----------|
| **命令行檢查** | 開發環境快速檢查 | 5秒 | 文件結構 |
| **瀏覽器測試頁面** | 功能完整測試 | 2-5分鐘 | 視覺化測試 |
| **控制台測試** | 任何頁面快速測試 | 30秒 | 功能性測試 |
| **手動驗證** | 生產環境檢查 | 1分鐘 | 基礎驗證 |

---

## 🔧 方法一：命令行檢查

### 快速檢查文件結構和完整性

```bash
# 進入 frontend 目錄
cd frontend

# 執行組件庫檢查
npm run lib:check

# 或者直接運行腳本
node scripts/check-lib.js
```

### 檢查內容
- ✅ 目錄結構完整性
- ✅ 必需文件存在性
- ✅ 關鍵代碼片段檢查
- ✅ 包整合狀態

### 預期輸出
```
╔══════════════════════════════════════╗
║     Component Library Checker        ║
║   Stock Insight Platform v1.0.0     ║
╚══════════════════════════════════════╝

📚 檢查目錄結構
✅ 目錄存在: src/lib
✅ 目錄存在: src/lib/components
✅ 目錄存在: src/lib/data

📚 檢查文件完整性
檢查文件: src/lib/index.js
✅ 文件存在: 組件庫統一入口
✅ 內容檢查通過: 所有必需關鍵字存在

... (更多檢查項目)

📊 檢查結果統計:
✅ 完全通過: 5/5
⚠️  部分通過: 0/5
❌ 未通過: 0/5
📈 通過率: 100%

🎉 所有組件文件檢查通過！可以開始使用組件庫。
```

---

## 🌐 方法二：瀏覽器測試頁面

### 完整的視覺化功能測試

1. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

2. **打開測試頁面**
   ```
   http://localhost:5173/src/pages/test/lib-test.html
   ```

3. **執行測試**
   - 頁面載入後會自動檢查組件庫狀態
   - 點擊各個測試按鈕驗證功能
   - 查看測試結果和視覺效果

### 測試項目

#### 🍞 Toast 組件測試
- Success Toast - 成功提示
- Error Toast - 錯誤提示  
- Warning Toast - 警告提示
- Info Toast - 資訊提示
- Custom Toast - 自定義提示
- Clear All - 清除所有提示

#### 🪟 Modal 組件測試
- Small Modal - 小尺寸模態框
- Default Modal - 預設尺寸模態框
- Large Modal - 大尺寸模態框
- XL Modal - 超大尺寸模態框
- Confirm Dialog - 確認對話框
- Alert Dialog - 提示對話框

#### ⏳ Loading 組件測試
- Fullscreen Loading - 全屏載入
- Container Loading - 容器載入
- Skeleton Loading - 骨架屏載入
- Error State - 錯誤狀態

#### 🔧 Formatter 工具測試
- Currency Format - 貨幣格式化
- Number Format - 數字格式化
- Date Format - 日期格式化
- Stock Format - 股票格式化

### 預期結果
- ✅ 組件庫載入成功
- ✅ 所有測試按鈕正常工作
- ✅ 視覺效果符合預期
- ✅ 無控制台錯誤

---

## 💻 方法三：控制台測試

### 在任何頁面快速測試組件功能

1. **打開任何包含組件庫的頁面**
   - Dashboard: `http://localhost:5173/`
   - Stocks: `http://localhost:5173/src/pages/stocks.html`
   - 任何載入了 `/src/lib/index.js` 的頁面

2. **打開開發者工具**
   - 按 `F12` 或右鍵選擇「檢查」
   - 切換到「Console」標籤

3. **複製並執行測試腳本**
   ```javascript
   // 複製 frontend/scripts/browser-lib-test.js 的完整內容
   // 貼上到控制台並按 Enter
   ```

4. **查看測試結果**
   - 自動執行所有測試
   - 彩色輸出測試結果
   - 提供使用範例

### 快速手動測試
如果不想運行完整腳本，可以手動測試：

```javascript
// 檢查組件是否載入
console.log('Toast:', typeof window.toast);
console.log('Modal:', typeof window.Modal);
console.log('Loading:', typeof window.loading);
console.log('Formatter:', typeof window.formatter);

// 快速功能測試
toast.success('測試成功！');
formatter.currency(1234.56);
new Modal().open({ title: '測試', body: '內容' });
```

---

## ✋ 方法四：手動驗證

### 基礎功能驗證（適用於生產環境）

1. **檢查全局變數**
   ```javascript
   // 在控制台執行
   window.lib && window.toast && window.Modal && window.loading && window.formatter
   ```

2. **測試一個簡單功能**
   ```javascript
   // 顯示一個提示
   toast.success('組件庫正常工作！');
   ```

3. **檢查錯誤**
   - 打開控制台查看是否有錯誤訊息
   - 確認沒有 404 或載入失敗的錯誤

---

## 🚨 故障排除

### 常見問題與解決方案

#### 問題 1: 組件庫載入失敗
**症狀**: 控制台顯示 "❌ 組件庫載入失敗！"

**解決方案**:
1. 檢查文件路徑是否正確
2. 確認 `/src/lib/index.js` 存在
3. 檢查網路請求是否成功 (Network 標籤)
4. 運行 `npm run lib:check` 檢查文件完整性

#### 問題 2: 部分功能不工作
**症狀**: 某些方法調用失敗或返回錯誤

**解決方案**:
1. 檢查控制台錯誤訊息
2. 確認組件文件內容完整
3. 重新載入頁面
4. 檢查是否有 JavaScript 語法錯誤

#### 問題 3: 樣式不正確
**症狀**: 組件顯示但樣式異常

**解決方案**:
1. 確認 TailwindCSS 已載入
2. 檢查 CSS 是否有衝突
3. 確認組件的 HTML 結構正確

#### 問題 4: 測試頁面無法打開
**症狀**: 404 錯誤或頁面空白

**解決方案**:
1. 確認開發伺服器正在運行 (`npm run dev`)
2. 檢查文件路徑: `src/pages/test/lib-test.html`
3. 確認 Vite 配置正確

---

## 📊 測試結果解讀

### 成功指標
- ✅ **100% 通過率**: 所有組件正常工作
- ✅ **無控制台錯誤**: 沒有 JavaScript 錯誤
- ✅ **視覺效果正常**: 組件顯示和動畫正確
- ✅ **功能響應**: 點擊和交互正常

### 警告指標
- ⚠️ **部分功能失效**: 某些方法不可用
- ⚠️ **樣式異常**: 顯示但格式不正確
- ⚠️ **載入延遲**: 組件載入緩慢

### 失敗指標
- ❌ **完全載入失敗**: 組件庫未載入
- ❌ **多個錯誤**: 控制台有多個錯誤
- ❌ **功能完全不工作**: 無法調用任何方法

---

## 🎯 最佳實踐

### 開發階段
1. **每次修改後測試**: 使用 `npm run lib:check` 快速檢查
2. **功能開發完成**: 使用瀏覽器測試頁面完整測試
3. **提交前驗證**: 運行控制台測試確保無錯誤

### 部署階段
1. **部署前**: 運行所有測試方法
2. **部署後**: 在生產環境進行手動驗證
3. **定期檢查**: 定期執行基礎功能驗證

### 團隊協作
1. **新成員**: 先運行測試頁面了解功能
2. **代碼審查**: 檢查測試是否通過
3. **問題報告**: 提供詳細的測試結果

---

## 📚 相關文檔

- [組件庫實現文檔](../implementation/LIB_IMPLEMENTATION_COMPLETE.md)
- [JavaScript 依賴架構](../architecture/javascript-dependencies.yaml)
- [開發安全指南](./DEVELOPMENT_SAFETY.md)

---

## 🔄 更新記錄

- **v1.0.0** (2025-01-21): 初始版本，包含四種測試方法
- 提供完整的測試工具鏈和故障排除指南 
