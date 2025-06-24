# StockOS Kernel PMM/VMM 整合技術規格

**版本**: 1.0  
**創建日期**: 2025-06-24  
**狀態**: 設計階段  

---

## 🎯 **整合目標**

### **主要目標**
1. **系統調用接口**: 實現 `sys_balloc`、`sys_bfree`、`sys_bmstat` 等系統調用
2. **CLI 測試工具**: 提供完整的記憶體測試命令行界面
3. **內核記憶體管理**: 整合 CCMS 到內核層級
4. **實時監控**: 提供記憶體使用統計和診斷功能

### **技術要求**
- 支持 4KiB 頁面管理
- 線程安全的記憶體分配
- O(log n) 分配/釋放性能
- 完整的錯誤處理和恢復機制

---

## 🏗️ **系統架構設計**

### **1️⃣ 內核記憶體管理器 (KMM)**

```c
// 內核記憶體管理器
typedef struct {
    // 物理記憶體管理器 (PMM)
    pmm_manager_t pmm;
    
    // 虛擬記憶體管理器 (VMM)
    vmm_manager_t vmm;
    
    // CCMS 整合層
    ccms_kernel_interface_t ccms;
    
    // 系統調用處理器
    syscall_handler_t syscall_handler;
    
    // CLI 命令處理器
    cli_handler_t cli_handler;
    
    // 統計和監控
    memory_monitor_t monitor;
} kernel_memory_manager_t;
```

### **2️⃣ 物理記憶體管理器 (PMM)**

```c
// PMM 核心結構
typedef struct {
    // Buddy 分配器整合
    buddy_allocator_t* buddy;
    
    // Slab 分配器整合
    slab_allocator_t* slab;
    
    // 頁面框架管理
    page_frame_t* page_frames;
    uint32_t total_frames;
    uint32_t free_frames;
    
    // 記憶體映射
    memory_map_t* memory_map;
    
    // 統計資訊
    pmm_stats_t stats;
} pmm_manager_t;

// PMM API
int pmm_init(pmm_manager_t* pmm, memory_map_t* map);
void* pmm_alloc_page(pmm_manager_t* pmm);
void pmm_free_page(pmm_manager_t* pmm, void* page);
void* pmm_alloc_pages(pmm_manager_t* pmm, size_t count);
void pmm_free_pages(pmm_manager_t* pmm, void* pages, size_t count);
pmm_stats_t pmm_get_stats(pmm_manager_t* pmm);
```

### **3️⃣ 虛擬記憶體管理器 (VMM)**

```c
// VMM 核心結構
typedef struct {
    // 頁表管理
    page_directory_t* page_directory;
    
    // 虛擬地址空間管理
    vma_manager_t vma_manager;
    
    // 頁面錯誤處理
    page_fault_handler_t pf_handler;
    
    // COW 支持
    cow_manager_t cow_manager;
    
    // 統計資訊
    vmm_stats_t stats;
} vmm_manager_t;

// VMM API
int vmm_init(vmm_manager_t* vmm);
void* vmm_alloc(vmm_manager_t* vmm, size_t size, uint32_t flags);
void vmm_free(vmm_manager_t* vmm, void* addr, size_t size);
int vmm_map_page(vmm_manager_t* vmm, void* virt, void* phys, uint32_t flags);
void vmm_unmap_page(vmm_manager_t* vmm, void* virt);
vmm_stats_t vmm_get_stats(vmm_manager_t* vmm);
```

---

## 🔧 **系統調用接口設計**

### **系統調用列表**

| 系統調用 | 功能 | 參數 | 返回值 |
|----------|------|------|--------|
| `sys_balloc` | Buddy 分配 | size, flags | ptr/NULL |
| `sys_bfree` | Buddy 釋放 | ptr, size | status |
| `sys_salloc` | Slab 分配 | cache_id, flags | ptr/NULL |
| `sys_sfree` | Slab 釋放 | ptr, cache_id | status |
| `sys_cmalloc` | CCMS 分配 | size, level | ptr/NULL |
| `sys_cmfree` | CCMS 釋放 | ptr, level | status |
| `sys_mstat` | 記憶體統計 | type, buffer | bytes_written |
| `sys_mmonitor` | 記憶體監控 | action, params | status |

### **系統調用實現**

```c
// 系統調用處理器
typedef struct {
    // 系統調用表
    syscall_func_t syscall_table[MAX_SYSCALLS];
    
    // 參數驗證
    param_validator_t validator;
    
    // 權限檢查
    permission_checker_t perm_checker;
    
    // 統計計數
    syscall_stats_t stats;
} syscall_handler_t;

// 系統調用實現示例
long sys_balloc(size_t size, uint32_t flags) {
    // 1. 參數驗證
    if (!validate_alloc_params(size, flags)) {
        return -EINVAL;
    }
    
    // 2. 權限檢查
    if (!check_alloc_permission(current_process, size)) {
        return -EPERM;
    }
    
    // 3. 調用 buddy 分配器
    void* ptr = buddy_alloc(size);
    if (!ptr) {
        return -ENOMEM;
    }
    
    // 4. 更新統計
    update_syscall_stats(SYS_BALLOC, 1);
    
    return (long)ptr;
}
```

---

## 🖥️ **CLI 命令設計**

### **CLI 命令列表**

