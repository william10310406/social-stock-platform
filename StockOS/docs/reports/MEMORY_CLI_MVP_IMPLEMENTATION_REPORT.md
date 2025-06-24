# Memory CLI MVP Implementation Report

**Date:** 2025-06-24  
**Author:** AI Pair-Programming Session  
**Scope:** 初版 Memory CLI（meminfo / buddy stat / slab stat）完成並可互動。

---

## 1. 目標
在不依賴完整 Bootloader 的情況下，提供一個可在使用者空間執行的簡易 CLI，方便驗證 PMM / Buddy / Slab 整合並示範未來 CLI 架構。

## 2. 主要檔案
| 檔案 | 功能 |
|------|------|
| `src/kernel/cli/memory_cli.c` | MVP CLI 實作，含指令解析及三條指令 | 
| `src/kernel/entry.c` | 使用者空間入口，初始化 PMM 與 CLI 迴圈 | 
| `Makefile` | 新增 `memory_cli.c`、`entry.c`、`memory_syscalls.c` 至 `KERNEL_SOURCES` | 
| `src/kernel/syscalls/memory_syscalls.c` | 系統調用 stub，避免連結錯誤 |

## 3. 指令一覽
| 指令 | 說明 |
|-------|-----------------------------------|
| `help` | 顯示可用指令 |
| `meminfo` | 印出 `pmm_get_memory_report()` 完整報告 |
| `buddy stat` | 顯示 Buddy alloc/free、split/merge 次數 |
| `slab stat` | 顯示 Slab alloc/free、free objects 等 |
| `exit` | 離開 CLI 迴圈 |

## 4. 實作要點
1. **指令解析**：使用 `strtok()` 解析最多 16 個參數，`dispatch_command()` 分流至對應 handler。
2. **PMM 取得**：透過 `extern pmm_get_global_instance()` 取得全域 PMM；在 user-space 入口自行建立局部 PMM。
3. **統計輸出**：`meminfo` 呼叫 `pmm_get_memory_report()`；其他兩條指令讀取 `pmm_get_stats()` 中子結構。
4. **入口程式**：`entry.c` 初始化 16 MiB 模擬記憶體 → `pmm_init()` → `memory_cli_init()` → `memory_cli_main_loop()`。
5. **Makefile**：將 CLI/entry 源文件加入 `kernel` 目標，確保 `./build/stockos_kernel` 生成。
6. **非互動測試**：可用 `printf "meminfo\nexit\n" | ./build/stockos_kernel` 驗證 CLI 行為。

## 5. 遇到問題
| 編譯/執行問題 | 解決方案 |
|---------------|-----------|
| Linker 找不到 `memory_syscalls_init` | 建立 `memory_syscalls.c` stub 實作回傳 0 |
| 嵌入式 `kernel_main` 依賴 VGA 輸出導致 segmentation fault | 改用獨立 `entry.c`，僅 user-space I/O |
| CLI 互動在自動化工具中阻塞 | 使用管線 / 重定向輸入避免無人互動 |

## 6. 成果
```bash
$ ./build/stockos_kernel
StockOS Memory CLI (user-space) – type 'help', 'exit' to quit
StockOS> meminfo
StockOS Physical Memory Manager Report
...
StockOS> buddy stat
Buddy Allocator Stats:
  Allocations : 0
  Deallocs    : 0
  Splits      : 0
  Merges      : 0
StockOS> exit
```
CLI 可正常解析指令並呼叫底層記憶體 API，為後續擴充奠定基礎。

---

## 7. 下一步
1. **新增 alloc/free 指令**：`buddy alloc`, `slab alloc`, 自動更新統計。  
2. **命令歷史、補全**：完善 CLI 互動體驗。  
3. **將 CLI 併入裸機 kernel**：待 Bootloader / QEMU 完成後，重用相同程式碼。  
4. **文件**：撰寫 `docs/technical/MEMORY_CLI_SPECS.md` 詳列協議與擴充接口。 