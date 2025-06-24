/*
 * buddy_allocator.h - Simple buddy allocator for StockOS Crazy Memory
 * ---------------------------------------------------------------
 * MVP version: limited to power-of-two page orders, 4 KiB page.
 */

#ifndef STOCKOS_BUDDY_ALLOCATOR_H
#define STOCKOS_BUDDY_ALLOCATOR_H

#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

bool buddy_init(size_t total_pages); /* allocate bitmap + page array */
void buddy_destroy(void);

void* buddy_alloc(size_t pages);     /* pages: power-of-two */
void  buddy_free(void* ptr, size_t pages);

#ifdef __cplusplus
}
#endif

#endif /* STOCKOS_BUDDY_ALLOCATOR_H */ 