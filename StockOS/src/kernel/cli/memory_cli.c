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
#include <termios.h>
#include <unistd.h>

// 依賴 pmm.c 中的全域 getter（在 user-space 模式可用）
extern pmm_manager_t* pmm_get_global_instance(void);

static memory_cli_t g_cli;

// Simple storage for allocated pointers (demo purposes)
#define MAX_CLI_ALLOCS 64
static void* buddy_ptrs[MAX_CLI_ALLOCS];
static size_t buddy_sizes[MAX_CLI_ALLOCS];
static int buddy_count = 0;

static void* slab_ptrs[MAX_CLI_ALLOCS];
static size_t slab_sizes[MAX_CLI_ALLOCS];
static int slab_count = 0;

#define CLI_HISTORY_SIZE 64

/* ============== 顏色宏 ============== */
#define C_RESET   "\033[0m"
#define C_GREEN   "\033[32m"
#define C_CYAN    "\033[36m"
#define C_YELLOW  "\033[33m"

/* ============== Raw mode helpers ============== */
static struct termios orig_termios;

static void disable_raw_mode(void) { tcsetattr(STDIN_FILENO, TCSAFLUSH, &orig_termios); }

static void enable_raw_mode(void) {
    tcgetattr(STDIN_FILENO, &orig_termios);
    atexit(disable_raw_mode);
    struct termios raw = orig_termios;
    raw.c_lflag &= ~(ECHO | ICANON);
    raw.c_cc[VMIN] = 1;
    raw.c_cc[VTIME] = 0;
    tcsetattr(STDIN_FILENO, TCSAFLUSH, &raw);
}

/* 指令清單供補全 */
static const char* k_commands[] = {
    "meminfo", "buddy", "slab", "history", "help", "exit",
    "buddy stat", "buddy alloc", "buddy free",
    "slab stat", "slab alloc", "slab free", NULL};

static void redraw_line(const char* buf, int len, int cursor);

static void clear_line(void) { printf("\r\33[K"); }

/* ------------------ 輔助工具 ------------------ */
static void trim_newline(char* str) {
    size_t len = strlen(str);
    if (len && (str[len-1]=='\n' || str[len-1]=='\r')) str[len-1]='\0';
}

static void cli_print_prompt(void) {
    printf(C_GREEN "StockOS> " C_RESET);
    fflush(stdout);
}

/* ------------------ 歷史操作 ------------------ */
static void history_add(const char* line) {
    if (!line || !*line) return;
    int idx = g_cli.history_count % CLI_HISTORY_SIZE;
    strncpy(g_cli.history[idx], line, CLI_BUFFER_SIZE-1);
    g_cli.history[idx][CLI_BUFFER_SIZE-1]='\0';
    g_cli.history_count++;
}

static void history_print(void) {
    int count = g_cli.history_count > CLI_HISTORY_SIZE ? CLI_HISTORY_SIZE : g_cli.history_count;
    for (int i = 0; i < count; i++) {
        int real_idx = (g_cli.history_count - count + i) % CLI_HISTORY_SIZE;
        printf("%2d: %s\n", i, g_cli.history[real_idx]);
    }
}

int cli_cmd_history(int argc, char** argv) {
    if (argc >=2 && strcmp(argv[1], "clear")==0) {
        memset(g_cli.history, 0, sizeof(g_cli.history));
        g_cli.history_count = 0;
        printf("History cleared.\n");
        return 0;
    }
    history_print();
    return 0;
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
    if (argc < 2) {
        printf("Usage: buddy <stat|alloc|free> ...\n");
        return -1;
    }
    pmm_manager_t* pmm = pmm_get_global_instance();
    if (!pmm) { printf("[ERROR] PMM not initialized\n"); return -1; }

    if (strcmp(argv[1], "stat")==0) {
        pmm_stats_t stats = pmm_get_stats(pmm);
        print_buddy_stats(&stats);
    } else if (strcmp(argv[1], "alloc")==0) {
        if (argc < 3) { printf("Usage: buddy alloc <pages>\n"); return -1; }
        size_t pages = (size_t)strtoul(argv[2], NULL, 0);
        if (pages==0) { printf("Invalid pages\n"); return -1; }
        if (buddy_count>=MAX_CLI_ALLOCS) { printf("Store full\n"); return -1; }
        void* ptr = pmm_alloc(pmm, pages*PMM_PAGE_SIZE, PMM_FLAG_NORMAL);
        if (!ptr) { printf("Allocation failed\n"); return -1; }
        buddy_ptrs[buddy_count] = ptr;
        buddy_sizes[buddy_count] = pages*PMM_PAGE_SIZE;
        printf("Buddy alloc idx=%d addr=%p size=%zu bytes\n", buddy_count, ptr, pages*PMM_PAGE_SIZE);
        buddy_count++;
    } else if (strcmp(argv[1], "free")==0) {
        if (argc < 3) { printf("Usage: buddy free <idx>\n"); return -1; }
        int idx = atoi(argv[2]);
        if (idx<0 || idx>=buddy_count || !buddy_ptrs[idx]) { printf("Invalid idx\n"); return -1; }
        pmm_free(pmm, buddy_ptrs[idx], buddy_sizes[idx]);
        printf("Buddy free idx=%d success\n", idx);
        buddy_ptrs[idx]=NULL;
    } else {
        printf("Unknown subcommand.\n");
        return -1;
    }
    return 0;
}

