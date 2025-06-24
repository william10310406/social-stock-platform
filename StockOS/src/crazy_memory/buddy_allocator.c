#include "buddy_allocator.h"
#include <stdlib.h>
#include <stdio.h>
#include <pthread.h>

/* MVP stub: not real buddy algo, uses malloc on pages*4096 */
static pthread_mutex_t buddy_mutex = PTHREAD_MUTEX_INITIALIZER;
bool buddy_inited = false;

bool buddy_init(size_t total_pages)
{
    (void)total_pages;
    buddy_inited = true;
    return true;
}

void buddy_destroy(void)
{
    buddy_inited = false;
}

void* buddy_alloc(size_t pages)
{
    if (!buddy_inited || pages == 0) return NULL;
    pthread_mutex_lock(&buddy_mutex);
    void* ptr = aligned_alloc(4096, pages * 4096);
    pthread_mutex_unlock(&buddy_mutex);
    return ptr;
}

void buddy_free(void* ptr, size_t pages)
{
    (void)pages;
    free(ptr);
} 