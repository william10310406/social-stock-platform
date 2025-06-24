/*
 * buddy_allocator.c – Basic buddy allocator implementation (MVP)
 * Page size: 4 KiB, MAX_PAGES 4096 (16 MiB). Supports power-of-two page blocks.
 */

#include "buddy_allocator.h"
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <stdint.h>
#include <stdio.h>

#define PAGE_SIZE   4096UL
#define ORDER_MAX   12               /* 2^12 pages = 16 MiB */
#define MAX_PAGES   (1UL << ORDER_MAX)

/* ---------------- 全域狀態 ---------------- */
void *base_mem = NULL;         /* 起始位址 */
size_t total_pages = 0;        /* 真正可用頁數 (<= MAX_PAGES) */

/* 元資料陣列 – 僅在區塊首頁有效 */
static uint8_t  block_order[MAX_PAGES]; /* 頁框所屬 order */
static uint8_t  block_free [MAX_PAGES]; /* 0 = used, 1 = free  */

/* 單向鏈表：free_list_head[o] = index of first free block 或 0xFFFF */
static uint16_t free_list_head[ORDER_MAX + 1];
static uint16_t next_free[MAX_PAGES];

pthread_mutex_t buddy_mutex = PTHREAD_MUTEX_INITIALIZER;
bool buddy_inited = false;

#define INVALID 0xFFFF

/* ------------- 內部工具 ------------- */
static inline size_t buddy_of(size_t idx, int order)
{
    return idx ^ (1UL << order);
}

static void push_free(size_t idx, int order)
{
    next_free[idx] = free_list_head[order];
    free_list_head[order] = (uint16_t)idx;
    block_order[idx] = (uint8_t)order;
    block_free [idx] = 1;
}

static size_t pop_free(int order)
{
    uint16_t idx = free_list_head[order];
    if (idx == INVALID) return INVALID;
    free_list_head[order] = next_free[idx];
    block_free[idx] = 0;
    return idx;
}

/* ------------- API ------------------ */
bool buddy_init(size_t pages)
{
    pthread_mutex_lock(&buddy_mutex);
    if (buddy_inited) { pthread_mutex_unlock(&buddy_mutex); return true; }
    if (pages == 0 || pages > MAX_PAGES) { pthread_mutex_unlock(&buddy_mutex); return false; }
    /* base memory */
    base_mem = aligned_alloc(PAGE_SIZE, pages * PAGE_SIZE);
    if (!base_mem) { pthread_mutex_unlock(&buddy_mutex); return false; }
    total_pages = pages;
    memset(block_order, 0, sizeof(block_order));
    memset(block_free,  0, sizeof(block_free));
    for (int i=0;i<=ORDER_MAX;i++) free_list_head[i]=INVALID;

    /* 將整段記憶體按照最大可能 order 插入 free list */
    size_t idx = 0;
    size_t remaining = pages;
    while (remaining) {
        int order = 0;
        while (((1UL << (order+1)) <= remaining) && (order+1)<=ORDER_MAX) order++;
        push_free(idx, order);
        idx += (1UL << order);
        remaining -= (1UL << order);
    }
    buddy_inited = true;
    pthread_mutex_unlock(&buddy_mutex);
    return true;
}

void buddy_destroy(void)
{
    pthread_mutex_lock(&buddy_mutex);
    if (base_mem) free(base_mem);
    base_mem = NULL;
    buddy_inited = false;
    pthread_mutex_unlock(&buddy_mutex);
}

void* buddy_alloc(size_t pages)
{
    if (!buddy_inited || pages==0 || pages>total_pages) return NULL;
    pthread_mutex_lock(&buddy_mutex);
    /* 找最小符合需求的 order */
    int order = 0;
    while ((1UL<<order) < pages) order++;
    int o;
    for (o=order; o<=ORDER_MAX; o++) if (free_list_head[o]!=INVALID) break;
    if (o>ORDER_MAX) { pthread_mutex_unlock(&buddy_mutex); return NULL; }

    size_t idx = pop_free(o);
    /* 不斷 split 直到達到目標 order */
    while (o > order) {
        o--;
        size_t buddy_idx = idx ^ (1UL<<o);
        push_free(buddy_idx, o);
    }
    pthread_mutex_unlock(&buddy_mutex);
    return (char*)base_mem + idx*PAGE_SIZE;
}

void buddy_free(void* ptr, size_t pages_unused)
{
    if (!ptr || !buddy_inited) return;
    size_t idx = ((uintptr_t)ptr - (uintptr_t)base_mem)/PAGE_SIZE;
    pthread_mutex_lock(&buddy_mutex);
    int order = block_order[idx];
    while (order < ORDER_MAX) {
        size_t bud = buddy_of(idx, order);
        if (bud >= total_pages || !block_free[bud] || block_order[bud]!=order) break;
        /* 從 free list 移除 bud */
        /* 線性搜尋移除，因 MVP 頁數不大 */
        uint16_t *cur = &free_list_head[order];
        while (*cur != INVALID) {
            if (*cur == bud) { *cur = next_free[bud]; break; }
            cur = &next_free[*cur];
        }
        block_free[bud]=0;
        idx = (idx<bud)?idx:bud;
        order++;
    }
    push_free(idx, order);
    pthread_mutex_unlock(&buddy_mutex);
} 