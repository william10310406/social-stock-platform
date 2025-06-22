# 📁 Public 目錄說明

## 🎯 **用途**
此目錄包含 Stock Insight Platform 的靜態資源和 PWA 配置文件。

## 📄 **文件結構**
```
public/
├── icons/              # 應用圖標
│   ├── icon.svg       # 主圖標 (股票圖表設計)
│   └── generate.html  # 圖標生成工具
├── .well-known/       # Web 標準文件
│   └── security.txt   # 安全政策
├── manifest.json      # PWA 配置
├── sw.js             # Service Worker
├── robots.txt        # 搜索引擎指導
└── favicon.ico       # 瀏覽器圖標

```

## 🌐 **PWA 功能**
- **可安裝性**: 用戶可將網頁安裝到桌面/手機
- **離線支援**: Service Worker 提供緩存和離線功能
- **推送通知**: 支援系統級通知
- **全屏體驗**: 類似原生應用的體驗

## 🔧 **技術說明**
- 所有文件可通過 `/` 根路徑直接訪問
- Vite 構建工具自動處理此目錄
- 符合現代 Web 標準和最佳實踐

## 📱 **移動端支援**
- 響應式設計
- 觸控優化
- 離線可用
- 快捷方式支援

---
**維護者**: Stock Insight Platform 開發團隊  
**更新時間**: 2025-01-22 