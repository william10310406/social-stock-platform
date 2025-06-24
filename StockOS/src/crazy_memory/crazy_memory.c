#include "crazy_memory.h"
#include <stdlib.h>
#include <string.h>
#include "buddy_allocator.h"
#include "slab_allocator.h"

/* ------------------ 全域狀態 ------------------ */
static pthread_mutex_t cm_mutex = PTHREAD_MUTEX_INITIALIZER;
static bool cm_inited = false;
static cm_level_stats_t cm_stats[CM_LEVEL_COUNT] = {0};

extern bool slab_inited;
extern bool buddy_inited;

bool cm_init_system(void)
{
    pthread_mutex_lock(&cm_mutex);
    if (!cm_inited) {
        memset(cm_stats, 0, sizeof(cm_stats));
        cm_inited = true;
    }
    pthread_mutex_unlock(&cm_mutex);
    return true;
}

void cm_destroy_system(void)
{
    pthread_mutex_lock(&cm_mutex);
    cm_inited = false;
    pthread_mutex_unlock(&cm_mutex);
}

void* cm_alloc(size_t size, cm_level_t level)
{
    if (!cm_inited || level >= CM_LEVEL_COUNT || size == 0) return NULL;
    void* ptr = NULL;
    switch (level) {
        case CM_SHORT_TERM:
            if (!slab_inited) slab_init();
            ptr = slab_alloc(size);
            break;
        case CM_WORKING:
            if (!buddy_inited) buddy_init(1024); /* 4MB pool stub */
            ptr = buddy_alloc( (size + 4095)/4096 );
            break;
        default:
            ptr = malloc(size);
    }
    if (!ptr) return NULL;
    pthread_mutex_lock(&cm_mutex);
    cm_stats[level].alloc_count++;
    pthread_mutex_unlock(&cm_mutex);
    return ptr;
}

void cm_free(void* ptr, cm_level_t level)
{
    if (!ptr || level >= CM_LEVEL_COUNT) return;
    switch (level) {
        case CM_SHORT_TERM:
            slab_free(ptr, 0);
            break;
        case CM_WORKING:
            buddy_free(ptr, 1); /* size unknown -> assume 1 page */
            break;
        default:
            free(ptr);
    }
    pthread_mutex_lock(&cm_mutex);
    cm_stats[level].free_count++;
    pthread_mutex_unlock(&cm_mutex);
}

cm_level_stats_t cm_get_level_stats(cm_level_t level)
{
    cm_level_stats_t out = {0};
    if (level >= CM_LEVEL_COUNT) return out;
    pthread_mutex_lock(&cm_mutex);
    out = cm_stats[level];
    pthread_mutex_unlock(&cm_mutex);
    return out;
}

size_t cm_get_total_in_use(void)
{
    size_t total = 0;
    pthread_mutex_lock(&cm_mutex);
    for (int i = 0; i < CM_LEVEL_COUNT; ++i) {
        total += cm_stats[i].bytes_in_use;
    }
    pthread_mutex_unlock(&cm_mutex);
    return total;
} 