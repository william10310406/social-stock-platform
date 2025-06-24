/*
 * memory_cli.h - StockOS Memory Management CLI Commands
 * =====================================================
 * CLI 命令處理器，提供記憶體管理的測試和監控界面
 * 
 * 創建日期: 2025-06-24
 * 版本: 1.0
 */

#ifndef STOCKOS_MEMORY_CLI_H
#define STOCKOS_MEMORY_CLI_H

#include <stddef.h>
#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ========================= CLI 常量定義 ========================= */
#define CLI_MAX_COMMANDS        32      // 最大命令數
#define CLI_MAX_COMMAND_NAME    16      // 命令名最大長度
#define CLI_MAX_DESCRIPTION     128     // 描述最大長度
#define CLI_MAX_USAGE           256     // 用法說明最大長度
#define CLI_BUFFER_SIZE         1024    // 輸入緩衝區大小
#define CLI_OUTPUT_BUFFER_SIZE  4096    // 輸出緩衝區大小
#define CLI_MAX_ARGS            16      // 最大參數數量

/* ========================= CLI 命令類型 ========================= */
typedef int (*cli_func_t)(int argc, char** argv);

typedef struct {
    char name[CLI_MAX_COMMAND_NAME];
    char description[CLI_MAX_DESCRIPTION];
    char usage[CLI_MAX_USAGE];
    cli_func_t handler;
    bool admin_required;                // 是否需要管理員權限
} cli_command_t;

/* ========================= CLI 處理器結構 ========================= */
typedef struct {
    cli_command_t commands[CLI_MAX_COMMANDS];
    int command_count;
    
    char input_buffer[CLI_BUFFER_SIZE];
    char output_buffer[CLI_OUTPUT_BUFFER_SIZE];
    
    // 命令歷史
    char history[16][CLI_BUFFER_SIZE];
    int history_count;
    int history_index;
    
    // 狀態
    bool initialized;
    bool echo_enabled;
    bool color_enabled;
} memory_cli_t;

/* ========================= CLI 初始化和管理 ========================= */

/**
 * 初始化記憶體 CLI 處理器
 * @return: 成功返回 0，失敗返回負錯誤碼
 */
int memory_cli_init(void);

/**
 * 清理記憶體 CLI 處理器
 */
void memory_cli_cleanup(void);

/**
 * 主 CLI 循環
 */
void memory_cli_main_loop(void);

/**
 * 處理單個命令行
 * @param command_line: 命令行字符串
 * @return: 命令執行結果
 */
int memory_cli_execute_command(const char* command_line);

/* ========================= 核心記憶體命令 ========================= */

/**
 * meminfo - 顯示記憶體資訊
 * 語法: meminfo [--detail] [--all]
 */
int cli_cmd_meminfo(int argc, char** argv);

/**
 * buddy - Buddy allocator 操作
 * 語法: buddy <alloc|free|stat|test> [args...]
 */
int cli_cmd_buddy(int argc, char** argv);

/**
 * slab - Slab allocator 操作
 * 語法: slab <alloc|free|stat|test> [args...]
 */
int cli_cmd_slab(int argc, char** argv);

/**
 * ccms - CCMS 操作
 * 語法: ccms <alloc|free|stat|test> [level] [args...]
 */
int cli_cmd_ccms(int argc, char** argv);

/**
 * vmem - 虛擬記憶體操作
 * 語法: vmem <map|unmap|stat|test> [args...]
 */
int cli_cmd_vmem(int argc, char** argv);

/**
 * pmem - 物理記憶體操作
 * 語法: pmem <alloc|free|stat|test> [args...]
 */
int cli_cmd_pmem(int argc, char** argv);

/**
 * test - 記憶體測試
 * 語法: test <basic|stress|fragmentation|performance|thread_safety|leak> [params...]
 */
int cli_cmd_test(int argc, char** argv);

/**
 * monitor - 記憶體監控
 * 語法: monitor <start|stop|show|reset> [interval]
 */
int cli_cmd_monitor(int argc, char** argv);

/* ========================= 輔助命令 ========================= */

/**
 * help - 顯示幫助資訊
 * 語法: help [command]
 */
int cli_cmd_help(int argc, char** argv);

/**
 * clear - 清屏
 * 語法: clear
 */
int cli_cmd_clear(int argc, char** argv);

/**
 * echo - 回顯控制
 * 語法: echo <on|off>
 */
int cli_cmd_echo(int argc, char** argv);

/**
 * color - 顏色控制
 * 語法: color <on|off>
 */
