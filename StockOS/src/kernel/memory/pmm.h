/*
 * pmm.h - StockOS Physical Memory Manager
 * =======================================
 * 整合 Buddy Allocator 和 Slab Allocator 的物理記憶體管理器
 * 
 * 創建日期: 2025-06-24
 * 版本: 1.0
 */

#ifndef STOCKOS_PMM_H
#define STOCKOS_PMM_H

#ifdef KERNEL_MODE
// Kernel mode: 使用我們自己的類型定義
#ifndef __STDINT_TYPES_DEFINED__
#define __STDINT_TYPES_DEFINED__
typedef unsigned char uint8_t;
typedef unsigned short uint16_t;
typedef unsigned int uint32_t;
#ifdef __LP64__
typedef unsigned long uint64_t;
typedef unsigned long uintptr_t;
#else
typedef unsigned long long uint64_t;
typedef unsigned long uintptr_t;
#endif
typedef unsigned long size_t;
typedef int bool;
#define true 1
#define false 0
#define NULL ((void*)0)
#endif
#else
// User mode: 使用標準頭文件
#include <stddef.h>
#include <stdint.h>
#include <stdbool.h>
#endif

// 引入現有的分配器 (僅在非 Kernel 模式)
#ifndef KERNEL_MODE
#include "../../crazy_memory/buddy_allocator.h"
#include "../../crazy_memory/slab_allocator.h"
#include "../../crazy_memory/crazy_memory.h"
#endif

