// StockOS Kernel
// 基於 Stock Insight Platform 的服務架構設計

#include "kernel.h"
#include "lib/string.h"
#include "serial.h"
#include "idt.h"
#include <stdint.h>
#include "../../ext/limine/limine.h"

// 簡化的服務初始化，避免字符串和函數指針數組
// 改用直接函數調用避免重定位問題

// 字符陣列避免重定位問題
static char msg_kernel_title[] = {'S','t','o','c','k','O','S',' ','K','e','r','n','e','l',' ','v','0','.','1','\n',0};
static char msg_separator[] = {'=','=','=','=','=','=','=','=','=','=','=','=','=','=','=','=','=','=','\n','\n',0};
static char msg_init_services[] = {'I','n','i','t','i','a','l','i','z','i','n','g',' ','s','e','r','v','i','c','e','s','.','.','.', '\n',0};
static char msg_memory_mgr[] = {' ',' ','M','e','m','o','r','y',' ','M','a','n','a','g','e','r','.','.','.', 0};
static char msg_pmm[] = {' ',' ','P','M','M',' ','S','e','r','v','i','c','e','.','.','.', 0};
static char msg_syscalls[] = {' ',' ','M','e','m','o','r','y',' ','S','y','s','c','a','l','l','s','.','.','.', 0};
static char msg_cli[] = {' ',' ','M','e','m','o','r','y',' ','C','L','I','.','.','.', 0};
static char msg_process[] = {' ',' ','P','r','o','c','e','s','s',' ','M','a','n','a','g','e','r','.','.','.', 0};
static char msg_fs[] = {' ',' ','F','i','l','e',' ','S','y','s','t','e','m','.','.','.', 0};
static char msg_network[] = {' ',' ','N','e','t','w','o','r','k',' ','S','t','a','c','k','.','.','.', 0};
static char msg_drivers[] = {' ',' ','D','e','v','i','c','e',' ','D','r','i','v','e','r','s','.','.','.', 0};
static char msg_ok[] = {'[','O','K',']','\n', 0};
static char msg_success[] = {'\n','K','e','r','n','e','l',' ','i','n','i','t','i','a','l','i','z','e','d','!','\n', 0};
static char msg_loop[] = {'E','n','t','e','r','i','n','g',' ','m','a','i','n',' ','l','o','o','p','.','.','.', '\n','\n',0};

#define VGA_BASE ((volatile char*)0xFFFF8000000B8000ULL)

#define STIVALE2_STRUCT_TAG_HHDM_ID 0xB0ED257E6AB0A0A0

struct stivale2_struct_tag {
    uint64_t identifier;
    uint64_t next;
};
struct stivale2_struct {
    uint64_t tags;
};
struct stivale2_struct_tag_hhdm {
    uint64_t identifier;
    uint64_t next;
    uint64_t offset;
};
struct stivale2_struct *stivale2_info;
static uint64_t hhdm_base = 0;

#ifdef __APPLE__
#define LIMINE_SEC __attribute__((section("__DATA,__limine_reqs")))
#else
#define LIMINE_SEC __attribute__((section(".limine_reqs")))
#endif

// Request Limine terminal before kernel_main so bootloader provides it
static volatile struct limine_terminal_request terminal_request LIMINE_SEC = {
    LIMINE_TERMINAL_REQUEST
};

// Helper to write to Limine terminal if available
static void term_write(const char *str) {
    if (terminal_request.response && terminal_request.response->terminal_count > 0) {
        struct limine_terminal *term = terminal_request.response->terminals[0];
        terminal_request.response->write(term, str, strlen(str));
    }
}

static void detect_hhdm(void) {
    struct stivale2_struct_tag *tag = (void*)stivale2_info->tags;
    while (tag) {
        if (tag->identifier == STIVALE2_STRUCT_TAG_HHDM_ID) {
            hhdm_base = ((struct stivale2_struct_tag_hhdm*)tag)->offset;
            break;
        }
        tag = (void*)tag->next;
    }
}

