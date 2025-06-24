/*
 * pmm.c - StockOS Physical Memory Manager Implementation
 * ======================================================
 * 整合 Buddy Allocator 和 Slab Allocator 的物理記憶體管理器實現
 * 
 * 創建日期: 2025-06-24
 * 版本: 1.0
 */

#include "pmm.h"
#include <string.h>
#include <stdio.h>
#include <stdbool.h>

// External allocator state flags
extern bool buddy_inited;
extern bool slab_inited;

/* ========================= 全域變數 ========================= */
static pmm_manager_t* g_pmm = NULL;

/* ========================= 內部函數聲明 ========================= */
static int pmm_init_buddy_allocator(pmm_manager_t* pmm);
static int pmm_init_slab_allocator(pmm_manager_t* pmm);
static int pmm_init_ccms(pmm_manager_t* pmm);
static void pmm_update_stats(pmm_manager_t* pmm, size_t size, bool is_alloc);
static const char* pmm_get_level_name(cm_level_t level);

/* ========================= 主要 API 實現 ========================= */

int pmm_init(pmm_manager_t* pmm, memory_map_t* map) {
    if (!pmm || !map) {
        return PMM_ERROR_INVAL;
    }
    
    // 清零結構
    memset(pmm, 0, sizeof(pmm_manager_t));
    
    // 複製記憶體映射資訊
    pmm->memory_map = *map;
    
    // 計算總頁面數
    pmm->total_frames = (uint32_t)(map->usable_memory / PMM_PAGE_SIZE);
    pmm->free_frames = pmm->total_frames;
    
    // 設置默認配置
    pmm->config.enable_buddy = true;
    pmm->config.enable_slab = true;
    pmm->config.enable_ccms = true;
    pmm->config.min_alloc_size = 16;          // 16 bytes
    pmm->config.max_alloc_size = 4 * 1024 * 1024; // 4 MB
    
    // 初始化統計
    pmm->stats.total_frames = pmm->total_frames;
    pmm->stats.free_frames = pmm->free_frames;
    pmm->stats.used_frames = 0;
    
    // 初始化各個分配器
    int result;
    
    if (pmm->config.enable_ccms) {
        result = pmm_init_ccms(pmm);
        if (result != PMM_SUCCESS) {
            printf("PMM: CCMS initialization failed: %d\n", result);
            return result;
        }
        pmm->ccms_initialized = true;
        printf("PMM: CCMS initialized successfully\n");
    }
    
    if (pmm->config.enable_buddy) {
        result = pmm_init_buddy_allocator(pmm);
        if (result != PMM_SUCCESS) {
            printf("PMM: Buddy allocator initialization failed: %d\n", result);
            return result;
        }
        pmm->buddy_initialized = true;
        printf("PMM: Buddy allocator initialized successfully\n");
    }
    
    if (pmm->config.enable_slab) {
        result = pmm_init_slab_allocator(pmm);
        if (result != PMM_SUCCESS) {
            printf("PMM: Slab allocator initialization failed: %d\n", result);
            return result;
        }
        pmm->slab_initialized = true;
        printf("PMM: Slab allocator initialized successfully\n");
    }
    
    // 設置全域實例
    g_pmm = pmm;
    
    printf("PMM: Physical Memory Manager initialized\n");
    printf("PMM: Total memory: %zu KB (%u frames)\n", 
           map->usable_memory / 1024, pmm->total_frames);
    
    return PMM_SUCCESS;
}

void pmm_cleanup(pmm_manager_t* pmm) {
    if (!pmm) return;
    
    // 清理 CCMS
    if (pmm->ccms_initialized) {
        cm_destroy_system();
        pmm->ccms_initialized = false;
    }
    
    // 清理分配器 (Buddy 和 Slab 使用靜態數據，無需特殊清理)
    pmm->buddy_initialized = false;
    pmm->slab_initialized = false;
    
    // 清零統計
    memset(&pmm->stats, 0, sizeof(pmm_stats_t));
    
    // 清除全域引用
    if (g_pmm == pmm) {
        g_pmm = NULL;
    }
    
    printf("PMM: Physical Memory Manager cleaned up\n");
}

