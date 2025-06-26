# 🚀 組件庫快速開始指南

## 📋 快速檢查清單

想要快速確認你的 `/lib` 組件庫是否正常工作？按照以下步驟進行：

### ✅ 步驟 1: 命令行快速檢查 (30秒)

```bash
# 進入 frontend 目錄
cd frontend

# 運行快速檢查
npm run lib:check
```

**預期結果**: 看到 `🎉 所有組件文件檢查通過！` 訊息

---

### ✅ 步驟 2: 瀏覽器功能測試 (2分鐘)

```bash
# 啟動開發伺服器
npm run dev
```

然後打開瀏覽器訪問：
```
http://localhost:5173/src/pages/test/lib-test.html
```

**預期結果**: 
- 頁面顯示 `✅ 組件庫載入成功！`
- 點擊測試按鈕有相應的視覺效果
- 執行所有測試顯示 100% 通過率

---

### ✅ 步驟 3: 控制台快速驗證 (30秒)

在任何頁面打開開發者工具 (F12)，在控制台執行：

```javascript
// 快速檢查
window.lib && window.toast && window.Modal && window.loading && window.formatter

// 快速測試
toast.success('組件庫正常工作！');
```

**預期結果**: 
- 第一行返回 `true`
- 第二行顯示成功提示

---

## 🎯 使用範例

### Toast 提示組件
```javascript
// 成功提示
toast.success('操作成功！');

// 錯誤提示
toast.error('發生錯誤');

// 自定義提示
toast.show('自定義訊息', 'info', {
  title: '自定義標題',
  duration: 5000
});
```

### Modal 模態框組件
```javascript
// 創建模態框
const modal = new Modal({ size: 'large' });
modal.open({
  title: '標題',
  body: '<p>內容</p>'
});

// 確認對話框
Modal.confirm({
  title: '確認',
  message: '您確定要執行此操作嗎？',
  onConfirm: () => console.log('確認'),
  onCancel: () => console.log('取消')
});
```

### Loading 載入組件
```javascript
// 全屏載入
loading.showFullscreen('載入中...', 'unique-id');
setTimeout(() => loading.hideFullscreen('unique-id'), 3000);

// 容器載入
loading.showInContainer('#my-container', 'spinner', '載入中...');
```

### Formatter 格式化工具
```javascript
// 貨幣格式化
formatter.currency(1234.56); // "NT$1,234.56"

// 股票變化格式化
formatter.stockChange(0.15); // { value: "+0.15", color: "text-red-600" }

// 成交量格式化
formatter.volume(12340000); // "1,234萬"
```

---

## 🚨 常見問題快速解決

### Q: 控制台顯示 "組件庫載入失敗"
**A**: 運行 `npm run lib:check` 檢查文件完整性

### Q: Toast 不顯示
**A**: 確認頁面已載入 TailwindCSS

### Q: Modal 樣式異常
**A**: 檢查是否有 CSS 衝突

### Q: 測試頁面 404
**A**: 確認開發伺服器正在運行 (`npm run dev`)

---

## 📚 更多資源

- **完整測試指南**: [LIB_TESTING_GUIDE.md](./LIB_TESTING_GUIDE.md)
- **實現文檔**: [LIB_IMPLEMENTATION_COMPLETE.md](../implementation/LIB_IMPLEMENTATION_COMPLETE.md)
- **架構文檔**: [javascript-dependencies.yaml](../architecture/javascript-dependencies.yaml)

---

## 🎉 成功！

如果以上步驟都通過，恭喜！你的組件庫已經準備就緒，可以開始在項目中使用了。

**下一步建議**:
1. 在現有頁面中嘗試使用組件
2. 查看完整的實現文檔了解更多功能
3. 根據需要擴展組件庫 
