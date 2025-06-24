/* slab_allocator.h - simple fixed-size cache using buddy backend */
#ifndef STOCKOS_SLAB_ALLOCATOR_H
#define STOCKOS_SLAB_ALLOCATOR_H

#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

bool slab_init(void);
void slab_destroy(void);

void* slab_alloc(size_t size);
void  slab_free(void* ptr, size_t size);

#ifdef __cplusplus
}
#endif

#endif /* STOCKOS_SLAB_ALLOCATOR_H */ 