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
#include <locale.h>

// 依賴 pmm.c 中的全域 getter（在 user-space 模式可用）
extern pmm_manager_t* pmm_get_global_instance(void);

static memory_cli_t g_cli;

// 啟動時的工作目錄，作為 CLI 根目錄
static char g_base_dir[512] = "";

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
    // 英文指令
    "meminfo", "buddy", "slab", "cat", "ls", "mkdir", "cd", "pwd", "edit", "history", "help", "exit",
    "buddy stat", "buddy alloc", "buddy free",
    "slab stat", "slab alloc", "slab free",
    // 中文別名
    "記憶體資訊", "夥伴", "區塊",
    "夥伴 狀態", "夥伴 配置", "夥伴 釋放",
    "區塊 狀態", "區塊 配置", "區塊 釋放", NULL};

static void redraw_line(const char* buf, int len, int cursor);

static void clear_line(void) { printf("\r\33[K"); }

/* ------------------ 輔助工具 ------------------ */
static void trim_newline(char* str) {
    size_t len = strlen(str);
    if (len && (str[len-1]=='\n' || str[len-1]=='\r')) str[len-1]='\0';
}

static void cli_print_prompt(void) {
    char cwd[512];
    if (getcwd(cwd, sizeof(cwd)) == NULL) {
        strncpy(cwd, "?", sizeof(cwd));
        cwd[sizeof(cwd)-1] = '\0';
    }

    const char* rel = cwd;
    size_t base_len = strlen(g_base_dir);
    if (base_len > 0 && strncmp(cwd, g_base_dir, base_len) == 0) {
        rel = cwd + base_len;
        if (*rel == '/') rel++;          // remove leading '/'
        if (*rel == '\0') rel = "/";   // show root when at base
    }

    printf(C_GREEN "StockOS" C_RESET ":" C_CYAN "%s" C_RESET "> ", rel);
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

    // 中文別名對應
    const char* sub = argv[1];
    if (strcmp(sub, "stat")==0 || strcmp(sub, "狀態")==0) {
        pmm_stats_t stats = pmm_get_stats(pmm);
        print_buddy_stats(&stats);
    } else if (strcmp(sub, "alloc")==0 || strcmp(sub, "配置")==0) {
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
    } else if (strcmp(sub, "free")==0 || strcmp(sub, "釋放")==0) {
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

    // 中文別名對應
    const char* sub2 = argv[1];
    if (strcmp(sub2, "stat")==0 || strcmp(sub2, "狀態")==0) {
        pmm_stats_t stats = pmm_get_stats(pmm);
        print_slab_stats(&stats);
    } else if (strcmp(sub2, "alloc")==0 || strcmp(sub2, "配置")==0) {
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
    } else if (strcmp(sub2, "free")==0 || strcmp(sub2, "釋放")==0) {
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

// ------------------ 指令：cat ------------------
int cli_cmd_cat(int argc, char** argv) {
    if (argc < 2) {
        printf("Usage: cat <filename>\n");
        return -1;
    }
    const char* filename = argv[1];
    char cmd[512];
    snprintf(cmd, sizeof(cmd), "cat %s", filename);

    disable_raw_mode();
    int ret = system(cmd);
    enable_raw_mode();
    printf("\n");
    (void)ret;
    return 0;
}

// ------------------ 指令：ls ------------------
int cli_cmd_ls(int argc, char** argv) {
    char cmd[512];
    if (argc < 2) {
        snprintf(cmd, sizeof(cmd), "ls -al --color=auto");
    } else {
        snprintf(cmd, sizeof(cmd), "ls -al --color=auto %s", argv[1]);
    }

    disable_raw_mode();
    int ret = system(cmd);
    enable_raw_mode();
    printf("\n");
    (void)ret;
    return 0;
}

// ------------------ 指令：mkdir ------------------
int cli_cmd_mkdir(int argc, char** argv) {
    if (argc < 2) {
        printf("Usage: mkdir <path> [more_paths...]\n");
        return -1;
    }

    disable_raw_mode();
    for (int i = 1; i < argc; i++) {
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "mkdir -p -- '%s'", argv[i]);
        int ret = system(cmd);
        if (ret != 0) {
            printf("Failed to create %s\n", argv[i]);
        }
    }
    enable_raw_mode();
    printf("\n");
    return 0;
}

// ------------------ 指令：cd ------------------
int cli_cmd_cd(int argc, char** argv) {
    if (argc < 2) {
        char cwd[512];
        if (getcwd(cwd, sizeof(cwd))) {
            printf("Current directory: %s\n", cwd);
        } else {
            perror("getcwd");
        }
        return 0;
    }

    if (chdir(argv[1]) != 0) {
        perror("chdir");
        return -1;
    }
    return 0;
}

// ------------------ 指令：pwd ------------------
int cli_cmd_pwd(int argc, char** argv) {
    (void)argc; (void)argv;
    char cwd[512];
    if (getcwd(cwd, sizeof(cwd))) {
        printf("%s\n", cwd);
    } else {
        perror("getcwd");
        return -1;
    }
    return 0;
}

// --------------- 指令：help ---------------
int cli_cmd_help(int argc, char** argv) {
    (void)argc; (void)argv;
    printf(C_CYAN "可用指令與說明：" C_RESET "\n\n");
    printf("meminfo / 記憶體資訊    - 顯示整體記憶體統計\n");
    printf("buddy / 夥伴 stat|狀態  - 顯示 Buddy 分配器統計\n");
    printf("buddy / 夥伴 alloc|配置 <頁數> - 分配 <頁數>×4KiB 記憶體\n");
    printf("buddy / 夥伴 free|釋放 <索引>  - 釋放先前 buddy alloc\n");
    printf("slab / 區塊 stat|狀態   - 顯示 Slab 分配器統計\n");
    printf("slab / 區塊 alloc|配置 <大小> - 分配 <大小> 位元組記憶體\n");
    printf("slab / 區塊 free|釋放 <索引>   - 釋放先前 slab alloc\n");
    printf("cat <檔名>             - 顯示檔案內容\n");
    printf("ls [路徑]              - 列出檔案/目錄\n");
    printf("mkdir <路徑>           - 建立新目錄 (可多個)\n");
    printf("cd [路徑]              - 切換/顯示目前目錄\n");
    printf("pwd                    - 顯示目前工作目錄\n");
    printf("edit <檔名>            - 使用內建編輯器\n");
    printf("history                - 列出歷史指令\n");
    printf("history clear          - 清除歷史記錄\n");
    printf("exit                   - 離開 CLI\n");
    return 0;
}

/* ------------------ 簡單解析/執行 ------------------ */
static int dispatch_command(int argc, char** argv) {
    if (argc==0) return 0;
    if (strcmp(argv[0], "meminfo")==0 || strcmp(argv[0], "記憶體資訊")==0) return cli_cmd_meminfo(argc, argv);
    if (strcmp(argv[0], "buddy")==0 || strcmp(argv[0], "夥伴")==0)   return cli_cmd_buddy(argc, argv);
    if (strcmp(argv[0], "slab")==0 || strcmp(argv[0], "區塊")==0)    return cli_cmd_slab(argc, argv);
    if (strcmp(argv[0], "cat")==0 || strcmp(argv[0], "查看")==0)     return cli_cmd_cat(argc, argv);
    if (strcmp(argv[0], "ls")==0 || strcmp(argv[0], "列表")==0)      return cli_cmd_ls(argc, argv);
    if (strcmp(argv[0], "mkdir")==0 || strcmp(argv[0], "建立目錄")==0 || strcmp(argv[0], "創建目錄")==0) return cli_cmd_mkdir(argc, argv);
    if (strcmp(argv[0], "cd")==0 || strcmp(argv[0], "切換目錄")==0) return cli_cmd_cd(argc, argv);
    if (strcmp(argv[0], "pwd")==0 || strcmp(argv[0], "當前目錄")==0) return cli_cmd_pwd(argc, argv);
    if (strcmp(argv[0], "edit")==0 || strcmp(argv[0], "編輯")==0) {
        const char* filename = (argc>=2) ? argv[1] : "untitled.txt";
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "./build/kilo %s", filename);

        /* Temporarily exit raw mode so the external editor can manage the terminal */
        disable_raw_mode();
        int ret = system(cmd);
        /* Clear screen and return cursor to top-left */
        printf("\x1b[2J\x1b[H");
        enable_raw_mode();
        printf("\n"); /* move to next line after editor exits */

        (void)ret;
        return 0;
    }
    if (strcmp(argv[0], "help")==0) return cli_cmd_help(argc, argv);
    if (strcmp(argv[0], "history")==0) return cli_cmd_history(argc, argv);
    if (strcmp(argv[0], "exit")==0) return 1; // signal to exit loop

    printf("Unknown command. Type 'help'.\n");
    return 0;
}

int memory_cli_init(void) {
    memset(&g_cli, 0, sizeof(g_cli));
    g_cli.initialized = true;

    // 記錄啟動時的工作目錄作為根目錄
    if (!getcwd(g_base_dir, sizeof(g_base_dir))) {
        g_base_dir[0] = '\0';
    }
    return 0;
}

void memory_cli_cleanup(void) {
    // nothing yet
}

void memory_cli_main_loop(void) {
    /* 啟用當前環境的 UTF-8 locale，讓 isprint 針對中文也可正確判定。*/
    setlocale(LC_CTYPE, "");

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
        } else if (((unsigned char)c >= 0x20 && c != 0x7F) && len<CLI_BUFFER_SIZE-1) {
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