static void print_slab_stats(pmm_stats_t* stats) {
    printf("Slab Allocator Stats:\n");
    printf("  Allocations   : %llu\n", stats->slab_stats.slab_allocs);
    printf("  Deallocations : %llu\n", stats->slab_stats.slab_frees);
    printf("  Free Objects  : %u\n", stats->slab_stats.free_objects);
}

int cli_cmd_slab(int argc, char** argv) {
    if (argc < 2) { printf("Usage: slab <stat|alloc|free> ...\n"); return -1; }
    pmm_manager_t* pmm = pmm_get_global_instance();
    if (!pmm) { printf("[ERROR] PMM not initialized\n"); return -1; }

    if (strcmp(argv[1], "stat")==0) {
        pmm_stats_t stats = pmm_get_stats(pmm);
        print_slab_stats(&stats);
    } else if (strcmp(argv[1], "alloc")==0) {
        if (argc<3) { printf("Usage: slab alloc <bytes>\n"); return -1; }
        size_t bytes = (size_t)strtoul(argv[2],NULL,0);
        if (bytes==0) { printf("Invalid size\n"); return -1; }
        if (slab_count>=MAX_CLI_ALLOCS) { printf("Store full\n"); return -1; }
        void* ptr = pmm_alloc(pmm, bytes, PMM_FLAG_NORMAL);
        if (!ptr) { printf("Allocation failed\n"); return -1; }
        slab_ptrs[slab_count]=ptr;
        slab_sizes[slab_count]=bytes;
        printf("Slab alloc idx=%d addr=%p size=%zu\n", slab_count, ptr, bytes);
        slab_count++;
    } else if (strcmp(argv[1], "free")==0) {
        if (argc<3){printf("Usage: slab free <idx>\n");return -1;}
        int idx=atoi(argv[2]);
        if (idx<0||idx>=slab_count||!slab_ptrs[idx]){printf("Invalid idx\n");return -1;}
        pmm_free(pmm, slab_ptrs[idx], slab_sizes[idx]);
        printf("Slab free idx=%d success\n", idx);
        slab_ptrs[idx]=NULL;
    } else {
        printf("Unknown subcommand.\n");
        return -1;
    }
    return 0;
}