// 類似你的應用初始化流程
void kernel_main(void) {
    serial_init();
    serial_print("[StockOS] kernel_main entered\n");
    detect_hhdm();
    LOG("HHDM base:\n");
    LOG_HEX(hhdm_base);

    idt_init();
    serial_print("IDT initialized\n");

    // 在 VGA 文字模式 0xB8000[0] 寫入 'X' 做黑屏排除測試
    volatile char *vga = (volatile char *)(hhdm_base + 0xB8000);
    vga[0] = 'X';
    vga[1] = 0x0F;  // 白字黑底

    serial_print("VGA test char written\n");

    serial_print("clear_screen...\n");
    clear_screen();

    serial_print("print title...\n");
    print(msg_kernel_title);
    serial_print("print separator...\n");
    print(msg_separator);

    serial_print("init services...\n");
    print(msg_init_services);

    serial_print("memory_init...\n");
    print(msg_memory_mgr);
    memory_init();
    print(msg_ok);

    serial_print("pmm_service_init...\n");
    print(msg_pmm);
    pmm_service_init();
    print(msg_ok);

    serial_print("syscalls_service_init...\n");
    print(msg_syscalls);
    memory_syscalls_service_init();
    print(msg_ok);

    serial_print("cli_service_init...\n");
    print(msg_cli);
    memory_cli_service_init();
    print(msg_ok);

    serial_print("process_init...\n");
    print(msg_process);
    process_init();
    print(msg_ok);

    serial_print("fs_init...\n");
    print(msg_fs);
    fs_init();
    print(msg_ok);

    serial_print("network_init...\n");
    print(msg_network);
    network_init();
    print(msg_ok);

    serial_print("drivers_init...\n");
    print(msg_drivers);
    drivers_init();
    print(msg_ok);

    serial_print("success...\n");
    print(msg_success);
    print(msg_loop);
    
    // 進入主循環 - 類似你的事件處理
    kernel_loop();
}

// Kernel 主循環 - 類似你的 Socket.IO 事件循環
void kernel_loop(void) {
    static char input_buf[128];
    static int  input_len = 0;

    while (1) {
        // Poll serial for input (non-blocking)
        if (serial_received()) {
            char c = serial_read_char();
            // Echo back to both serial and terminal
            char echo[2] = {c, '\0'};
            term_write(echo);
            serial_write(c);

            if (c == '\r' || c == '\n') {
                // End of line → process command
                input_buf[input_len] = '\0';
                if (input_len > 0) {
                    kernel_handle_cli_command(input_buf);
                }
                input_len = 0;
            } else if (c == 0x08 || c == 0x7f) { // backspace
                if (input_len > 0) {
                    input_len--;
                }
            } else if (input_len < (int)sizeof(input_buf) - 1) {
                input_buf[input_len++] = c;
            }
        }

        // 處理中斷和事件
        handle_interrupts();

        // 調度程序
        schedule();

        // 處理系統調用
        handle_syscalls();
    }
}

// 處理中斷 - 類似你的 Socket.IO 事件處理
void handle_interrupts(void) {
    // 檢查是否有待處理的中斷
    // 這裡會處理鍵盤、定時器等中斷
}

// 調度程序 - 類似你的任務調度
void schedule(void) {
    // 實現程序調度邏輯
    // 類似你的負載均衡思維
}

// 處理系統調用 - 類似你的 API 路由
void handle_syscalls(void) {
    // 處理用戶程序的系統調用請求
    // 類似你的 REST API 處理
}

// 清屏函數 - 類似你的 Loading 組件
void clear_screen(void) {
    volatile char* video_memory = (volatile char*)(hhdm_base + 0xB8000);
    for (int i = 0; i < 80 * 25 * 2; i += 2) {
        video_memory[i] = ' ';
        video_memory[i + 1] = 0x07; // 白色文字，黑色背景
    }
}

// 字串輸出函數 - 類似你的 Formatter 組件
void print(const char* str) {
    // First, write to Limine terminal (framebuffer text) if present
    term_write(str);
    static int cursor_x = 0;
    static int cursor_y = 0;
    
    volatile char* video_memory = (volatile char*)(hhdm_base + 0xB8000);
    
    for (int i = 0; str[i] != '\0'; i++) {
        if (str[i] == '\n') {
            cursor_x = 0;
            cursor_y++;
            if (cursor_y >= 25) {
                // 滾動螢幕
                scroll_screen();
                cursor_y = 24;
            }
        } else {
            int offset = (cursor_y * 80 + cursor_x) * 2;
            video_memory[offset] = str[i];
            video_memory[offset + 1] = 0x07; // 白色文字
            
            cursor_x++;
            if (cursor_x >= 80) {
                cursor_x = 0;
                cursor_y++;
                if (cursor_y >= 25) {
                    scroll_screen();
                    cursor_y = 24;
                }
            }
        }
    }
}

// 滾動螢幕
void scroll_screen(void) {
    volatile char* video_memory = (volatile char*)(hhdm_base + 0xB8000);
    
    // 將所有行向上移動一行
    for (int i = 0; i < 24; i++) {
        for (int j = 0; j < 80; j++) {
            int src_offset = ((i + 1) * 80 + j) * 2;
            int dst_offset = (i * 80 + j) * 2;
            video_memory[dst_offset] = video_memory[src_offset];
            video_memory[dst_offset + 1] = video_memory[src_offset + 1];
        }
    }
    
    // 清空最後一行
    for (int j = 0; j < 80; j++) {
        int offset = (24 * 80 + j) * 2;
        video_memory[offset] = ' ';
        video_memory[offset + 1] = 0x07;
    }
}

