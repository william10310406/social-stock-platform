// StockOS Kernel Header
// 基於 Stock Insight Platform 的模組化設計

#ifndef KERNEL_H
#define KERNEL_H

// 基本類型定義
typedef unsigned char uint8_t;
typedef unsigned short uint16_t;
typedef unsigned int uint32_t;
typedef unsigned long long uint64_t;

// 函數聲明
void kernel_main(void);
void kernel_loop(void);
void clear_screen(void);
void print(const char* str);
void scroll_screen(void);

// 中斷和系統調用處理
void handle_interrupts(void);
void schedule(void);
void handle_syscalls(void);

// 引入新的記憶體管理系統
#include "memory/pmm.h"
#include "syscalls/memory_syscalls.h"
#include "cli/memory_cli.h"

// 服務初始化函數
void memory_init(void);
void memory_cleanup(void);
void process_init(void);
void process_cleanup(void);
void fs_init(void);
void fs_cleanup(void);
void network_init(void);
void network_cleanup(void);
void drivers_init(void);
void drivers_cleanup(void);

// 新增記憶體管理服務
int pmm_service_init(void);
void pmm_service_cleanup(void);
int memory_syscalls_service_init(void);
void memory_syscalls_service_cleanup(void);
int memory_cli_service_init(void);
void memory_cli_service_cleanup(void);

// CLI 相關
void kernel_enter_cli_mode(void);
void kernel_handle_cli_command(const char* command);

// 記憶體管理相關
#define PAGE_SIZE 4096
#define KERNEL_START 0x100000
#define KERNEL_END 0x200000

// 顯示相關
#define VIDEO_MEMORY 0xB8000
#define SCREEN_WIDTH 80
#define SCREEN_HEIGHT 25

// 顏色定義
#define COLOR_BLACK 0x0
#define COLOR_BLUE 0x1
#define COLOR_GREEN 0x2
#define COLOR_CYAN 0x3
#define COLOR_RED 0x4
#define COLOR_MAGENTA 0x5
#define COLOR_BROWN 0x6
#define COLOR_LIGHT_GRAY 0x7
#define COLOR_DARK_GRAY 0x8
#define COLOR_LIGHT_BLUE 0x9
#define COLOR_LIGHT_GREEN 0xA
#define COLOR_LIGHT_CYAN 0xB
#define COLOR_LIGHT_RED 0xC
#define COLOR_LIGHT_MAGENTA 0xD
#define COLOR_YELLOW 0xE
#define COLOR_WHITE 0xF

// 組合顏色
#define MAKE_COLOR(fg, bg) ((bg << 4) | fg)
#define DEFAULT_COLOR MAKE_COLOR(COLOR_WHITE, COLOR_BLACK)

#endif // KERNEL_H 