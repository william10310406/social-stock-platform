/*
 * crazy_memory.h - StockOS Crazy Custom Memory System (CCMS)
 * ---------------------------------------------------------
 * MVP 0.1 – 2025-06-24
 *
 * 目標：以「短期 / 工作 / 長期 / 潛意識 / 集體」5 層記憶體模型實作高層 API。
 *       目前僅封裝 malloc/free 作為後端，後續可替換為 Buddy / Slab / 壓縮池。
 *
 * 執行緒安全：使用全域 mutex。
 */

#ifndef STOCKOS_CRAZY_MEMORY_H
#define STOCKOS_CRAZY_MEMORY_H

#include <stddef.h>
#include <stdbool.h>
#include <pthread.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ------------------------- 記憶體層級 ------------------------- */
typedef enum {
    CM_SHORT_TERM = 0,    /* 快取層 (Short-term) */
    CM_WORKING,           /* 活動頁面 (Working) */
    CM_LONG_TERM,         /* 長期 (Long-term) */
    CM_SUBCONSCIOUS,      /* 壓縮 / 潛意識 */
    CM_COLLECTIVE,        /* 共享 / 集體 */
    CM_LEVEL_COUNT
} cm_level_t;

/* ------------------------- 統計資訊 ------------------------- */
typedef struct {
    size_t alloc_count;   /* 分配次數 */
    size_t free_count;    /* 釋放次數 */
    size_t bytes_in_use;  /* 目前佔用 */
} cm_level_stats_t;

/* ------------------------- API ------------------------- */
/* 初始化 / 銷毀 (thread-safe, idempotent) */
bool cm_init_system(void);
void cm_destroy_system(void);

/* 分配 / 釋放 */
void* cm_alloc(size_t size, cm_level_t level);
void  cm_free(void* ptr, cm_level_t level);

/* 統計 */
cm_level_stats_t cm_get_level_stats(cm_level_t level);
size_t           cm_get_total_in_use(void);

#ifdef __cplusplus
} /* extern C */
#endif

#endif /* STOCKOS_CRAZY_MEMORY_H */ 