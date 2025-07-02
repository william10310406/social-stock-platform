# 安全架構文件索引

## 📚 文件總覽

本目錄包含完整安全架構的說明文件和配置檔案，涵蓋 **INFO 層級**（基礎架構）和 **LOW 層級**（一般安全風險防護）。

## 📋 檔案列表

### 配置檔案 (configs/)
- **[security-levels.yaml](../configs/security-levels.yaml)** - 主要安全層級配置
- **[secure-dependencies.yaml](../configs/secure-dependencies.yaml)** - 完整依賴關係配置 (INFO + LOW)
- **[info-dependencies.yaml](../configs/info-dependencies.yaml)** - INFO 層級詳細依賴配置 (舊版，已被 secure-dependencies.yaml 取代)

### 說明文件 (docs/)
- **[info-levels-guide.md](info-levels-guide.md)** - INFO 層級完整架構說明
- **[info-dependencies-diagram.md](info-dependencies-diagram.md)** - 依賴關係圖表和快速參考

### 測試檔案
- **[test_info_levels.py](../../test/test_info_levels.py)** - INFO 層級功能測試
- **[test_low_levels.py](../../test/test_low_levels.py)** - LOW 層級功能測試
- **[test_results_summary.md](../../test/test_results_summary.md)** - 測試結果總結

### 驗證腳本
- **[validate_dependencies.py](../../scripts/validate_dependencies.py)** - 依賴關係驗證腳本

### 實作檔案
```
security/levels/
├── info/                    # INFO 層級 - 基礎架構
│   ├── info_0/             # 基礎常數與設定
│   │   └── security_constants.py
│   ├── info_1/             # 基礎工具與例外處理  
│   │   ├── security_utils.py
│   │   └── security_exceptions.py
│   ├── info_2/             # 日誌系統
│   │   └── security_logger.py
│   └── info_3/             # 配置管理與監控
│       ├── config_manager.py
│       └── security_monitoring.py
└── low/                     # LOW 層級 - 一般安全風險防護
    ├── info_disclosure_prevention.py  # 資訊洩露防護
    ├── password_policy.py             # 密碼政策驗證
    ├── security_headers.py            # HTTP 安全標頭
    ├── path_traversal_guard.py        # 路徑遍歷防護
    └── endpoint_security.py           # 端點安全防護
```

## 🚀 快速開始

### 1. 查看架構概述
```bash
# 閱讀主要架構說明
cat security/docs/info-levels-guide.md

# 查看依賴關係圖
cat security/docs/info-dependencies-diagram.md
```

### 2. 檢視配置檔案
```bash
# 主要層級配置
cat security/configs/security-levels.yaml

# 完整依賴配置 (INFO + LOW)
cat security/configs/secure-dependencies.yaml
```

### 3. 執行測試
```bash
# INFO 層級測試
docker-compose -f docker-compose.dual.yml exec backend python test/test_info_levels.py

# LOW 層級測試
docker-compose -f docker-compose.dual.yml exec backend python test/test_low_levels.py

# 使用 pytest 執行所有測試
docker-compose -f docker-compose.dual.yml exec backend python -m pytest security/test/ -v
```

### 4. 驗證依賴關係
```bash
# 執行依賴驗證腳本
docker-compose -f docker-compose.dual.yml exec backend python security/scripts/validate_dependencies.py
```

## 📖 閱讀順序建議

### 初次了解
1. **[info-dependencies-diagram.md](info-dependencies-diagram.md)** - 快速了解架構
2. **[info-levels-guide.md](info-levels-guide.md)** - 深入了解實作細節

### 配置管理
3. **[security-levels.yaml](../configs/security-levels.yaml)** - 主要配置
4. **[secure-dependencies.yaml](../configs/secure-dependencies.yaml)** - 完整依賴配置 (INFO + LOW)

### 開發測試
5. **[test_info_levels.py](../../test/test_info_levels.py)** - INFO 層級測試範例
6. **[test_low_levels.py](../../test/test_low_levels.py)** - LOW 層級測試範例
7. **[validate_dependencies.py](../../scripts/validate_dependencies.py)** - 依賴驗證腳本

## 🔍 關鍵概念

### 分層架構

#### INFO 層級 - 基礎架構
- **INFO-0**: 基礎常數與設定 (security_constants.py)
- **INFO-1**: 基礎工具與例外處理 (security_utils.py, security_exceptions.py)
- **INFO-2**: 日誌系統 (security_logger.py)
- **INFO-3**: 配置管理與監控 (config_manager.py, security_monitoring.py)

#### LOW 層級 - 一般安全風險防護
- **資訊洩露防護**: 敏感資訊過濾與錯誤訊息淨化
- **密碼政策**: 密碼強度驗證與政策檢查
- **安全標頭**: HTTP 安全標頭管理
- **路徑遍歷防護**: 檔案路徑安全驗證
- **端點安全**: API 端點防護與速率限制

### 依賴規則
- ✅ 高層級可依賴低層級 (INFO-3 → INFO-2 → INFO-1 → INFO-0)
- ✅ LOW 層級可依賴 INFO 層級 (LOW → INFO-0/1/2/3)
- ❌ 低層級不可依賴高層級
- ❌ 同層級間不可循環依賴
- ❌ 禁止跨層級循環依賴

