 # StockOS Memory CLI – Core Commands (v1)

日期：2025-06-25  
作者：開發自動化報告

---

## 1. 目標

在使用者空間 (user-space) 的 **StockOS Memory CLI** 中，提供最基本且常用的檔案系統操作指令，
讓開發者在不進入真正的 kernel / QEMU 環境時，也能快速瀏覽、管理專案目錄並編輯檔案。

## 2. 已完成指令

| 指令 | 中文別名 | 作用 | 典型用法 |
|------|----------|------|-----------|
| `cat <file>` | `查看` | 顯示檔案內容 | `cat README.md` |
| `ls [path]` | `列表` | 列出檔案 / 目錄（相當於 `ls -al --color=auto`） | `ls src/` |
| `mkdir <path...>` | `建立目錄` / `創建目錄` | 建立一或多個目錄 (含 `-p`) | `mkdir build/tmp logs` |
| `cd [path]` | `切換目錄` | 切換工作目錄；不帶參數時印出目前路徑 | `cd src/kernel` |
| `pwd` | `當前目錄` | 顯示目前工作目錄 | `pwd` |
| `edit <file>` | `編輯` | 使用內建 **kilo** 編輯器開啟檔案 | `edit src/apps/kilo/kilo.c` |

> 備註：**meminfo / buddy / slab** 等記憶體管理相關指令已於先前版本完成，故未列入此表。

## 3. Prompt 改進

| 版本 | 顯示樣式 |
|------|----------|
| v0   | `StockOS> ` *(固定字串)* |
| v1   | `StockOS:/相對路徑> ` |

* 以啟動 CLI 的路徑作為「根」，顯示相對路徑：
  * 根目錄： `StockOS:/>`
  * 子目錄： `StockOS:/src/kernel>`
* 若離開啟動路徑層級 (例如 `cd /tmp`) 會自動顯示完整路徑，確保不失真。
* 顏色：`StockOS` 使用綠色，路徑使用青色，均可於 ANSI 相容終端正常顯示。

## 4. 技術細節

1. **Raw mode 切換**  
   * `cat` / `ls` / `mkdir` / `edit` 先 `disable_raw_mode()` → 執行外部程式 → `enable_raw_mode()`；
   * 回到 CLI 時用 `printf("\n")` 或 `\x1b[2J\x1b[H` 清理畫面。
2. **相對路徑計算**  
   * 啟動時 (`memory_cli_init`) 以 `getcwd()` 紀錄 `g_base_dir`。
   * 每次輸出 prompt 時比對 `cwd` 與 `g_base_dir` 前綴並裁切。
3. **Tab 補完**  
   * `k_commands[]` 增加 `cat`、`ls`、`mkdir`、`cd`、`pwd` 等關鍵字，維持良好輸入體驗。

## 5. 待辦事項

- [ ] `rm` / `cp` / `mv` 等進階檔案指令。
- [ ] `grep` / `find` 等搜尋工具。
- [ ] 使用 Readline 或 linenoise 改善命令列編輯體驗。
- [ ] 考慮整合虛擬檔案系統 (VFS) 介面，方便移植到真正的 kernel 空間。

---

如有問題或建議，請於專案 Issue 區提出，或直接聯繫開發團隊。