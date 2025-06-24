#include "slab_allocator.h"
#include "buddy_allocator.h"
#include <stdlib.h>
#include <pthread.h>

extern bool buddy_inited;

static pthread_mutex_t slab_mutex = PTHREAD_MUTEX_INITIALIZER;
bool slab_inited = false;

bool slab_init(void)
{
    slab_inited = true;
    return true;
}

void slab_destroy(void)
{
    slab_inited = false;
}

void* slab_alloc(size_t size)
{
    if (!slab_inited || size == 0 || size > 4096) return NULL;
    if (!buddy_inited) buddy_init(1024);
    return buddy_alloc(1);
}

void slab_free(void* ptr, size_t size)
{
    (void)size;
    buddy_free(ptr, 1);
} 