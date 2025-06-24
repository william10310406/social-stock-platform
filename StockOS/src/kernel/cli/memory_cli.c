/*
 * memory_cli.c - Minimal Memory CLI for StockOS
 * ============================================
 * 提供三條指令：meminfo, buddy stat, slab stat。
 * 僅用於開發測試階段，可在 user-space kernel 執行。
 */
#include "memory_cli.h"
#include "../memory/pmm.h"
#include "../../crazy_memory/buddy_allocator.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

// 依賴 pmm.c 中的全域 getter（在 user-space 模式可用）
extern pmm_manager_t* pmm_get_global_instance(void);

static memory_cli_t g_cli;

/* ------------------ 輔助工具 ------------------ */
static void trim_newline(char* str) {
    size_t len = strlen(str);
    if (len && (str[len-1]=='\n' || str[len-1]=='\r')) str[len-1]='\0';
}

static void cli_print_prompt(void) {
    printf("StockOS> ");
    fflush(stdout);
}

/* ------------------ 指令實作 ------------------ */
int cli_cmd_meminfo(int argc, char** argv) {
    (void)argc; (void)argv;
    pmm_manager_t* pmm = pmm_get_global_instance();
    if (!pmm) { printf("[ERROR] PMM not initialized\n"); return -1; }
    char buf[2048];
    size_t n = pmm_get_memory_report(pmm, buf, sizeof(buf));
    fwrite(buf, 1, n, stdout);
    return 0;
}

static void print_buddy_stats(pmm_stats_t* stats) {
    printf("Buddy Allocator Stats:\n");
    printf("  Allocations : %llu\n", stats->buddy_stats.buddy_allocs);
    printf("  Deallocs    : %llu\n", stats->buddy_stats.buddy_frees);
    printf("  Splits      : %llu\n", stats->buddy_stats.splits_performed);
    printf("  Merges      : %llu\n", stats->buddy_stats.merges_performed);
}

int cli_cmd_buddy(int argc, char** argv) {
    if (argc < 2 || strcmp(argv[1], "stat")!=0) {
        printf("Usage: buddy stat\n");
        return -1;
    }
    pmm_manager_t* pmm = pmm_get_global_instance();
    if (!pmm) { printf("[ERROR] PMM not initialized\n"); return -1; }
    pmm_stats_t stats = pmm_get_stats(pmm);
    print_buddy_stats(&stats);
    return 0;
}

static void print_slab_stats(pmm_stats_t* stats) {
    printf("Slab Allocator Stats:\n");
    printf("  Allocations   : %llu\n", stats->slab_stats.slab_allocs);
    printf("  Deallocations : %llu\n", stats->slab_stats.slab_frees);
    printf("  Free Objects  : %u\n", stats->slab_stats.free_objects);
}

int cli_cmd_slab(int argc, char** argv) {
    if (argc < 2 || strcmp(argv[1], "stat")!=0) {
        printf("Usage: slab stat\n");
        return -1;
    }
    pmm_manager_t* pmm = pmm_get_global_instance();
    if (!pmm) { printf("[ERROR] PMM not initialized\n"); return -1; }
    pmm_stats_t stats = pmm_get_stats(pmm);
    print_slab_stats(&stats);
    return 0;
}

/* ------------------ 簡單解析/執行 ------------------ */
static int dispatch_command(int argc, char** argv) {
    if (argc==0) return 0;
    if (strcmp(argv[0], "meminfo")==0) return cli_cmd_meminfo(argc, argv);
    if (strcmp(argv[0], "buddy")==0)   return cli_cmd_buddy(argc, argv);
    if (strcmp(argv[0], "slab")==0)    return cli_cmd_slab(argc, argv);
    if (strcmp(argv[0], "help")==0) {
        printf("Available commands:\n  meminfo\n  buddy stat\n  slab stat\n  exit\n");
        return 0;
    }
    if (strcmp(argv[0], "exit")==0) return 1; // signal to exit loop
    printf("Unknown command. Type 'help'.\n");
    return 0;
}

int memory_cli_init(void) {
    memset(&g_cli, 0, sizeof(g_cli));
    g_cli.initialized = true;
    return 0;
}

void memory_cli_cleanup(void) {
    // nothing yet
}

void memory_cli_main_loop(void) {
    char line[CLI_BUFFER_SIZE];
    while (fgets(line, sizeof(line), stdin)) {
        trim_newline(line);
        // tokenize
        char* argv[CLI_MAX_ARGS];
        int argc = 0;
        char* token = strtok(line, " \t");
        while (token && argc < CLI_MAX_ARGS) {
            argv[argc++] = token;
            token = strtok(NULL, " \t");
        }
        int ret = dispatch_command(argc, argv);
        if (ret==1) break; // exit
        cli_print_prompt();
    }
}

int memory_cli_execute_command(const char* command_line) {
    if (!command_line) return -1;
    char tmp[CLI_BUFFER_SIZE];
    strncpy(tmp, command_line, sizeof(tmp)-1);
    tmp[sizeof(tmp)-1]='\0';
    trim_newline(tmp);
    char* argv[CLI_MAX_ARGS];
    int argc = 0;
    char* token = strtok(tmp, " \t");
    while (token && argc < CLI_MAX_ARGS) {
        argv[argc++] = token;
        token = strtok(NULL, " \t");
    }
    return dispatch_command(argc, argv);
} 