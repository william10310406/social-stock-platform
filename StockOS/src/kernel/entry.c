#include "memory/pmm.h"
#include "cli/memory_cli.h"
#include <stdio.h>

int main(void) {
    // Initialize a user-space PMM instance (16 MB)
    static pmm_manager_t pmm;
    memory_map_t map = {0};
    map.usable_memory = 16 * 1024 * 1024;
    map.total_memory  = map.usable_memory;
    if (pmm_init(&pmm, &map) != 0) {
        fprintf(stderr, "Failed to init PMM\n");
        return 1;
    }

    memory_cli_init();
    printf("StockOS Memory CLI (user-space) – type 'help', 'exit' to quit\n");
    memory_cli_main_loop();

    pmm_cleanup(&pmm);
    return 0;
} 