void* pmm_alloc_page(pmm_manager_t* pmm) {
    return pmm_alloc_pages(pmm, 1);
}

void pmm_free_page(pmm_manager_t* pmm, void* page) {
    pmm_free_pages(pmm, page, 1);
}

void* pmm_alloc_pages(pmm_manager_t* pmm, size_t count) {
    if (!pmm || !pmm->buddy_initialized || count == 0) {
        return NULL;
    }
    
    size_t total_size = count * PMM_PAGE_SIZE;
    void* ptr = buddy_alloc(total_size);
    
    if (ptr) {
        pmm_update_stats(pmm, total_size, true);
        pmm->stats.buddy_stats.buddy_allocs++;
    }
    
    return ptr;
}

void pmm_free_pages(pmm_manager_t* pmm, void* pages, size_t count) {
    if (!pmm || !pmm->buddy_initialized || !pages || count == 0) {
        return;
    }
    
    size_t total_size = count * PMM_PAGE_SIZE;
    buddy_free(pages, total_size);
    
    pmm_update_stats(pmm, total_size, false);
    pmm->stats.buddy_stats.buddy_frees++;
}

void* pmm_alloc(pmm_manager_t* pmm, size_t size, uint32_t flags) {
    if (!pmm || size == 0) {
        return NULL;
    }
    
    void* ptr = NULL;
    
    // 根據大小選擇合適的分配器
    if (size <= 512 && pmm->slab_initialized) {
        // 小對象使用 Slab 分配器
        ptr = slab_alloc(size);
        if (ptr) {
            pmm_update_stats(pmm, size, true);
            pmm->stats.slab_stats.slab_allocs++;
        }
    } else if (size >= PMM_PAGE_SIZE && pmm->buddy_initialized) {
        // 大對象使用 Buddy 分配器
        size_t num_pages = (size + PMM_PAGE_SIZE - 1) / PMM_PAGE_SIZE;
        ptr = buddy_alloc(num_pages);
        if (ptr) {
            pmm_update_stats(pmm, num_pages * PMM_PAGE_SIZE, true);
            pmm->stats.buddy_stats.buddy_allocs++;
        }
    } else if (pmm->ccms_initialized) {
        // 中等大小使用 CCMS
        cm_level_t level = CM_WORKING; // 默認使用工作記憶體
        
        // 根據大小選擇 CCMS 層級
        if (size <= 64) {
            level = CM_SHORT_TERM;
        } else if (size <= 4096) {
            level = CM_WORKING;
        } else {
            level = CM_LONG_TERM;
        }
        
        ptr = cm_alloc(size, level);
        if (ptr) {
            pmm_update_stats(pmm, size, true);
        }
    }
    
    // 如果需要清零記憶體
    if (ptr && (flags & PMM_FLAG_ZERO)) {
        memset(ptr, 0, size);
    }
    
    return ptr;
}

void pmm_free(pmm_manager_t* pmm, void* ptr, size_t size) {
    if (!pmm || !ptr || size == 0) {
        return;
    }
    
    // 根據大小選擇合適的分配器進行釋放
    if (size <= 512 && pmm->slab_initialized) {
        slab_free(ptr, size);
        pmm_update_stats(pmm, size, false);
        pmm->stats.slab_stats.slab_frees++;
    } else if (size >= PMM_PAGE_SIZE && pmm->buddy_initialized) {
        size_t num_pages = (size + PMM_PAGE_SIZE - 1) / PMM_PAGE_SIZE;
        buddy_free(ptr, num_pages);
        pmm_update_stats(pmm, num_pages * PMM_PAGE_SIZE, false);
        pmm->stats.buddy_stats.buddy_frees++;
    } else if (pmm->ccms_initialized) {
        // 對於 CCMS，我們需要猜測層級 (實際實現中應該記錄這個資訊)
        cm_level_t level = CM_WORKING;
        if (size <= 64) {
            level = CM_SHORT_TERM;
        } else if (size <= 4096) {
            level = CM_WORKING;
        } else {
            level = CM_LONG_TERM;
        }
        
        cm_free(ptr, level);
        pmm_update_stats(pmm, size, false);
    }
}