| 命令 | 功能 | 語法 | 範例 |
|------|------|------|------|
| `meminfo` | 顯示記憶體資訊 | `meminfo [--detail]` | `meminfo --detail` |
| `buddy` | Buddy 操作 | `buddy <alloc/free/stat>` | `buddy alloc 4096` |
| `slab` | Slab 操作 | `slab <alloc/free/stat>` | `slab stat` |
| `ccms` | CCMS 操作 | `ccms <alloc/free/stat> [level]` | `ccms alloc 1024 working` |
| `vmem` | 虛擬記憶體 | `vmem <map/unmap/stat>` | `vmem stat` |
| `pmem` | 物理記憶體 | `pmem <alloc/free/stat>` | `pmem stat` |
| `test` | 記憶體測試 | `test <type> [params]` | `test stress 1000` |
| `monitor` | 記憶體監控 | `monitor <start/stop/show>` | `monitor start` |

### **CLI 實現架構**

```c
// CLI 命令處理器
typedef struct {
    // 命令表
    cli_command_t commands[MAX_CLI_COMMANDS];
    
    // 輸入緩衝區
    char input_buffer[CLI_BUFFER_SIZE];
    
    // 輸出格式化器
    output_formatter_t formatter;
    
    // 命令歷史
    command_history_t history;
} cli_handler_t;

// CLI 命令結構
typedef struct {
    const char* name;
    const char* description;
    cli_func_t handler;
    const char* usage;
} cli_command_t;

// CLI 命令實現示例
int cli_meminfo(int argc, char** argv) {
    bool detail = false;
    
    // 解析參數
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--detail") == 0) {
            detail = true;
        }
    }
    
    // 獲取記憶體統計
    memory_stats_t stats = get_global_memory_stats();
    
    // 顯示資訊
    printf("StockOS Memory Information\n");
    printf("==========================\n");
    printf("Total Memory: %zu KB\n", stats.total_memory / 1024);
    printf("Used Memory:  %zu KB\n", stats.used_memory / 1024);
    printf("Free Memory:  %zu KB\n", stats.free_memory / 1024);
    
    if (detail) {
        printf("\nDetailed Statistics:\n");
        printf("Buddy Allocator:\n");
        printf("  - Allocations: %zu\n", stats.buddy.alloc_count);
        printf("  - Deallocations: %zu\n", stats.buddy.free_count);
        printf("  - Bytes in use: %zu\n", stats.buddy.bytes_in_use);
        
        printf("Slab Allocator:\n");
        printf("  - Active caches: %zu\n", stats.slab.active_caches);
        printf("  - Objects in use: %zu\n", stats.slab.objects_in_use);
        
        printf("CCMS Levels:\n");
        for (int i = 0; i < CM_LEVEL_COUNT; i++) {
            printf("  - %s: %zu bytes\n", 
                   get_level_name(i), stats.ccms.levels[i].bytes_in_use);
        }
    }
    
    return 0;
}
```

---

## 🧪 **測試框架設計**

### **測試模組**

```c
// 記憶體測試框架
typedef struct {
    // 測試套件
    test_suite_t* suites;
    
    // 測試結果
    test_results_t results;
    
    // 性能測試
    performance_tester_t perf_tester;
    
    // 壓力測試
    stress_tester_t stress_tester;
} memory_test_framework_t;

// 測試類型
typedef enum {
    TEST_BASIC_ALLOC,      // 基本分配測試
    TEST_STRESS,           // 壓力測試
    TEST_FRAGMENTATION,    // 碎片化測試
    TEST_PERFORMANCE,      // 性能測試
    TEST_THREAD_SAFETY,    // 線程安全測試
    TEST_MEMORY_LEAK,      // 記憶體洩漏測試
} test_type_t;
```

---

## 📊 **監控和統計**

### **記憶體監控器**

```c
// 記憶體監控器
typedef struct {
    // 實時統計
    realtime_stats_t realtime;
    
    // 歷史數據
    history_buffer_t history;
    
    // 警告系統
    alert_system_t alerts;
    
    // 性能分析器
    profiler_t profiler;
} memory_monitor_t;
```

---

## 🚀 **實施計劃**

### **階段 1: PMM 整合 (3-4 天)**
1. 創建 PMM 接口層
2. 整合 Buddy Allocator
3. 實現基本系統調用
4. 基礎測試

### **階段 2: VMM 整合 (3-4 天)**
1. 創建 VMM 接口層
2. 實現頁表管理
3. 添加虛擬記憶體系統調用
4. VMM 測試

### **階段 3: CLI 實現 (2-3 天)**
1. 實現 CLI 框架
2. 添加基本命令
3. 實現測試命令
4. CLI 測試

### **階段 4: 整合測試 (2-3 天)**
1. 系統整合測試
2. 性能測試
3. 壓力測試
4. 文檔更新

---

## 📝 **開發優先級**

### **高優先級**
- [ ] PMM 基礎接口
- [ ] Buddy 系統調用
- [ ] 基本 CLI 命令
- [ ] 記憶體統計

### **中優先級**
- [ ] VMM 接口
- [ ] Slab 系統調用
- [ ] 高級 CLI 命令
- [ ] 性能監控

### **低優先級**
- [ ] 高級測試功能
- [ ] 圖形化監控
- [ ] 遠程監控
- [ ] 自動調優

---

**維護者**: StockOS Core Memory Team  
**最後更新**: 2025-06-24 