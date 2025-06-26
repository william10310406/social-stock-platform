# StockOS Memory CLI 中文化與 UTF-8 輸入支援報告

**版本**: 1.0  
**完成日期**: 2025-06-25  
**適用分支**: `main`

---

## 🎯 目標
1. 讓使用者可以直接輸入 **中文指令 / 子命令** 來操作 Memory CLI。  
2. `help` 指令提供 **中英文對照** 的用法說明。  
3. 終端機能正確接收與顯示 UTF-8（繁體中文）字元。

---

## 🛠️ 主要實作

| 模組 | 變更 | 重點 |
|------|------|------|
| `src/kernel/cli/memory_cli.c` | 1. 引入 `#include <locale.h>` 並於 `memory_cli_main_loop()` 呼叫 `setlocale(LC_CTYPE, "")`.  <br/>2. `k_commands[]` 新增中文關鍵字 (記憶體資訊、夥伴、區塊 …)。 <br/>3. `dispatch_command()` 與 `cli_cmd_buddy / slab` 加入中英文對照比對。 <br/>4. `help` 內容改為中文說明並列出中英文指令。 <br/>5. 輸入字元判斷改用 `((unsigned char)c >= 0x20 && c != 0x7F)` 允許高位元組。 | ‑ 啟用 UTF-8 locale <br/>- 中文補全/比對 <br/>- 完整中文 Help |
| `src/kernel/stubs.c` | 同步更新 `help` 內容（Stub 版本）。 | 保持使用者空間/核心測試一致 |
| `StockOS/Makefile` | `cli` 目標自動重新編譯上述檔案。 | `make cli` 一鍵產生可執行檔 |

---

## 📦 使用方式

```bash
# 重新編譯 CLI
make cli

# 啟動 CLI（使用者空間，不需 QEMU）
./build/stockos_cli
```

### 範例互動

```
StockOS> help
可用指令與說明：

meminfo / 記憶體資訊    - 顯示整體記憶體統計
buddy / 夥伴 stat|狀態  - 顯示 Buddy 分配器統計
buddy / 夥伴 alloc|配置 <頁數> - 分配 <頁數>×4KiB 記憶體
buddy / 夥伴 free|釋放 <索引>  - 釋放先前 buddy alloc
slab / 區塊 stat|狀態   - 顯示 Slab 分配器統計
slab / 區塊 alloc|配置 <大小> - 分配 <大小> 位元組記憶體
slab / 區塊 free|釋放 <索引>   - 釋放先前 slab alloc
history                - 列出歷史指令
history clear          - 清除歷史記錄
exit                   - 離開 CLI

StockOS> 記憶體資訊
[輸出] …
StockOS> 夥伴 狀態
[輸出] …
```

---

## ✅ 驗收項目
1. `make cli && ./build/stockos_cli` 可以顯示中文 Help。  
2. 中文指令 (`記憶體資訊`, `夥伴`, `區塊`) 功能與英文相同。  
3. 歷史、補全 (Tab) 會列出中英文關鍵字。  
4. 核心版 (`kernel_loop` 透過序列埠) 亦能處理中文指令。  
5. 所有現有單元測試 (`make test_memory_verbose`) 100% 通過。

---

## 📌 待辦 / 改進方向
* **自動偵測編碼**: 目前依賴系統 locale，若在非 UTF-8 環境需額外處理。  
* **多語系抽象化**: 之後可改用命令映射表 (`struct {const char* en; const char* zh;}`) 統一管理。  
* **寬字元游標處理**: CLI 光標/刪除對寬字元（全形）尚未完美，日後可用 `wcwidth()` 改進。 