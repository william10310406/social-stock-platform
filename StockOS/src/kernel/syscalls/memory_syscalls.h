/*
 * memory_syscalls.h - StockOS Memory Management System Calls
 * ===========================================================
 * 定義記憶體管理相關的系統調用接口
 * 
 * 創建日期: 2025-06-24
 * 版本: 1.0
 */

#ifndef STOCKOS_MEMORY_SYSCALLS_H
#define STOCKOS_MEMORY_SYSCALLS_H

#include <stddef.h>
#include <stdint.h>
#include "../memory/pmm.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ========================= 系統調用號定義 ========================= */
#define SYS_BALLOC      100     // Buddy allocator 分配
#define SYS_BFREE       101     // Buddy allocator 釋放
#define SYS_SALLOC      102     // Slab allocator 分配  
#define SYS_SFREE       103     // Slab allocator 釋放
#define SYS_CMALLOC     104     // CCMS 分配
#define SYS_CMFREE      105     // CCMS 釋放
#define SYS_MSTAT       106     // 記憶體統計
#define SYS_MMONITOR    107     // 記憶體監控
#define SYS_MREPORT     108     // 記憶體報告
#define SYS_MCHECK      109     // 記憶體一致性檢查

/* ========================= 系統調用參數結構 ========================= */

// 記憶體統計請求
typedef struct {
    uint32_t stat_type;         // 統計類型
    void* buffer;               // 輸出緩衝區
    size_t buffer_size;         // 緩衝區大小
} memory_stat_request_t;

// 記憶體監控請求
typedef struct {
    uint32_t action;            // 監控動作
    uint32_t params[4];         // 參數數組
} memory_monitor_request_t;

// 系統調用返回結構
typedef struct {
    long result;                // 返回值
    int error_code;             // 錯誤碼
    uint32_t flags;             // 標誌
} syscall_result_t;

/* ========================= 統計類型定義 ========================= */
#define MSTAT_BASIC         0   // 基本統計
#define MSTAT_DETAILED      1   // 詳細統計
#define MSTAT_BUDDY         2   // Buddy allocator 統計
#define MSTAT_SLAB          3   // Slab allocator 統計
#define MSTAT_CCMS          4   // CCMS 統計
#define MSTAT_ALL           5   // 所有統計

/* ========================= 監控動作定義 ========================= */
#define MMONITOR_START      0   // 開始監控
#define MMONITOR_STOP       1   // 停止監控
#define MMONITOR_RESET      2   // 重置統計
#define MMONITOR_STATUS     3   // 獲取監控狀態

/* ========================= 系統調用實現 ========================= */

/**
 * sys_balloc - Buddy allocator 分配系統調用
 * @param size: 請求大小
 * @param flags: 分配標誌
 * @return: 成功返回指針，失敗返回負錯誤碼
 */
long sys_balloc(size_t size, uint32_t flags);

/**
 * sys_bfree - Buddy allocator 釋放系統調用
 * @param ptr: 記憶體指針
 * @param size: 記憶體大小
 * @return: 成功返回 0，失敗返回負錯誤碼
 */
long sys_bfree(void* ptr, size_t size);

/**
 * sys_salloc - Slab allocator 分配系統調用
 * @param cache_id: 緩存 ID
 * @param flags: 分配標誌
 * @return: 成功返回指針，失敗返回負錯誤碼
 */
long sys_salloc(uint32_t cache_id, uint32_t flags);

/**
 * sys_sfree - Slab allocator 釋放系統調用
 * @param ptr: 記憶體指針
 * @param cache_id: 緩存 ID
 * @return: 成功返回 0，失敗返回負錯誤碼
 */
long sys_sfree(void* ptr, uint32_t cache_id);

/**
 * sys_cmalloc - CCMS 分配系統調用
 * @param size: 請求大小
 * @param level: CCMS 層級
 * @return: 成功返回指針，失敗返回負錯誤碼
 */
long sys_cmalloc(size_t size, uint32_t level);

/**
 * sys_cmfree - CCMS 釋放系統調用
 * @param ptr: 記憶體指針
 * @param level: CCMS 層級
 * @return: 成功返回 0，失敗返回負錯誤碼
 */
long sys_cmfree(void* ptr, uint32_t level);