pmm_stats_t pmm_get_stats(pmm_manager_t* pmm) {
    if (!pmm) {
        pmm_stats_t empty = {0};
        return empty;
    }
    
    // 更新 CCMS 統計
    if (pmm->ccms_initialized) {
        for (int i = 0; i < CM_LEVEL_COUNT; i++) {
            cm_level_stats_t level_stats = cm_get_level_stats((cm_level_t)i);
            // 可以在這裡更新更詳細的統計資訊
        }
    }
    
    return pmm->stats;
}

void pmm_reset_stats(pmm_manager_t* pmm) {
    if (!pmm) return;
    
    // 保留基本配置，只重置計數器
    uint32_t total_frames = pmm->stats.total_frames;
    uint32_t free_frames = pmm->stats.free_frames;
    uint32_t used_frames = pmm->stats.used_frames;
    
    memset(&pmm->stats, 0, sizeof(pmm_stats_t));
    
    pmm->stats.total_frames = total_frames;
    pmm->stats.free_frames = free_frames;
    pmm->stats.used_frames = used_frames;
    
    printf("PMM: Statistics reset\n");
}

bool pmm_check_consistency(pmm_manager_t* pmm) {
    if (!pmm) return false;
    
    // 檢查基本不變量
    if (pmm->stats.total_frames < pmm->stats.used_frames + pmm->stats.free_frames) {
        printf("PMM: Consistency check failed: frame count mismatch\n");
        return false;
    }
    
    // 檢查分配器是否正常
    if (pmm->buddy_initialized || pmm->slab_initialized || pmm->ccms_initialized) {
        // 至少有一個分配器已初始化
        return true;
    }
    
    printf("PMM: Consistency check failed: no allocators initialized\n");
    return false;
}

size_t pmm_get_memory_report(pmm_manager_t* pmm, char* buffer, size_t buffer_size) {
    if (!pmm || !buffer || buffer_size == 0) {
        return 0;
    }
    
    pmm_stats_t stats = pmm_get_stats(pmm);
    size_t written = 0;
    
    written += snprintf(buffer + written, buffer_size - written,
        "StockOS Physical Memory Manager Report\n"
        "======================================\n\n");
    
    // 基本統計
    written += snprintf(buffer + written, buffer_size - written,
        "Memory Overview:\n"
        "  Total Memory: %zu KB (%u frames)\n"
        "  Used Memory:  %zu KB (%u frames)\n"
        "  Free Memory:  %zu KB (%u frames)\n"
        "  Utilization:  %.1f%%\n\n",
        (size_t)stats.total_frames * PMM_PAGE_SIZE / 1024, stats.total_frames,
        (size_t)stats.used_frames * PMM_PAGE_SIZE / 1024, stats.used_frames,
        (size_t)stats.free_frames * PMM_PAGE_SIZE / 1024, stats.free_frames,
        stats.total_frames > 0 ? (float)stats.used_frames * 100.0f / stats.total_frames : 0.0f);
    
    // 分配統計
    written += snprintf(buffer + written, buffer_size - written,
        "Allocation Statistics:\n"
        "  Total Allocations: %llu\n"
        "  Total Deallocations: %llu\n"
        "  Outstanding Allocations: %llu\n"
        "  Bytes Allocated: %llu\n\n",
        stats.alloc_count, stats.free_count,
        stats.alloc_count - stats.free_count, stats.bytes_allocated);
    
    // Buddy 統計
    if (pmm->buddy_initialized) {
        written += snprintf(buffer + written, buffer_size - written,
            "Buddy Allocator:\n"
            "  Allocations: %llu\n"
            "  Deallocations: %llu\n"
            "  Splits Performed: %llu\n"
            "  Merges Performed: %llu\n\n",
            stats.buddy_stats.buddy_allocs, stats.buddy_stats.buddy_frees,
            stats.buddy_stats.splits_performed, stats.buddy_stats.merges_performed);
    }
    
    // Slab 統計
    if (pmm->slab_initialized) {
        written += snprintf(buffer + written, buffer_size - written,
            "Slab Allocator:\n"
            "  Active Caches: %u\n"
            "  Total Objects: %u\n"
            "  Free Objects: %u\n"
            "  Allocations: %llu\n"
            "  Deallocations: %llu\n\n",
            stats.slab_stats.active_caches, stats.slab_stats.total_objects,
            stats.slab_stats.free_objects, stats.slab_stats.slab_allocs,
            stats.slab_stats.slab_frees);
    }
    
    // CCMS 統計
    if (pmm->ccms_initialized) {
        written += snprintf(buffer + written, buffer_size - written,
            "CCMS (Crazy Custom Memory System):\n");
        
        for (int i = 0; i < CM_LEVEL_COUNT; i++) {
            cm_level_stats_t level_stats = cm_get_level_stats((cm_level_t)i);
            written += snprintf(buffer + written, buffer_size - written,
                "  %s: %zu allocs, %zu frees, %zu bytes in use\n",
                pmm_get_level_name((cm_level_t)i),
                level_stats.alloc_count, level_stats.free_count,
                level_stats.bytes_in_use);
        }
        written += snprintf(buffer + written, buffer_size - written, "\n");
    }
    
    return written;
}