// 服務初始化函數 (暫時的實現)
void memory_init(void) {
    // 記憶體管理器初始化
    // 類似你的資料庫連接池初始化
}

void memory_cleanup(void) {
    // 記憶體管理器清理
}

void process_init(void) {
    // 程序管理器初始化
    // 類似你的用戶管理系統初始化
}

void process_cleanup(void) {
    // 程序管理器清理
}

void fs_init(void) {
    // 檔案系統初始化
}

void fs_cleanup(void) {
    // 檔案系統清理
}

void network_init(void) {
    // 網路堆疊初始化
    // 類似你的 Socket.IO 初始化
}

void network_cleanup(void) {
    // 網路堆疊清理
}

void drivers_init(void) {
    // 設備驅動初始化
}

void drivers_cleanup(void) {
    // 設備驅動清理
}

// ========================= 新增記憶體管理服務實現 =========================

// 全域 PMM 管理器實例
static pmm_manager_t g_kernel_pmm;
static bool g_cli_mode = false;

int pmm_service_init(void) {
    // 創建模擬記憶體映射 (在實際實現中這來自 bootloader)
    memory_map_t memory_map = {0};
    memory_map.usable_memory = 64 * 1024 * 1024; // 64 MB 模擬記憶體
    memory_map.total_memory = memory_map.usable_memory;
    
    int result = pmm_init(&g_kernel_pmm, &memory_map);
    if (result != PMM_SUCCESS) {
        print("PMM Service: Failed to initialize PMM\n");
        return result;
    }
    
    print("PMM Service: Physical Memory Manager initialized\n");
    return 0;
}

void pmm_service_cleanup(void) {
    pmm_cleanup(&g_kernel_pmm);
    print("PMM Service: Physical Memory Manager cleaned up\n");
}

int memory_syscalls_service_init(void) {
    int result = memory_syscalls_init();
    if (result != 0) {
        print("Memory Syscalls: Failed to initialize\n");
        return result;
    }
    
    print("Memory Syscalls: System call handlers initialized\n");
    return 0;
}

void memory_syscalls_service_cleanup(void) {
    print("Memory Syscalls: System call handlers cleaned up\n");
}

int memory_cli_service_init(void) {
    int result = memory_cli_init();
    if (result != 0) {
        print("Memory CLI: Failed to initialize\n");
        return result;
    }
    
    print("Memory CLI: Command line interface initialized\n");
    print("Memory CLI: Type 'help' for available commands\n");
    print("Memory CLI: Type 'cli' to enter interactive mode\n");
    return 0;
}

void memory_cli_service_cleanup(void) {
    memory_cli_cleanup();
    print("Memory CLI: Command line interface cleaned up\n");
}

// CLI 模式處理
void kernel_enter_cli_mode(void) {
    if (!g_cli_mode) {
        g_cli_mode = true;
        print("\n=== StockOS Memory Management CLI ===\n");
        print("Type 'help' for commands, 'exit' to return to kernel\n");
        print("StockOS> ");
        
        // 進入 CLI 主循環
        memory_cli_main_loop();
        
        g_cli_mode = false;
        print("\nReturning to kernel mode...\n");
    }
}

void kernel_handle_cli_command(const char* command) {
    if (command && strlen(command) > 0) {
        if (strcmp(command, "cli") == 0) {
            kernel_enter_cli_mode();
        } else {
            // 執行單個命令
            int result = memory_cli_execute_command(command);
            if (result != 0) {
                print("Command failed with error code: ");
                // 簡單的數字轉字符串 (避免 sprintf 依賴)
                char error_str[16];
                int i = 0;
                int temp = result < 0 ? -result : result;
                if (temp == 0) {
                    error_str[i++] = '0';
                } else {
                    while (temp > 0) {
                        error_str[i++] = '0' + (temp % 10);
                        temp /= 10;
                    }
                }
                if (result < 0) error_str[i++] = '-';
                error_str[i] = '\0';
                
                // 反轉字符串
                for (int j = 0; j < i/2; j++) {
                    char tmp = error_str[j];
                    error_str[j] = error_str[i-1-j];
                    error_str[i-1-j] = tmp;
                }
                
                print(error_str);
                print("\n");
            }
        }
    }
}

// 獲取全域 PMM 實例 (供其他模組使用)
pmm_manager_t* kernel_get_pmm(void) {
    return &g_kernel_pmm;
} 