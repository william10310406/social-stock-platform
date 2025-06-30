# INFO 層級文件索引

## 📚 文件總覽

本目錄包含 INFO 層級安全架構的完整說明文件和配置檔案。

## 📋 檔案列表

### 配置檔案 (configs/)
- **[security-levels.yaml](../configs/security-levels.yaml)** - 主要安全層級配置
- **[info-dependencies.yaml](../configs/info-dependencies.yaml)** - INFO 層級詳細依賴配置

### 說明文件 (docs/)
- **[info-levels-guide.md](info-levels-guide.md)** - INFO 層級完整架構說明
- **[info-dependencies-diagram.md](info-dependencies-diagram.md)** - 依賴關係圖表和快速參考

### 測試檔案
- **[test_info_levels.py](../../test/test_info_levels.py)** - INFO 層級功能測試

### 實作檔案
```
security/levels/info/
├── info_0/
│   ├── security_constants.py
│   ├── security_utils.py
│   └── security_exceptions.py
├── info_1/
│   └── security_logger.py
└── info_2/
    ├── config_manager.py
    └── security_monitoring.py
```

## 🚀 快速開始

### 1. 查看架構概述
```bash
# 閱讀主要架構說明
cat security/docs/info-levels-guide.md
```

### 2. 了解依賴關係
```bash
# 查看依賴關係圖
cat security/docs/info-dependencies-diagram.md
```

### 3. 檢視配置檔案
```bash
# 主要層級配置
cat security/configs/security-levels.yaml

# 詳細依賴配置
cat security/configs/info-dependencies.yaml
```

### 4. 執行測試
```bash
# 完整測試
docker-compose -f docker-compose.dual.yml exec backend python test/test_info_levels.py
```

## 📖 閱讀順序建議

### 初次了解
1. **[info-dependencies-diagram.md](info-dependencies-diagram.md)** - 快速了解架構
2. **[info-levels-guide.md](info-levels-guide.md)** - 深入了解實作細節

### 配置管理
3. **[security-levels.yaml](../configs/security-levels.yaml)** - 主要配置
4. **[info-dependencies.yaml](../configs/info-dependencies.yaml)** - 依賴配置

### 開發測試
5. **[test_info_levels.py](../../test/test_info_levels.py)** - 測試範例

## 🔍 關鍵概念

### 分層架構
- **INFO-0**: 基礎元件 (constants, utils, exceptions)
- **INFO-1**: 基礎服務 (logger)
- **INFO-2**: 系統監控 (config_manager, monitoring)

### 依賴規則
- ✅ 高層級可依賴低層級
- ❌ 低層級不可依賴高層級
- ❌ 禁止循環依賴

### 外部依賴
- **PyYAML** ≥6.0 (配置解析)
- **psutil** ≥5.8.0 (系統監控)

## 📊 測試狀態

最新測試結果 (2025-06-29):
```
✅ INFO-0 常數 ................... 通過
✅ INFO-0 工具 ................... 通過  
✅ INFO-0 例外 ................... 通過
✅ INFO-1 日誌 ................... 通過
✅ INFO-2 配置 ................... 通過
✅ INFO-2 監控 ................... 通過
✅ 依賴關係 ...................... 通過
✅ YAML 配置 .................... 通過
✅ 整合測試 ...................... 通過

總計: 9 項測試 | 成功率: 100.0%
```

## 🛠️ 維護指南

### 新增模組時
1. 確認層級歸屬
2. 檢查依賴關係
3. 更新配置檔案
4. 撰寫測試
5. 更新文件

### 修改依賴時
1. 檢查循環依賴
2. 驗證層級規則
3. 執行完整測試
4. 更新依賴圖

### 問題排除
- 檢查模組導入路徑
- 驗證外部依賴安裝
- 確認 Docker 環境配置
- 查看測試輸出日誌

## 📞 技術支援

如有問題，請：
1. 查看相關文件
2. 執行測試診斷
3. 檢查日誌輸出
4. 參考故障排除章節

---

*最後更新: 2025-06-29*  
*架構版本: v1.3.0*
