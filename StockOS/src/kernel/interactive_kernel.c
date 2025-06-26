/*
 * interactive_kernel.c - StockOS 交互式內核
 * =====================================
 * 整合你已完成的 Buddy Allocator + Memory CLI 
 * 提供完整的交互式內存管理系統
 */

#include "kernel.h"
#include "cli/memory_cli.h"
#include "memory/pmm.h"
#include "lib/string.h"
#include "../../arch/x86_64/hal/io.h"
#include <string.h>

// VGA 文字模式 - 基本顯示功能
#define VGA_MEMORY 0xB8000
#define VGA_WIDTH 80
#define VGA_HEIGHT 25

static int cursor_x = 0;
static int cursor_y = 0;
static char input_buffer[256];
static int input_pos = 0;

// 基本 I/O 函數
static void putchar_at(char c, int x, int y, unsigned char attr);
static void putchar(char c);
static void puts(const char* str);
static void ik_clear_screen(void);
static void ik_scroll_screen(void);
static char getchar(void);
static void handle_keyboard_input(void);

/* Forward declarations for functions defined later */
void interactive_command_loop(void);
void get_command_line(char* buffer, int max_len);
void handle_command(const char* command);
void show_help(void);
void memory_demo(void);

// 交互式內核主函數
void interactive_kernel_main(void) {
    ik_clear_screen();
    
    // 顯示 StockOS 歡迎界面
    puts("StockOS Interactive Memory Management System v0.1\n");
    puts("Built on Buddy Allocator + Consciousness Container Architecture\n");
    puts("================================================================\n\n");
    
    // 初始化內存管理系統
    puts("Initializing memory management...\n");
    memory_init();
    puts("  PMM Service: ");
    pmm_service_init();
    puts("[OK]\n");
    
    puts("  Memory CLI: ");
    memory_cli_service_init();
    puts("[OK]\n");
    
    puts("  Memory Syscalls: ");
    memory_syscalls_service_init();
    puts("[OK]\n\n");
    
    puts("Memory system ready! Available commands:\n");
    puts("  meminfo  - Display memory statistics\n");
    puts("  buddy    - Buddy allocator operations (stat/alloc/free)\n");
    puts("  slab     - Slab allocator operations (stat/alloc/free)\n");
    puts("  help     - Show available commands\n");
    puts("  clear    - Clear screen\n");
    puts("  reboot   - Restart system\n\n");
    
    // 進入交互式命令循環
    interactive_command_loop();
}

void interactive_command_loop(void) {
    while (1) {
        puts("StockOS> ");
        
        // 獲取用戶輸入
        get_command_line(input_buffer, sizeof(input_buffer));
        
        // 處理命令
        if (input_buffer[0] != '\0') {
            handle_command(input_buffer);
        }
    }
}

void get_command_line(char* buffer, int max_len) {
    int pos = 0;
    char c;
    
    while (pos < max_len - 1) {
        c = getchar();
        
        if (c == '\n' || c == '\r') {
            buffer[pos] = '\0';
            putchar('\n');
            break;
        } else if (c == '\b' || c == 127) { // Backspace
            if (pos > 0) {
                pos--;
                // 移動光標回退並清除字符
                cursor_x--;
                if (cursor_x < 0) {
                    cursor_x = VGA_WIDTH - 1;
                    cursor_y--;
                }
                putchar_at(' ', cursor_x, cursor_y, 0x07);
            }
        } else if (c >= 32 && c <= 126) { // 可打印字符
            buffer[pos++] = c;
            putchar(c);
        }
    }
    
    if (pos >= max_len - 1) {
        buffer[max_len - 1] = '\0';
    }
}

void handle_command(const char* command) {
    // 移除前後空白
    const char* cmd = command;
    while (*cmd == ' ') cmd++;
    
    if (strncmp(cmd, "meminfo", 7) == 0) {
        // 使用你已完成的 Memory CLI
        memory_cli_execute_command("meminfo");
        
    } else if (strncmp(cmd, "buddy", 5) == 0) {
        // 支持 buddy 子命令
        memory_cli_execute_command(command);
        
    } else if (strncmp(cmd, "slab", 4) == 0) {
        // 支持 slab 子命令  
        memory_cli_execute_command(command);
        
    } else if (strncmp(cmd, "help", 4) == 0) {
        show_help();
        
    } else if (strncmp(cmd, "clear", 5) == 0) {
        ik_clear_screen();
        
    } else if (strncmp(cmd, "reboot", 6) == 0) {
        puts("Rebooting system...\n");
        // 觸發系統重啟
        hal_outb(0x64, 0xFE);
        
    } else if (strncmp(cmd, "demo", 4) == 0) {
        memory_demo();
        
    } else {
        puts("Unknown command. Type 'help' for available commands.\n");
    }
}