int cli_cmd_color(int argc, char** argv);

/**
 * history - 命令歷史
 * 語法: history [clear]
 */
int cli_cmd_history(int argc, char** argv);

/**
 * exit - 退出 CLI
 * 語法: exit
 */
int cli_cmd_exit(int argc, char** argv);

/* ========================= 測試命令實現 ========================= */

/**
 * 基本分配測試
 */
int cli_test_basic_alloc(int test_count);

/**
 * 壓力測試
 */
int cli_test_stress(int iterations, int max_size);

/**
 * 碎片化測試
 */
int cli_test_fragmentation(int pattern_type);

/**
 * 性能測試
 */
int cli_test_performance(int operation_count);

/**
 * 線程安全測試
 */
int cli_test_thread_safety(int thread_count, int ops_per_thread);

/**
 * 記憶體洩漏測試
 */
int cli_test_memory_leak(int cycle_count);

/* ========================= 監控功能 ========================= */

typedef struct {
    bool monitoring_active;
    uint32_t update_interval_ms;
    uint64_t start_time;
    uint64_t samples_collected;
    
    // 監控數據
    struct {
        uint64_t timestamp;
        size_t total_memory;
        size_t used_memory;
        size_t free_memory;
        uint64_t alloc_count;
        uint64_t free_count;
    } current_sample;
    
    // 歷史峰值
    struct {
        size_t peak_used_memory;
        uint64_t peak_alloc_rate;
        uint64_t peak_free_rate;
    } peaks;
} memory_monitor_t;

/**
 * 開始記憶體監控
 */
int memory_monitor_start(uint32_t interval_ms);

/**
 * 停止記憶體監控
 */
void memory_monitor_stop(void);

/**
 * 顯示監控狀態
 */
void memory_monitor_show_status(void);

/**
 * 重置監控統計
 */
void memory_monitor_reset(void);

/* ========================= 輸出格式化 ========================= */

/**
 * 格式化記憶體大小
 * @param bytes: 字節數
 * @param buffer: 輸出緩衝區
 * @param buffer_size: 緩衝區大小
 */
void format_memory_size(size_t bytes, char* buffer, size_t buffer_size);

/**
 * 格式化百分比
 * @param value: 數值
 * @param total: 總數
 * @param buffer: 輸出緩衝區
 * @param buffer_size: 緩衝區大小
 */
void format_percentage(uint64_t value, uint64_t total, char* buffer, size_t buffer_size);

/**
 * 顏色輸出 (如果支持)
 */
void cli_printf_color(const char* color, const char* format, ...);

/* ========================= 顏色定義 ========================= */
#define CLI_COLOR_RESET     "\033[0m"
#define CLI_COLOR_RED       "\033[31m"
#define CLI_COLOR_GREEN     "\033[32m"
#define CLI_COLOR_YELLOW    "\033[33m"
#define CLI_COLOR_BLUE      "\033[34m"
#define CLI_COLOR_MAGENTA   "\033[35m"
#define CLI_COLOR_CYAN      "\033[36m"
#define CLI_COLOR_WHITE     "\033[37m"

/* ========================= 便利宏 ========================= */
#define CLI_PRINT_ERROR(msg, ...) \
    cli_printf_color(CLI_COLOR_RED, "ERROR: " msg "\n", ##__VA_ARGS__)

#define CLI_PRINT_SUCCESS(msg, ...) \
    cli_printf_color(CLI_COLOR_GREEN, "SUCCESS: " msg "\n", ##__VA_ARGS__)

#define CLI_PRINT_WARNING(msg, ...) \
    cli_printf_color(CLI_COLOR_YELLOW, "WARNING: " msg "\n", ##__VA_ARGS__)

#define CLI_PRINT_INFO(msg, ...) \
    cli_printf_color(CLI_COLOR_CYAN, "INFO: " msg "\n", ##__VA_ARGS__)

/* ========================= 命令註冊輔助 ========================= */

/**
 * 註冊單個 CLI 命令
 */
int cli_register_command(const char* name, const char* description, 
                        const char* usage, cli_func_t handler, bool admin_required);

/**
 * 查找命令
 */
cli_command_t* cli_find_command(const char* name);

/**
 * 解析命令行參數
 */
int cli_parse_args(const char* command_line, char** argv, int max_args);

/**
 * 驗證參數數量
 */
bool cli_validate_arg_count(int argc, int min_args, int max_args, const char* usage);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* STOCKOS_MEMORY_CLI_H */ 