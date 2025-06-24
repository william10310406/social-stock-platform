// StockOS Kernel
// 基於 Stock Insight Platform 的服務架構設計

#include "kernel.h"

// 類似你的 RouteUtils，但用於 kernel 服務
typedef struct {
    const char* name;
    void (*init_func)(void);
    void (*cleanup_func)(void);
} kernel_service_t;

// 類似你的組件庫概念，但用於 kernel 服務
kernel_service_t services[] = {
    {"Memory Manager", memory_init, memory_cleanup},
    {"Process Manager", process_init, process_cleanup},
    {"File System", fs_init, fs_cleanup},
    {"Network Stack", network_init, network_cleanup},
    {"Device Drivers", drivers_init, drivers_cleanup}
};

// 類似你的應用初始化流程
void kernel_main(void) {
    // 清屏並顯示歡迎訊息
    clear_screen();
    print("StockOS Kernel v0.1\n");
    print("==================\n\n");
    
    // 初始化核心服務 - 參考你的服務架構
    print("Initializing kernel services...\n");
    for (int i = 0; i < sizeof(services)/sizeof(services[0]); i++) {
        print("  Loading service: ");
        print(services[i].name);
        print(" ");
        
        // 初始化服務
        services[i].init_func();
        print("[OK]\n");
    }
    
    print("\nKernel initialized successfully!\n");
    print("Entering main loop...\n\n");
    
    // 進入主循環 - 類似你的事件處理
    kernel_loop();
}

// Kernel 主循環 - 類似你的 Socket.IO 事件循環
void kernel_loop(void) {
    while (1) {
        // 處理中斷和事件
        handle_interrupts();
        
        // 調度程序
        schedule();
        
        // 處理系統調用
        handle_syscalls();
        
        // 短暫休眠
        for (volatile int i = 0; i < 1000000; i++) {
            // 簡單的延遲
        }
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
    volatile char* video_memory = (volatile char*)0xB8000;
    for (int i = 0; i < 80 * 25 * 2; i += 2) {
        video_memory[i] = ' ';
        video_memory[i + 1] = 0x07; // 白色文字，黑色背景
    }
}

// 字串輸出函數 - 類似你的 Formatter 組件
void print(const char* str) {
    static int cursor_x = 0;
    static int cursor_y = 0;
    
    volatile char* video_memory = (volatile char*)0xB8000;
    
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
    volatile char* video_memory = (volatile char*)0xB8000;
    
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