/* ========================= 內部函數實現 ========================= */

static int pmm_init_buddy_allocator(pmm_manager_t* pmm) {
    if (buddy_inited) return PMM_SUCCESS;
    if (!buddy_init(pmm->total_frames)) {
        return PMM_ERROR_INIT;
    }
    return PMM_SUCCESS;
}

static int pmm_init_slab_allocator(pmm_manager_t* pmm) {
    (void)pmm;
    if (slab_inited) return PMM_SUCCESS;
    if (!slab_init()) {
        return PMM_ERROR_INIT;
    }
    return PMM_SUCCESS;
}

static int pmm_init_ccms(pmm_manager_t* pmm) {
    if (!cm_init_system()) {
        return PMM_ERROR_INIT;
    }
    return PMM_SUCCESS;
}

static void pmm_update_stats(pmm_manager_t* pmm, size_t size, bool is_alloc) {
    if (!pmm) return;
    
    if (is_alloc) {
        pmm->stats.alloc_count++;
        pmm->stats.bytes_allocated += size;
        
        // 更新頁面統計 (粗略估算)
        uint32_t pages = (uint32_t)((size + PMM_PAGE_SIZE - 1) / PMM_PAGE_SIZE);
        if (pmm->stats.free_frames >= pages) {
            pmm->stats.free_frames -= pages;
            pmm->stats.used_frames += pages;
        }
    } else {
        pmm->stats.free_count++;
        if (pmm->stats.bytes_allocated >= size) {
            pmm->stats.bytes_allocated -= size;
        }
        
        // 更新頁面統計 (粗略估算)
        uint32_t pages = (uint32_t)((size + PMM_PAGE_SIZE - 1) / PMM_PAGE_SIZE);
        pmm->stats.free_frames += pages;
        if (pmm->stats.used_frames >= pages) {
            pmm->stats.used_frames -= pages;
        }
    }
}

static const char* pmm_get_level_name(cm_level_t level) {
    switch (level) {
        case CM_SHORT_TERM: return "Short-term";
        case CM_WORKING: return "Working";
        case CM_LONG_TERM: return "Long-term";
        case CM_SUBCONSCIOUS: return "Subconscious";
        case CM_COLLECTIVE: return "Collective";
        default: return "Unknown";
    }
}

/* ========================= 便利函數 ========================= */

pmm_manager_t* pmm_get_global_instance(void) {
    return g_pmm;
}

void pmm_print_summary(pmm_manager_t* pmm) {
    if (!pmm) return;
    
    pmm_stats_t stats = pmm_get_stats(pmm);
    
    printf("\n=== PMM Summary ===\n");
    printf("Total Memory: %zu KB\n", (size_t)stats.total_frames * PMM_PAGE_SIZE / 1024);
    printf("Used Memory:  %zu KB\n", (size_t)stats.used_frames * PMM_PAGE_SIZE / 1024);
    printf("Free Memory:  %zu KB\n", (size_t)stats.free_frames * PMM_PAGE_SIZE / 1024);
    printf("Allocations:  %llu\n", stats.alloc_count);
    printf("Deallocations: %llu\n", stats.free_count);
    printf("===================\n\n");
} 