# 📐 Architecture - 系統架構文檔

## 📚 目錄說明

本目錄包含 Stock Insight Platform 的核心架構規格文檔，定義系統的技術結構、依賴關係和配置標準。

## 📄 文檔清單

### 🏗️ 主要架構

| 文檔 | 用途 | 狀態 |
|------|------|------|
| [`stock-architecture.yaml`](./stock-architecture.yaml) | 完整系統架構定義 | ✅ 最新 |
| [`javascript-dependencies.yaml`](./javascript-dependencies.yaml) | JS 模組依賴關係圖 | ✅ 已更新 Socket.IO |
| [`html-dependencies.yaml`](./html-dependencies.yaml) | HTML 頁面依賴映射 | ✅ 穩定 |

### 🛣️ 配置架構

| 文檔 | 用途 | 狀態 |
|------|------|------|
| [`path-config-architecture.yaml`](./path-config-architecture.yaml) | 統一路徑管理架構 | ✅ 已實現 |
| [`future-lib-architecture.yaml`](./future-lib-architecture.yaml) | 未來組件化規劃 | 📋 規劃中 |

## 🎯 使用指南

### 🔍 查看架構信息
```bash
# 查看完整系統架構
cat architecture/stock-architecture.yaml

# 查看模組依賴關係
cat architecture/javascript-dependencies.yaml
```

### 🛠️ 開發時參考
1. **新增功能**: 參考 `stock-architecture.yaml` 了解系統邊界
2. **模組開發**: 使用 `javascript-dependencies.yaml` 確定層級
3. **頁面開發**: 查看 `html-dependencies.yaml` 了解載入順序
4. **路徑配置**: 遵循 `path-config-architecture.yaml` 規範

## 📊 重要指標

- **技術棧**: Flask + Socket.IO + Vite + TailwindCSS
- **模組層級**: 3 層架構 (基礎 → 工具 → 功能)
- **頁面數量**: 8 個主要頁面
- **實時功能**: Socket.IO 5.3.6 完整集成

## 🔄 維護說明

這些架構文檔是系統的"憲法"，任何架構變更都必須在這裡更新：

1. **技術棧變更**: 更新 `stock-architecture.yaml`
2. **模組新增**: 更新 `javascript-dependencies.yaml`  
3. **頁面新增**: 更新 `html-dependencies.yaml`
4. **路徑重構**: 更新 `path-config-architecture.yaml`

---

**📖 返回**: [文檔中心](../README.md) 