void show_help(void) {
    puts("StockOS Interactive Memory Management Commands:\n\n");
    puts("Memory Information:\n");
    puts("  meminfo           - Display comprehensive memory statistics\n\n");
    
    puts("Buddy Allocator:\n");
    puts("  buddy stat        - Show buddy allocator statistics\n");
    puts("  buddy alloc <n>   - Allocate n pages using buddy allocator\n");
    puts("  buddy free <idx>  - Free allocation by index\n\n");
    
    puts("Slab Allocator:\n");
    puts("  slab stat         - Show slab allocator statistics\n");
    puts("  slab alloc <size> - Allocate object of given size\n");
    puts("  slab free <idx>   - Free slab allocation by index\n\n");
    
    puts("System:\n");
    puts("  demo              - Run memory allocation demo\n");
    puts("  clear             - Clear screen\n");
    puts("  reboot            - Restart system\n");
    puts("  help              - Show this help message\n\n");
}

void memory_demo(void) {
    puts("StockOS Memory Management Demo\n");
    puts("==============================\n\n");
    
    puts("1. Testing Buddy Allocator...\n");
    memory_cli_execute_command("buddy alloc 4");
    memory_cli_execute_command("buddy alloc 8");
    memory_cli_execute_command("buddy stat");
    
    puts("\n2. Testing Slab Allocator...\n");
    memory_cli_execute_command("slab alloc 64");
    memory_cli_execute_command("slab alloc 128");
    memory_cli_execute_command("slab stat");
    
    puts("\n3. Overall Memory Status...\n");
    memory_cli_execute_command("meminfo");
    
    puts("\nDemo completed! Try the commands yourself.\n");
}

// === 基本 I/O 實現 ===

static void putchar_at(char c, int x, int y, unsigned char attr) {
    volatile unsigned short* vga = (volatile unsigned short*)VGA_MEMORY;
    vga[y * VGA_WIDTH + x] = ((unsigned short)attr << 8) | c;
}

static void putchar(char c) {
    if (c == '\n') {
        cursor_x = 0;
        cursor_y++;
    } else if (c == '\t') {
        cursor_x = (cursor_x + 8) & ~7; // 對齊到8字符
    } else {
        putchar_at(c, cursor_x, cursor_y, 0x07); // 白色文字
        cursor_x++;
    }
    
    if (cursor_x >= VGA_WIDTH) {
        cursor_x = 0;
        cursor_y++;
    }
    
    if (cursor_y >= VGA_HEIGHT) {
        ik_scroll_screen();
        cursor_y = VGA_HEIGHT - 1;
    }
}

static void puts(const char* str) {
    while (*str) {
        putchar(*str++);
    }
}

static void ik_clear_screen(void) {
    volatile unsigned short* vga = (volatile unsigned short*)VGA_MEMORY;
    for (int i = 0; i < VGA_WIDTH * VGA_HEIGHT; i++) {
        vga[i] = 0x0720; // 空格字符 + 白色文字黑色背景
    }
    cursor_x = cursor_y = 0;
}

static void ik_scroll_screen(void) {
    volatile unsigned short* vga = (volatile unsigned short*)VGA_MEMORY;
    
    // 將所有行向上移動一行
    for (int y = 0; y < VGA_HEIGHT - 1; y++) {
        for (int x = 0; x < VGA_WIDTH; x++) {
            vga[y * VGA_WIDTH + x] = vga[(y + 1) * VGA_WIDTH + x];
        }
    }
    
    // 清空最後一行
    for (int x = 0; x < VGA_WIDTH; x++) {
        vga[(VGA_HEIGHT - 1) * VGA_WIDTH + x] = 0x0720;
    }
}

static char getchar(void) {
    // 簡化的鍵盤輸入 - 在實際實現中需要中斷處理
    unsigned char status, scancode;
    
    do {
        status = hal_inb(0x64);
    } while (!(status & 1));
    
    scancode = hal_inb(0x60);
    
    // 簡化的掃描碼轉 ASCII 映射
    static const char scancode_to_ascii_map[128] = {
        0, 27, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '\b',
        '\t', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\n',
        0, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '`',
        0, '\\', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 0,
        '*', 0, ' '
    };
    
    if (scancode < 128) {
        return scancode_to_ascii_map[scancode];
    }
    
    return 0;
}

// (I/O handled by HAL) 