#ifdef __cplusplus
extern "C" {
#endif

/* ========================= 常量定義 ========================= */
#define PMM_PAGE_SIZE       4096        // 頁面大小
#define PMM_MAX_ORDER       10          // 最大 order (4MB)
#define PMM_MAX_FRAMES      1048576     // 最大頁面框架數 (4GB / 4KB)

/* ========================= 記憶體映射 ========================= */
typedef struct {
    uint64_t start_addr;    // 起始地址
    uint64_t end_addr;      // 結束地址
    uint32_t type;          // 記憶體類型
    uint32_t flags;         // 標誌
} memory_region_t;

typedef struct {
    memory_region_t* regions;
    size_t region_count;
    uint64_t total_memory;
    uint64_t usable_memory;
} memory_map_t;

/* ========================= 頁面框架 ========================= */
typedef struct {
    uint32_t ref_count;     // 引用計數
    uint32_t flags;         // 頁面標誌
    void* virt_addr;        // 對應虛擬地址
    struct page_frame* next; // 鏈結串列指針
} page_frame_t;

/* ========================= PMM 統計 ========================= */
typedef struct {
    // 基本統計
    uint32_t total_frames;
    uint32_t free_frames;
    uint32_t used_frames;
    
    // 分配統計
    uint64_t alloc_count;
    uint64_t free_count;
    uint64_t bytes_allocated;
    
    // Buddy 統計
    struct {
        uint64_t buddy_allocs;
        uint64_t buddy_frees;
        uint64_t splits_performed;
        uint64_t merges_performed;
    } buddy_stats;
    
    // Slab 統計
    struct {
        uint32_t active_caches;
        uint32_t total_objects;
        uint32_t free_objects;
        uint64_t slab_allocs;
        uint64_t slab_frees;
    } slab_stats;
} pmm_stats_t;

/* ========================= PMM 管理器 ========================= */
typedef struct {
    // 記憶體映射資訊
    memory_map_t memory_map;
    
    // 頁面框架管理
    page_frame_t* page_frames;
    uint32_t total_frames;
    uint32_t free_frames;
    
    // 分配器集成
    bool buddy_initialized;
    bool slab_initialized;
    bool ccms_initialized;
    
    // 統計資訊
    pmm_stats_t stats;
    
    // 同步原語
    bool lock_initialized;
    // TODO: 添加適當的鎖機制
    
    // 配置參數
    struct {
        bool enable_buddy;
        bool enable_slab;
        bool enable_ccms;
        uint32_t min_alloc_size;
        uint32_t max_alloc_size;
    } config;
} pmm_manager_t;

/* ========================= PMM API ========================= */

/**
 * 初始化物理記憶體管理器
 * @param pmm PMM 管理器實例
 * @param map 記憶體映射資訊
 * @return 成功返回 0，失敗返回負錯誤碼
 */
int pmm_init(pmm_manager_t* pmm, memory_map_t* map);

/**
 * 清理物理記憶體管理器
 * @param pmm PMM 管理器實例
 */
void pmm_cleanup(pmm_manager_t* pmm);

/**
 * 分配單個頁面 (4KB)
 * @param pmm PMM 管理器實例
 * @return 成功返回頁面指針，失敗返回 NULL
 */
void* pmm_alloc_page(pmm_manager_t* pmm);

/**
 * 釋放單個頁面
 * @param pmm PMM 管理器實例
 * @param page 頁面指針
 */
void pmm_free_page(pmm_manager_t* pmm, void* page);

/**
 * 分配多個連續頁面
 * @param pmm PMM 管理器實例
 * @param count 頁面數量
 * @return 成功返回第一個頁面指針，失敗返回 NULL
 */
void* pmm_alloc_pages(pmm_manager_t* pmm, size_t count);

/**
 * 釋放多個連續頁面
 * @param pmm PMM 管理器實例
 * @param pages 第一個頁面指針
 * @param count 頁面數量
 */
void pmm_free_pages(pmm_manager_t* pmm, void* pages, size_t count);

/**
 * 分配指定大小的記憶體 (自動選擇分配器)
 * @param pmm PMM 管理器實例
 * @param size 請求大小
 * @param flags 分配標誌
 * @return 成功返回記憶體指針，失敗返回 NULL
 */
void* pmm_alloc(pmm_manager_t* pmm, size_t size, uint32_t flags);

/**
 * 釋放指定記憶體
 * @param pmm PMM 管理器實例
 * @param ptr 記憶體指針
 * @param size 記憶體大小 (用於確定分配器)
 */
void pmm_free(pmm_manager_t* pmm, void* ptr, size_t size);

/**
 * 獲取 PMM 統計資訊
 * @param pmm PMM 管理器實例
 * @return PMM 統計結構
 */
pmm_stats_t pmm_get_stats(pmm_manager_t* pmm);

/**
 * 重置 PMM 統計計數器
 * @param pmm PMM 管理器實例
 */
void pmm_reset_stats(pmm_manager_t* pmm);

/**
 * 檢查 PMM 內部一致性
 * @param pmm PMM 管理器實例
 * @return 一致性檢查通過返回 true
 */
bool pmm_check_consistency(pmm_manager_t* pmm);

/**
 * 獲取記憶體使用報告
 * @param pmm PMM 管理器實例
 * @param buffer 輸出緩衝區
 * @param buffer_size 緩衝區大小
 * @return 實際寫入的字節數
 */
size_t pmm_get_memory_report(pmm_manager_t* pmm, char* buffer, size_t buffer_size);

/* ========================= 輔助函數 ========================= */

/**
 * 將虛擬地址轉換為頁面框架號
 * @param virt_addr 虛擬地址
 * @return 頁面框架號
 */
static inline uint32_t pmm_virt_to_pfn(void* virt_addr) {
    return (uint32_t)((unsigned long)virt_addr / PMM_PAGE_SIZE);
}

/**
 * 將頁面框架號轉換為虛擬地址
 * @param pfn 頁面框架號
 * @return 虛擬地址
 */
static inline void* pmm_pfn_to_virt(uint32_t pfn) {
    return (void*)(unsigned long)(pfn * PMM_PAGE_SIZE);
}

/**
 * 檢查地址是否頁面對齊
 * @param addr 地址
 * @return 對齊返回 true
 */
static inline bool pmm_is_page_aligned(void* addr) {
    return ((unsigned long)addr & (PMM_PAGE_SIZE - 1)) == 0;
}

/**
 * 向上對齊到頁面邊界
 * @param size 大小
 * @return 對齊後的大小
 */
static inline size_t pmm_align_up(size_t size) {
    return (size + PMM_PAGE_SIZE - 1) & ~(PMM_PAGE_SIZE - 1);
}

/* ========================= 錯誤碼 ========================= */
#define PMM_SUCCESS         0       // 成功
#define PMM_ERROR_NOMEM    -1       // 記憶體不足
#define PMM_ERROR_INVAL    -2       // 無效參數
#define PMM_ERROR_INIT     -3       // 初始化失敗
#define PMM_ERROR_NOTINIT  -4       // 未初始化
#define PMM_ERROR_CORRUPT  -5       // 數據結構損壞

/* ========================= 分配標誌 ========================= */
#define PMM_FLAG_NORMAL    0x00     // 普通分配
#define PMM_FLAG_ZERO      0x01     // 清零記憶體
#define PMM_FLAG_ATOMIC    0x02     // 原子分配 (不可睡眠)
#define PMM_FLAG_DMA       0x04     // DMA 可用記憶體
#define PMM_FLAG_HIGH      0x08     // 高記憶體
#define PMM_FLAG_KERNEL    0x10     // 內核使用

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* STOCKOS_PMM_H */ 