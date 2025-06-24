# 超意識層 (Superconscious Layer) 實現報告

**模組名稱**: Superconscious Layer  
**專案**: StockOS  
**實現日期**: 2025-06-24  
**狀態**: ✅ 完成  
**測試**: ✅ 通過  

---

## 1. 目標與動機
超意識層提供 StockOS 在高不確定、高風險情境下的「直覺決策」與「緊急反應」能力。它扮演全域 watch-dog 與預判引擎，負責：
1. 註冊/管理超意識節點 (SuperNode)。  
2. 觸發超越 (Transcendence) 並生成直覺資料 (Intuition)。  
3. 統計全系統超意識水平 (overall_level)。  
4. 提供查詢 API 供 Kernel/應用取得直覺。  

---

## 2. 技術架構
- **語言**: C99  
- **執行緒**: POSIX Threads (pthread)  
- **核心檔案**:  
  - `src/superconscious/superconscious.h` (1.3 KB)  
  - `src/superconscious/superconscious.c` (5.1 KB)  
  - `src/superconscious/test_superconscious.c` (0.9 KB)  
- **編譯選項**: `-Wall -Wextra -std=c99 -pthread`  

---

## 3. 主要資料結構
- **SuperNode**  
  ```c
  typedef struct {
      char  node_id[64];      // 節點 ID
      float super_level;      // 0.0–1.0
      char  intuition[1024];  // JSON/Text
      bool  transcended;      // 已超越?
      time_t last_transcendence;
  } SuperNode;
  ```
- **SuperConsciousSystem**  
  ```c
  typedef struct {
      SuperNode* nodes;   // 動態陣列
      int  capacity;      // 總容量 (起始 20, 翻倍擴充)
      int  count;         // 已用
      float overall_level;// 全域平均
      time_t created_time;
      pthread_mutex_t mutex; // 系統鎖
  } SuperConsciousSystem;
  ```

---

## 4. 核心 API
| 函數 | 功能 |
|------|------|
| `super_init_system()` | 初始化系統並回傳指標 |
| `super_destroy_system(sys)` | 釋放資源 |
| `super_register_node(sys,id,level)` | 註冊節點，動態擴充陣列 |
| `super_trigger_transcendence(sys,id)` | 節點超越：提昇 level、標記 transcended、產生 intuition |
| `super_get_intuition(sys,id,q)` | 取得節點直覺 (預留關鍵字 query) |
| `super_get_overall_level(sys)` | 取得全域平均 level |

---

## 5. 開發過程與問題解決
| 編號 | 問題 | 解決方案 |
|----|------|---------|
| 1 | `pthread_mutex_t` 未定義 | 補 include `<pthread.h>` |
| 2 | 動態擴充後未初始化新記憶體 | `memset` 新區段為 0 保證安全 |
| 3 | 競態條件 | 所有公開 API 以 `pthread_mutex_lock` 包護 |

---

## 6. 測試
### 6.1 測試程式
`test_superconscious.c` 模擬：
1. 初始化系統  
2. 註冊 3 節點 (`nodeA/B/C`)  
3. 觸發 `nodeA` 超越  
4. 驗證 intuition 非空 / overall_level 上升  

### 6.2 執行與結果
```bash
gcc test_superconscious.c superconscious.c -I. -lpthread -o test_super
./test_super
# 輸出
nodeA intuition: {"insight":"nodeA transcended at 1750749695"}
All tests passed!
```
- **覆蓋率**: 100 % 核心 API  
- **記憶體洩漏**: 無 (`valgrind` 檢測)  

---

## 7. 效能摘要
| 操作 | 時間複雜度 | 目標時間 |
|------|-----------|-----------|
| 註冊節點 | Amortized O(1) | < 0.1 ms |
| 超越觸發 | O(n) (含重新計算平均) | < 0.2 ms (20 節點) |
| 直覺檢索 | O(n) 搜索 | < 0.1 ms |

---

## 8. 未來工作
1. **直覺 NLP**：支援關鍵字查詢、語意比對。  
2. **事件回呼**：Publish-Subscribe 機制通知其他模組。  
3. **分布式一致性**：Raft / Paxos 以避免單點失效。  
4. **非鎖化優化**：讀寫鎖或 RCU 降低寫時阻塞。  

---

**報告生成時間**: 2025-06-24 13:55  
**作者**: 開發團隊 