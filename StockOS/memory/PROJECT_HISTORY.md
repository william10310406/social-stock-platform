# 🧠 StockOS 專案歷程與架構決策記錄

## 1️⃣ 專案初始化
- 目標：將 Stock Insight Platform 的架構經驗下沉到 OS kernel 開發。
- 建立專案目錄結構（src/boot, src/kernel, drivers, lib, tools, docs）。
- 撰寫 README.md，明確專案願景、分階段目標、架構轉換心法。

## 2️⃣ 開發工具鏈與自動化
- tools/setup.sh：一鍵安裝 QEMU、NASM、GDB、i686-elf-gcc、i686-elf-binutils、i686-elf-grub。
- Makefile：
  - 支援 bootloader (bin) 與 kernel (ELF) 分開編譯。
  - 新增 check-deps/info/clean/help 等自動化目標。
  - 使用 i686-elf-grub-mkrescue 組合 ISO。

## 3️⃣ Bootloader 與 Kernel 分工
- src/boot/boot.asm：
  - 16位裸機格式，負責顯示 "StockOS Loading..."，載入 kernel，切換到保護模式。
  - 用 nasm -f bin 編譯為 boot.bin。
- src/kernel/kernel.c/h：
  - ELF 格式，C 語言主體，模組化服務架構（memory/process/fs/network/drivers）。
  - 提供 clear_screen/print/scroll_screen 等基礎函數。
  - kernel_main() 進行服務初始化與主循環。

## 4️⃣ 用戶參與架構設計的方式
- memory/PROJECT_HISTORY.md（本檔案）：
  - 詳細記錄每次自動化、架構決策、技術選型、分工原則。
  - 用戶可直接在此檔案留言、提出架構建議、記錄討論過程。
- docs/ARCHITECTURE.md：
  - 將會同步記錄所有架構圖、模組關係、設計原則。
- 每次重大架構調整、技術選型、模組分工都會在 memory/PROJECT_HISTORY.md 留痕。

## 5️⃣ 記憶體架構設計討論 (2025-06-24)

### 用戶需求：
- 結合 COW fork、Paging page directory、分段等優點
- 最大化記憶體利用率
- 將 time sharing 提高到新高度
- 避免卡頓現象

### 架構回應：
- 創建了 `memory/MEMORY_ARCHITECTURE_DESIGN.md` 高級記憶體架構設計
- 設計特色：
  - **多層記憶體管理系統**：PMM + VMM + 分段 + 程序記憶體 + 快取
  - **智能物理記憶體管理**：混合分配策略（Buddy + Slab + 壓縮池 + 預取）
  - **高級虛擬記憶體管理**：4級頁表 + 分段支援 + 擴展頁表項
  - **COW Fork 系統**：零複製 fork + 智能頁面錯誤處理
  - **無卡頓上下文切換**：預載入 + 記憶體預取 + 快取優化 + 中斷延遲控制
  - **記憶體利用率最大化**：智能回收 + 壓縮 + 多種置換算法

### 下一步規劃：
- 修正 bootloader 與 kernel 的編譯鏈，確保 boot.bin (bin) + kernel.elf (ELF) 正確組合。
- 設計 kernel 與 bootloader 的介面協議（如 kernel 載入位址、跳轉方式）。
- 用戶可參與：
  - 討論 kernel 服務模組分層（如 memory/process/fs/network）
  - 設計系統調用（syscall）API
  - 決定未來 StockOS 的特色功能（如內建金融數據、即時事件系統）

---

> **參與方式**：
> - 直接在 memory/PROJECT_HISTORY.md 留下你的設計想法、問題、建議。
> - 每次自動化/架構調整都會同步記錄，確保你能完整追蹤每一步。
> - 你可以指定任何架構決策點由你主導、或要求我給出多個設計選項供你選擇。

---

**最後更新**：2025-06-24 