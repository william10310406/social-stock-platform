/*
 * superconscious.h
 * StockOS Superconscious Layer – public API
 * ----------------------------------------
 * 提供超意識層（Superconscious Layer）的核心資料結構與對外操作函式。
 * 此層負責：
 *   1. 註冊超意識節點 (SuperNode)
 *   2. 管理超意識水平 (super_level)
 *   3. 觸發超越 (transcendence)
 *   4. 生成並檢索直覺資料 (intuition)
 *   5. 提供系統級統計 (overall super level)
 *
 * 執行緒安全：所有公開函式皆封裝互斥鎖，保證並發安全。
 *
 * Compile flags: -pthread
 */

#ifndef STOCKOS_SUPERCONSCIOUS_H
#define STOCKOS_SUPERCONSCIOUS_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdbool.h>
#include <stddef.h>
#include <time.h>
#include <pthread.h>

/* --------------------------- 常數定義 --------------------------- */
#define SUPER_NODE_ID_MAX      64
#define SUPER_INTUITION_MAX   1024
#define SUPER_INITIAL_CAPACITY  20

/* --------------------------- 資料結構 --------------------------- */

/* 超意識節點 */
typedef struct {
    char   node_id[SUPER_NODE_ID_MAX]; /* 節點唯一 ID */
    float  super_level;                /* 超意識水平 0.0 – 1.0 */
    char   intuition[SUPER_INTUITION_MAX]; /* 直覺資料 (JSON / TEXT) */
    bool   transcended;                /* 是否已超越 */
    time_t last_transcendence;         /* 最後超越時間 */
} SuperNode;

/* 超意識系統 */
typedef struct {
    SuperNode* nodes;      /* 動態陣列 */
    int        capacity;   /* 總容量 */
    int        count;      /* 已使用 */
    float      overall_level; /* 全域平均超意識水平 */
    time_t     created_time;
    pthread_mutex_t mutex; /* 系統鎖 */
} SuperConsciousSystem;

/* --------------------------- API --------------------------- */

/* 初始化/銷毀 */
SuperConsciousSystem* super_init_system(void);
void                  super_destroy_system(SuperConsciousSystem* sys);

/* 節點管理 */
bool super_register_node(SuperConsciousSystem* sys,
                         const char* node_id,
                         float initial_level);

/* 超越觸發 */
bool super_trigger_transcendence(SuperConsciousSystem* sys,
                                 const char* node_id);

/* 直覺檢索 */
/* query 可作關鍵字，目前回傳節點保存的 intuition (未做 NLP) */
const char* super_get_intuition(SuperConsciousSystem* sys,
                                const char* node_id,
                                const char* query);

/* 統計 */
float super_get_overall_level(SuperConsciousSystem* sys);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* STOCKOS_SUPERCONSCIOUS_H */ 