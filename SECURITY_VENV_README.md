# 🔒 資安系統虛擬環境使用指南

本專案已成功配置在Python虛擬環境中，包含完整的資安模組和依賴套件。

## 🚀 快速開始

### 1. 啟動虛擬環境

**日常開發（推薦）：**
```bash
# 每次開始工作時，只需要這一行
source venv/bin/activate
```

**完整設置（特殊情況）：**
```bash
# 只在首次設置或環境損壞時使用
./setup_security_env.sh
```

> 💡 **提示**: 大部分時候您只需要 `source venv/bin/activate` 就夠了！

### 2. 驗證環境
```bash
# 檢查Python版本和路徑
python --version
which python

# 測試資安系統
python test_security_system.py

# 測試配置管理器
python -m security.levels.info.info_2.config_manager
```

## 📦 已安裝的關鍵套件

| 套件名稱 | 版本 | 用途 |
|---------|------|------|
| PyYAML | 6.0.2 | YAML配置文件支援 |
| psutil | 7.0.0 | 系統監控 |
| cryptography | 45.0.4 | 加密功能 |
| Flask | 2.3.3 | Web框架 |
| pytest | 8.4.1 | 測試框架 |
| SQLAlchemy | 1.4.51 | 資料庫ORM |

## 🏗️ 專案結構

```
social-stock-platform/
├── venv/                           # Python虛擬環境
├── security/                       # 資安模組
│   ├── configs/
│   │   └── security-levels.yaml    # 分層配置
│   └── levels/
│       └── info/                   # INFO層級模組
│           ├── info_0/             # 基礎工具
│           │   ├── security_constants.py
│           │   ├── security_utils.py
│           │   └── security_exceptions.py
│           ├── info_1/             # 日誌監控
│           │   ├── security_logger.py
│           │   └── security_monitoring.py
│           └── info_2/             # 配置管理
│               └── config_manager.py ✅
├── security_requirements.txt       # 資安模組依賴
├── setup_security_env.sh          # 環境設置腳本
└── test_security_system.py        # 系統測試腳本
```

## ✅ 功能狀態

### INFO層級模組
- **INFO-0 (基礎工具)**: 🔄 部分功能
  - ✅ security_exceptions: 例外處理
  - 🔄 security_constants: 常數定義
  - 🔄 security_utils: 工具函數
  
- **INFO-1 (日誌監控)**: 🔄 開發中
  - 🔄 security_logger: 日誌系統
  - 🔄 security_monitoring: 系統監控
  
- **INFO-2 (配置管理)**: ✅ 完全功能
  - ✅ config_manager: **完整功能**
  - ✅ YAML支援: **正常運作**
  - ✅ 配置來源管理: **多源支援**
  - ✅ 環境變數整合: **自動載入**

## 🔧 常用指令

### 日常工作流程 ⭐
```bash
# 1. 啟動虛擬環境（每次開始工作）
source venv/bin/activate

# 2. 開始開發...
python -m security.levels.info.info_2.config_manager

# 3. 完成後停用虛擬環境
deactivate
```

### 何時需要完整設置？
```bash
# 只在以下情況運行完整設置腳本：
./setup_security_env.sh

# 使用時機：
# - 🆕 第一次設置專案
# - 🔄 虛擬環境損壞需要重建
# - 📦 需要重新安裝依賴套件
# - 🔍 檢查整個環境狀態
```

### 虛擬環境管理
```bash
# 啟動虛擬環境
source venv/bin/activate

# 停用虛擬環境
deactivate

# 檢查已安裝套件
pip list

# 更新套件列表
pip freeze > security_requirements.txt
```

### 資安模組測試
```bash
# 完整系統測試
python test_security_system.py

# 測試配置管理器
python -m security.levels.info.info_2.config_manager

# 測試特定模組
python -c "from security.levels.info.info_2.config_manager import get_config; print(get_config('security.logging.level'))"
```

### 配置管理
```bash
# 查看配置
python -c "
from security.levels.info.info_2.config_manager import ConfigManager
cm = ConfigManager()
print(cm.export_config('yaml'))
"

# 設置環境變數配置
export SECURITY_LOGGING_LEVEL=DEBUG
export SECURITY_MONITORING_ENABLED=true
```

## 🎯 下一步開發計劃

1. **完善 INFO-0 層級模組**
   - 修正 security_constants 和 security_utils
   - 新增更多工具函數

2. **完善 INFO-1 層級模組**
   - 修正 security_logger 和 security_monitoring
   - 整合系統監控功能

3. **開發更高層級模組**
   - LOW層級: 密碼政策、輸入驗證等
   - MEDIUM層級: CSRF防護、API安全等
   - HIGH層級: XSS防護、數據存取控制等
   - CRITICAL層級: SQL注入防護、RCE防護等

## 🚨 注意事項

1. **虛擬環境**: 請務必在虛擬環境中開發，避免套件衝突
2. **依賴管理**: 新增套件後請更新 `security_requirements.txt`
3. **配置文件**: YAML配置已完全支援，可安全使用
4. **模組導入**: 請使用絕對導入路徑，避免相對導入問題

## 🎉 成功要點

✅ **虛擬環境設置完成**  
✅ **依賴套件安裝成功**  
✅ **YAML支援正常運作**  
✅ **配置管理器完全功能**  
✅ **系統測試腳本就緒**  

現在您可以在完全獨立的虛擬環境中進行資安系統開發了！