/* ------------------ 簡單解析/執行 ------------------ */
static int dispatch_command(int argc, char** argv) {
    if (argc==0) return 0;
    if (strcmp(argv[0], "meminfo")==0) return cli_cmd_meminfo(argc, argv);
    if (strcmp(argv[0], "buddy")==0)   return cli_cmd_buddy(argc, argv);
    if (strcmp(argv[0], "slab")==0)    return cli_cmd_slab(argc, argv);
    if (strcmp(argv[0], "help")==0) {
        printf(C_CYAN "Available commands:" C_RESET "\n");
        printf("  meminfo\n  buddy stat|alloc <pages>|free <idx>\n  slab stat|alloc <bytes>|free <idx>\n  history [clear]\n  exit\n");
        return 0;
    }
    if (strcmp(argv[0], "history")==0) return cli_cmd_history(argc, argv);
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
    enable_raw_mode();
    char buffer[CLI_BUFFER_SIZE];
    int len = 0;
    int cursor = 0; // 游標位置 (0..len)
    int hist_index = 0;
    cli_print_prompt();
    while (1) {
        char c;
        if (read(STDIN_FILENO, &c, 1)!=1) continue;
        if (c == '\n' || c=='\r') {
            buffer[len]='\0';
            printf("\n");
            // parse
            char tmp[CLI_BUFFER_SIZE];
            strncpy(tmp, buffer, sizeof(tmp));
            char* argv[CLI_MAX_ARGS]; int argc=0; char* tok=strtok(tmp," \t");
            while(tok&&argc<CLI_MAX_ARGS){argv[argc++]=tok;tok=strtok(NULL," \t");}
            int ret = dispatch_command(argc, argv);
            history_add(buffer);
            if(ret==1) break;
            len=0; cursor=0; hist_index=g_cli.history_count; buffer[0]='\0';
            cli_print_prompt();
        } else if (c==127 || c==8) { // Backspace
            if (cursor>0) {
                memmove(buffer + cursor -1, buffer + cursor, len - cursor);
                len--; cursor--;
                redraw_line(buffer,len,cursor);
            }
        } else if (c==9) { // Tab completion
            buffer[len]='\0';
            const char* matches[32]; int count=0;
            for(int i=0;k_commands[i] && count<32;i++) {
                if (strncmp(buffer,k_commands[i],len)==0) { matches[count++]=k_commands[i]; }
            }
            if(count==0) {
                write(STDOUT_FILENO, "\a", 1); // bell
            } else if (count==1) {
                strcpy(buffer, matches[0]);
                len=strlen(buffer);
                cursor=len;
                redraw_line(buffer,len,cursor);
            } else {
                printf("\n");
                for(int i=0;i<count;i++) printf("%s\t", matches[i]);
                printf("\n");
                redraw_line(buffer,len,cursor);
            }
        } else if (c==27) { // Escape sequences for arrows
            char seq[2]; if (read(STDIN_FILENO, seq,2)!=2) continue;
            if (seq[0]=='[') {
                if (seq[1]=='A') { // Up
                    if (g_cli.history_count==0) continue;
                    if (hist_index==0) continue; hist_index--; strcpy(buffer,g_cli.history[hist_index%CLI_HISTORY_SIZE]); len=strlen(buffer); cursor=len;
                    redraw_line(buffer,len,cursor);
                } else if (seq[1]=='B') { // Down
                    if (hist_index<g_cli.history_count-1) hist_index++; else { len=0; buffer[0]='\0'; cursor=0; }
                    if(hist_index<g_cli.history_count) { strcpy(buffer,g_cli.history[hist_index%CLI_HISTORY_SIZE]); len=strlen(buffer); cursor=len; }
                    redraw_line(buffer,len,cursor);
                } else if (seq[1]=='C') { // Right
                    if (cursor < len) { cursor++; write(STDOUT_FILENO, "\x1b[C", 3); }
                } else if (seq[1]=='D') { // Left
                    if (cursor > 0) { cursor--; write(STDOUT_FILENO, "\x1b[D", 3); }
                } else if (seq[1]=='3') { // Delete (ESC[3~)
                    char tilde; if (read(STDIN_FILENO,&tilde,1)!=1 || tilde!='~') continue;
                    if (cursor < len) {
                        memmove(buffer + cursor, buffer + cursor + 1, len - cursor - 1);
                        len--; redraw_line(buffer,len,cursor);
                    }
                }
            }
        } else if (isprint((unsigned char)c) && len<CLI_BUFFER_SIZE-1) {
            if (cursor==len) {
                buffer[len++]=c; buffer[len]='\0'; cursor++; write(STDOUT_FILENO,&c,1);
            } else {
                memmove(buffer + cursor +1, buffer + cursor, len - cursor);
                buffer[cursor]=c; len++; cursor++;
                redraw_line(buffer,len,cursor);
            }
        }
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
    int result = dispatch_command(argc, argv);
    history_add(command_line);
    return result;
}

static void redraw_line(const char* buf, int len, int cursor) {
    clear_line();
    cli_print_prompt();
    if (len>0) write(STDOUT_FILENO, buf, len);
    /* Move cursor back if needed */
    int diff = len - cursor;
    if (diff > 0) {
        char seq[16];
        snprintf(seq, sizeof(seq), "\x1b[%dD", diff);
        write(STDOUT_FILENO, seq, strlen(seq));
    }
    fflush(stdout);
} 