/**
 * sys_mstat - 記憶體統計系統調用
 * @param request: 統計請求結構
 * @return: 成功返回寫入字節數，失敗返回負錯誤碼
 */
long sys_mstat(memory_stat_request_t* request);

/**
 * sys_mmonitor - 記憶體監控系統調用
 * @param request: 監控請求結構
 * @return: 成功返回 0，失敗返回負錯誤碼
 */
long sys_mmonitor(memory_monitor_request_t* request);

/**
 * sys_mreport - 記憶體報告系統調用
 * @param buffer: 輸出緩衝區
 * @param buffer_size: 緩衝區大小
 * @return: 成功返回寫入字節數，失敗返回負錯誤碼
 */
long sys_mreport(char* buffer, size_t buffer_size);

/**
 * sys_mcheck - 記憶體一致性檢查系統調用
 * @return: 通過返回 1，失敗返回 0，錯誤返回負錯誤碼
 */
long sys_mcheck(void);

/* ========================= 系統調用處理器 ========================= */

/**
 * 初始化記憶體系統調用處理器
 * @return: 成功返回 0，失敗返回負錯誤碼
 */
int memory_syscalls_init(void);

/**
 * 處理記憶體系統調用
 * @param syscall_no: 系統調用號
 * @param args: 參數數組
 * @return: 系統調用結果
 */
syscall_result_t handle_memory_syscall(uint32_t syscall_no, long args[]);

/**
 * 系統調用參數驗證
 * @param syscall_no: 系統調用號
 * @param args: 參數數組
 * @return: 有效返回 true
 */
bool validate_syscall_params(uint32_t syscall_no, long args[]);

/**
 * 檢查系統調用權限
 * @param syscall_no: 系統調用號
 * @param current_pid: 當前進程 ID
 * @return: 有權限返回 true
 */
bool check_syscall_permission(uint32_t syscall_no, uint32_t current_pid);

/* ========================= 便利宏定義 ========================= */

// 系統調用包裝宏
#define SYSCALL_BALLOC(size, flags) \
    sys_balloc((size), (flags))

#define SYSCALL_BFREE(ptr, size) \
    sys_bfree((ptr), (size))

#define SYSCALL_CMALLOC(size, level) \
    sys_cmalloc((size), (level))

#define SYSCALL_CMFREE(ptr, level) \
    sys_cmfree((ptr), (level))

// 錯誤檢查宏
#define IS_SYSCALL_ERROR(result) ((result) < 0)
#define SYSCALL_ERROR_CODE(result) (-(result))

/* ========================= 錯誤碼定義 ========================= */
#define SYSCALL_SUCCESS         0       // 成功
#define SYSCALL_ERROR_NOMEM    -1       // 記憶體不足
#define SYSCALL_ERROR_INVAL    -2       // 無效參數
#define SYSCALL_ERROR_PERM     -3       // 權限不足
#define SYSCALL_ERROR_NOTINIT  -4       // 未初始化
#define SYSCALL_ERROR_CORRUPT  -5       // 數據損壞
#define SYSCALL_ERROR_NOSYS    -6       // 系統調用不存在

/* ========================= 統計結構 ========================= */

// 系統調用統計
typedef struct {
    uint64_t total_calls;           // 總調用次數
    uint64_t successful_calls;      // 成功調用次數
    uint64_t failed_calls;          // 失敗調用次數
    uint64_t bytes_allocated;       // 分配字節數
    uint64_t bytes_freed;           // 釋放字節數
    
    // 各個系統調用的統計
    struct {
        uint64_t balloc_calls;
        uint64_t bfree_calls;
        uint64_t salloc_calls;
        uint64_t sfree_calls;
        uint64_t cmalloc_calls;
        uint64_t cmfree_calls;
        uint64_t mstat_calls;
        uint64_t mmonitor_calls;
        uint64_t mreport_calls;
        uint64_t mcheck_calls;
    } per_syscall;
} memory_syscall_stats_t;

/**
 * 獲取系統調用統計
 * @return: 系統調用統計結構
 */
memory_syscall_stats_t get_memory_syscall_stats(void);

/**
 * 重置系統調用統計
 */
void reset_memory_syscall_stats(void);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* STOCKOS_MEMORY_SYSCALLS_H */ 