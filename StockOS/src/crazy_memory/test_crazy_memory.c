#include "crazy_memory.h"
#include <assert.h>
#include <stdio.h>

int main(void)
{
    assert(cm_init_system());

    /* Allocate in different levels */
    void* a = cm_alloc(128, CM_SHORT_TERM);
    void* b = cm_alloc(256, CM_WORKING);
    assert(a && b);

    cm_level_stats_t s1 = cm_get_level_stats(CM_SHORT_TERM);
    cm_level_stats_t s2 = cm_get_level_stats(CM_WORKING);
    assert(s1.alloc_count == 1);
    assert(s2.alloc_count == 1);

    cm_free(a, CM_SHORT_TERM);
    cm_free(b, CM_WORKING);

    s1 = cm_get_level_stats(CM_SHORT_TERM);
    assert(s1.free_count == 1);

    size_t total = cm_get_total_in_use();
    printf("Total bytes in use: %zu\n", total);

    cm_destroy_system();
    printf("Crazy memory tests passed!\n");
    return 0;
} 