### 外部依賴
- **PyYAML** ≥6.0 (配置解析)
- **psutil** ≥5.8.0 (系統監控)
- **hashlib** (密碼雜湊)
- **re** (正規表達式)
- **time** (時間處理)
- **datetime** (日期時間)

## 📊 測試狀態

最新測試結果 (2025-01-07):

### INFO 層級測試 ✅
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

### LOW 層級測試 ✅
```
✅ 資訊洩露防護 ................. 通過
✅ 密碼政策驗證 ................. 通過
✅ HTTP 安全標頭 ................ 通過
✅ 路徑遍歷防護 ................. 通過
✅ 端點安全防護 ................. 通過
✅ LOW 層級依賴整合 ............ 通過

總計: 6 項測試 | 成功率: 100.0%
```

### 依賴驗證 ✅
```
✅ INFO 層級依賴驗證 ............ 通過
✅ LOW 層級依賴驗證 ............. 通過
✅ 外部依賴檢查 ................. 通過
✅ 循環依賴檢查 ................. 通過

總計: 4 項驗證 | 成功率: 100.0%
```

## 🛠️ 維護指南

### 新增模組時
1. **確認層級歸屬**
   - INFO 層級：基礎架構組件
   - LOW 層級：一般安全風險防護
2. **檢查依賴關係**
   - 確保符合分層架構規則
   - 避免循環依賴
3. **更新配置檔案**
   - 更新 `secure-dependencies.yaml`
   - 添加外部依賴、內部依賴、導出項目、使用者資訊
4. **撰寫測試**
   - INFO 層級：加入 `test_info_levels.py`
   - LOW 層級：加入 `test_low_levels.py`
5. **驗證配置**
   - 執行 `validate_dependencies.py` 確保一致性
6. **更新文件**
   - 更新相關說明文件

### 修改依賴時
1. **檢查循環依賴**
   - 使用依賴驗證腳本檢查
2. **驗證層級規則**
   - 確保依賴方向正確
3. **更新 YAML 配置**
   - 同步更新 `secure-dependencies.yaml`
4. **執行完整測試**
   - 測試 INFO 和 LOW 兩個層級
5. **更新依賴圖**
   - 更新相關文件說明

### 問題排除
- **模組導入錯誤**: 檢查模組導入路徑和依賴關係
- **外部依賴問題**: 驗證外部依賴安裝和版本
- **Docker 環境**: 確認 Docker 環境配置正確
- **測試失敗**: 查看詳細測試輸出日誌
- **依賴驗證失敗**: 檢查 YAML 配置與實際代碼一致性

### 常用命令
```bash
# 執行所有測試
docker-compose -f docker-compose.dual.yml exec backend python -m pytest security/test/ -v

# 驗證所有依賴
docker-compose -f docker-compose.dual.yml exec backend python security/scripts/validate_dependencies.py

# 檢查特定層級
docker-compose -f docker-compose.dual.yml exec backend python security/test/test_info_levels.py
docker-compose -f docker-compose.dual.yml exec backend python security/test/test_low_levels.py
```

## 📞 技術支援

如有問題，請按以下順序排除：

### 1. 查看相關文件
- **架構說明**: [info-levels-guide.md](info-levels-guide.md)
- **依賴關係**: [info-dependencies-diagram.md](info-dependencies-diagram.md)  
- **配置檔案**: [secure-dependencies.yaml](../configs/secure-dependencies.yaml)

### 2. 執行測試診斷
```bash
# 完整測試診斷
docker-compose -f docker-compose.dual.yml exec backend python -m pytest security/test/ -v -s

# 依賴關係驗證
docker-compose -f docker-compose.dual.yml exec backend python security/scripts/validate_dependencies.py
```

### 3. 檢查日誌輸出
- 查看測試詳細輸出
- 檢查 Docker 容器日誌
- 驗證模組導入路徑

### 4. 常見問題解決
- **ModuleNotFoundError**: 檢查 Python 路徑和模組結構
- **循環依賴**: 執行依賴驗證腳本檢查
- **測試失敗**: 查看具體錯誤訊息並檢查對應模組
- **YAML 配置錯誤**: 確保配置與實際代碼一致

## 🏗️ 架構特色

### 嚴格分層設計
- **層級隔離**: INFO 和 LOW 層級各司其職
- **依賴管控**: 嚴格的依賴方向控制
- **配置驅動**: YAML 配置檔案統一管理

### 完整測試覆蓋
- **單元測試**: 每個模組獨立測試
- **整合測試**: 跨模組依賴測試  
- **依賴驗證**: 自動化依賴關係檢查

### 文件化管理
- **配置文件**: 完整的 YAML 配置
- **測試結果**: 詳細的測試報告
- **依賴圖表**: 視覺化依賴關係

---

*最後更新: 2025-01-07*  
*架構版本: v2.0.0*  
*涵蓋層級: INFO (info_0~info_3) + LOW (一般安全風險防護)*
