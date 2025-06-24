/* StockOS Linker Script
 * 基於 Stock Insight Platform 的模組化設計思維
 */

/* 輸出格式 */
OUTPUT_FORMAT("elf32-i386")
OUTPUT_ARCH(i386)
ENTRY(_start)

/* 記憶體布局 */
SECTIONS
{
    /* Kernel 載入到 1MB 位置 */
    . = 0x100000;
    
    /* 程式碼段 */
    .text : {
        *(.text)
        *(.text.*)
    }
    
    /* 唯讀數據段 */
    .rodata : {
        *(.rodata)
        *(.rodata.*)
    }
    
    /* 數據段 */
    .data : {
        *(.data)
        *(.data.*)
    }
    
    /* BSS 段 (未初始化數據) */
    .bss : {
        *(.bss)
        *(.bss.*)
        *(COMMON)
    }
    
    /* 丟棄不需要的段 */
    /DISCARD/ : {
        *(.comment)
        *(.note)
        *(.eh_frame)
    }
} 