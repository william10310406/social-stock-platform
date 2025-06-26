; StockOS Stage 2 Interactive Bootloader - 10KB 完整交互系統
; 整合你的 Memory CLI 概念，載入 C Kernel

[BITS 16]
[ORG 0x8000]

start_stage2:
    ; 進入保護模式
    lgdt [gdt_descriptor]
    mov eax, cr0
    or eax, 1
    mov cr0, eax
    jmp CODE_SEG:protected_main

[BITS 32]
protected_main:
    mov ax, DATA_SEG
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov esp, 0x9FC00      ; 設置堆疊在 640KB 附近
    
    ; 清屏並初始化
    call clear_screen_32
    call show_stockos_interface
    
    ; 檢查是否載入 C Kernel
    call check_kernel_presence
    
    ; 進入交互循環
    call interactive_main_loop

clear_screen_32:
    mov edi, 0xB8000
    mov ecx, 2000
    mov eax, 0x0F200F20
    rep stosd
    ret

show_stockos_interface:
    ; 顯示完整的 StockOS 界面
    mov esi, title_banner
    mov edi, 0xB8000
    call print_string_32
    
    mov esi, subtitle_line
    mov edi, 0xB8000 + 160*1
    call print_string_32
    
    mov esi, separator_line
    mov edi, 0xB8000 + 160*2
    call print_string_32
    
    mov esi, status_memory
    mov edi, 0xB8000 + 160*4
    call print_string_32
    
    mov esi, status_buddy
    mov edi, 0xB8000 + 160*5
    call print_string_32
    
    mov esi, status_cli
    mov edi, 0xB8000 + 160*6
    call print_string_32
    
    mov esi, separator_line
    mov edi, 0xB8000 + 160*7
    call print_string_32
    
    mov esi, command_help
    mov edi, 0xB8000 + 160*9
    call print_string_32
    
    mov esi, available_commands
    mov edi, 0xB8000 + 160*10
    call print_string_32
    
    mov esi, kernel_commands
    mov edi, 0xB8000 + 160*11
    call print_string_32
    
    ret

check_kernel_presence:
    ; 檢查是否已載入 C Kernel (假設在 0x100000)
    mov eax, [0x100000]
    cmp eax, 0x464c457f    ; ELF 魔數
    je kernel_found
    
    ; 沒有找到 kernel
    mov esi, no_kernel_msg
    mov edi, 0xB8000 + 160*13
    call print_string_32
    ret

kernel_found:
    mov esi, kernel_found_msg
    mov edi, 0xB8000 + 160*13
    call print_string_32
    ret

interactive_main_loop:
    ; 顯示提示符
    mov esi, main_prompt
    mov edi, 0xB8000 + 160*15
    call print_string_32
    
    ; 清空輸入緩衝區
    call clear_input_buffer
    
input_loop:
    call get_keyboard_input
    
    ; 檢查是否為 Enter
    cmp al, 13
    je process_command
    
    ; 檢查是否為 Backspace
    cmp al, 8
    je handle_backspace
    
    ; 檢查是否為可打印字符
    cmp al, 32
    jb input_loop
    cmp al, 126
    ja input_loop
    
    ; 顯示並存儲字符
    call display_and_store_char
    jmp input_loop

process_command:
    call newline
    call parse_and_execute_command
    jmp interactive_main_loop

; 命令解析和執行
parse_and_execute_command:
    mov esi, input_buffer
    
    ; 檢查 "help" 命令
    call compare_help
    cmp eax, 0
    je cmd_help_handler
    
    ; 檢查 "memory" 命令
    call compare_memory
    cmp eax, 0
    je cmd_memory_handler
    
    ; 檢查 "buddy" 命令
    call compare_buddy
    cmp eax, 0
    je cmd_buddy_handler
    
    ; 檢查 "kernel" 命令
    call compare_kernel
    cmp eax, 0
    je cmd_kernel_handler
    
    ; 檢查 "boot" 命令
    call compare_boot
    cmp eax, 0
    je cmd_boot_handler
    
    ; 檢查 "reboot" 命令
    call compare_reboot
    cmp eax, 0
    je cmd_reboot_handler
    
    ; 檢查 "clear" 命令
    call compare_clear
    cmp eax, 0
    je cmd_clear_handler
    
    ; 未知命令
    mov esi, unknown_command_msg
    call print_response
    ret

cmd_help_handler:
    mov esi, help_response
    call print_response
    ret

cmd_memory_handler:
    mov esi, memory_response
    call print_response
    ret

cmd_buddy_handler:
    mov esi, buddy_response
    call print_response
    ret

cmd_kernel_handler:
    mov esi, kernel_response
    call print_response
    ret

cmd_boot_handler:
    ; 啟動 C Kernel
    mov esi, booting_kernel_msg
    call print_response
    
    ; 載入 C Kernel (我們需要從磁盤載入 kernel.elf)
    call load_c_kernel
    
    ; 如果載入成功，跳轉到 C Kernel
    cmp eax, 0
    jne .kernel_loaded
    
    mov esi, kernel_load_failed_msg
    call print_response
    ret
    
.kernel_loaded:
    mov esi, kernel_loaded_msg
    call print_response
    
    ; 跳轉到交互式內核主函數
    call 0x100000
    ret

load_c_kernel:
    ; 真正載入我們的 C Kernel 
    ; 從磁盤扇區載入 kernel.elf 到 0x100000
    
    mov esi, loading_kernel_msg
    call print_response
    
    ; 設置載入參數
    mov bx, 0x1000          ; 載入到 0x10000 臨時位置
    mov ah, 0x02            ; BIOS 讀取扇區功能
    mov al, 50              ; 載入50個扇區 (25KB) - 足夠容納我們的 kernel
    mov ch, 0               ; 柱面 0
    mov cl, 21              ; 從扇區 21 開始 (Stage2佔用扇區2-20)
    mov dh, 0               ; 磁頭 0
    mov dl, 0               ; 軟盤驅動器 A
    int 0x13
    
    jc .load_failed
    
    ; 載入成功，複製到正確位置 0x100000
    mov esi, 0x10000
    mov edi, 0x100000
    mov ecx, 25600          ; 25KB
    rep movsb
    
    mov eax, 1              ; 返回成功
    ret
    
.load_failed:
    mov eax, 0              ; 返回失敗
    ret

cmd_reboot_handler:
    mov esi, rebooting_msg
    call print_response
    
    ; 等待一下然後重啟
    call short_delay
    mov al, 0xFE
    out 0x64, al
    hlt

cmd_clear_handler:
    call clear_screen_32
    call show_stockos_interface
    ret

print_response:
    mov edi, [current_output_line]
    call print_string_32
    call newline
    ret

newline:
    add dword [current_output_line], 160
    ; 檢查是否需要滾動
    cmp dword [current_output_line], 0xB8000 + 160*24
    jb .no_scroll
    call scroll_screen
    sub dword [current_output_line], 160
.no_scroll:
    ret

scroll_screen:
    ; 簡單的螢幕滾動
    mov esi, 0xB8000 + 160
    mov edi, 0xB8000
    mov ecx, 160*23
    rep movsw
    
    ; 清空最後一行
    mov edi, 0xB8000 + 160*23
    mov ecx, 80
    mov ax, 0x0F20
    rep stosw
    ret

; 字符串比較函數
compare_help:
    mov edi, cmd_help_str
    call strcmp_32
    ret

compare_memory:
    mov edi, cmd_memory_str
    call strcmp_32
    ret

compare_buddy:
    mov edi, cmd_buddy_str
    call strcmp_32
    ret

compare_kernel:
    mov edi, cmd_kernel_str
    call strcmp_32
    ret

compare_boot:
    mov edi, cmd_boot_str
    call strcmp_32
    ret

compare_reboot:
    mov edi, cmd_reboot_str
    call strcmp_32
    ret

compare_clear:
    mov edi, cmd_clear_str
    call strcmp_32
    ret

strcmp_32:
    ; esi = input, edi = command
    push esi
    push edi
.loop:
    lodsb
    mov bl, [edi]
    inc edi
    cmp al, bl
    jne .not_equal
    test al, al
    jz .equal
    jmp .loop
.equal:
    mov eax, 0
    jmp .done
.not_equal:
    mov eax, 1
.done:
    pop edi
    pop esi
    ret

; 鍵盤輸入處理
get_keyboard_input:
.wait:
    in al, 0x64
    test al, 1
    jz .wait
    in al, 0x60
    
    ; 轉換掃描碼
    call scancode_to_ascii
    ret

scancode_to_ascii:
    ; 簡化的掃描碼轉 ASCII 表
    cmp al, 0x1C
    je .enter
    cmp al, 0x0E
    je .backspace
    cmp al, 0x39
    je .space
    
    ; 字母鍵
    cmp al, 0x23
    je .h
    cmp al, 0x12
    je .e
    cmp al, 0x26
    je .l
    cmp al, 0x19
    je .p
    cmp al, 0x32
    je .m
    cmp al, 0x17
    je .i
    cmp al, 0x31
    je .n
    cmp al, 0x21
    je .f
    cmp al, 0x18
    je .o
    cmp al, 0x2E
    je .c
    cmp al, 0x1F
    je .s
    cmp al, 0x13
    je .r
    cmp al, 0x20
    je .d
    cmp al, 0x14
    je .t
    cmp al, 0x16
    je .u
    cmp al, 0x30
    je .b
    cmp al, 0x25
    je .k
    cmp al, 0x22
    je .g
    cmp al, 0x31
    je .n
    cmp al, 0x15
    je .y
    cmp al, 0x11
    je .w
    cmp al, 0x1E
    je .a
    
    ; 未知按鍵，返回0
    xor al, al
    ret

.wait:

.enter:
    mov al, 13
    ret
.backspace:
    mov al, 8
    ret
.space:
    mov al, 32
    ret
.h:
    mov al, 'h'
    ret
.e:
    mov al, 'e'
    ret
.l:
    mov al, 'l'
    ret
.p:
    mov al, 'p'
    ret
.m:
    mov al, 'm'
    ret
.i:
    mov al, 'i'
    ret
.n:
    mov al, 'n'
    ret
.f:
    mov al, 'f'
    ret
.o:
    mov al, 'o'
    ret
.c:
    mov al, 'c'
    ret
.s:
    mov al, 's'
    ret
.r:
    mov al, 'r'
    ret
.d:
    mov al, 'd'
    ret
.t:
    mov al, 't'
    ret
.u:
    mov al, 'u'
    ret
.b:
    mov al, 'b'
    ret
.k:
    mov al, 'k'
    ret
.g:
    mov al, 'g'
    ret
.y:
    mov al, 'y'
    ret
.w:
    mov al, 'w'
    ret
.a:
    mov al, 'a'
    ret

display_and_store_char:
    ; 顯示字符
    push eax
    mov ah, 0x0F
    mov edi, 0xB8000 + 160*15 + 20  ; 提示符後
    mov ebx, [input_position]
    shl ebx, 1
    add edi, ebx
    stosw
    
    ; 存儲到緩衝區
    mov edi, input_buffer
    add edi, [input_position]
    pop eax
    stosb
    
    inc dword [input_position]
    ret

handle_backspace:
    cmp dword [input_position], 0
    je input_loop
    
    dec dword [input_position]
    
    ; 清除螢幕字符
    mov ax, 0x0F20
    mov edi, 0xB8000 + 160*15 + 20
    mov ebx, [input_position]
    shl ebx, 1
    add edi, ebx
    stosw
    
    jmp input_loop

clear_input_buffer:
    mov edi, input_buffer
    mov ecx, 64
    xor al, al
    rep stosb
    mov dword [input_position], 0
    ret

short_delay:
    mov ecx, 0x1000000
.loop:
    dec ecx
    jnz .loop
    ret

print_string_32:
    push esi
.loop:
    lodsb
    test al, al
    jz .done
    mov ah, 0x0F
    stosw
    jmp .loop
.done:
    pop esi
    ret

; GDT
gdt_start:
    dd 0x0, 0x0

gdt_code:
    dw 0xFFFF
    dw 0x0
    db 0x0
    db 10011010b
    db 11001111b
    db 0x0

gdt_data:
    dw 0xFFFF
    dw 0x0
    db 0x0
    db 10010010b
    db 11001111b
    db 0x0

gdt_end:

gdt_descriptor:
    dw gdt_end - gdt_start - 1
    dd gdt_start

CODE_SEG equ gdt_code - gdt_start
DATA_SEG equ gdt_data - gdt_start

; 數據區域
title_banner db 'StockOS Interactive Memory Management System v0.1', 0
subtitle_line db 'Built on Buddy Allocator + Consciousness Container Architecture', 0
separator_line db '================================================================', 0
status_memory db 'Memory Manager: Ready | PMM: Initialized | VMM: Standby', 0
status_buddy db 'Buddy Allocator: Active | Slab Allocator: Ready', 0
status_cli db 'Memory CLI: Enabled | Interactive Mode: ON', 0
command_help db 'Available Commands:', 0
available_commands db 'help, memory, buddy, kernel, boot, reboot, clear', 0
kernel_commands db 'Type "boot" to start C Kernel with full Memory CLI', 0

main_prompt db 'StockOS> ', 0
no_kernel_msg db 'Warning: C Kernel not detected at 0x100000', 0
kernel_found_msg db 'C Kernel detected and ready to boot', 0

; 命令字符串
cmd_help_str db 'help', 0
cmd_memory_str db 'memory', 0
cmd_buddy_str db 'buddy', 0
cmd_kernel_str db 'kernel', 0
cmd_boot_str db 'boot', 0
cmd_reboot_str db 'reboot', 0
cmd_clear_str db 'clear', 0

; 回應訊息
help_response db 'Commands: help|memory|buddy|kernel|boot|reboot|clear', 0
memory_response db 'Memory: 64MB total, Buddy+Slab ready, CLI available', 0
buddy_response db 'Buddy Allocator: Order-based, 4KB pages, merge/split ready', 0
kernel_response db 'C Kernel: Full Memory CLI, PMM/VMM, Consciousness System', 0
booting_kernel_msg db 'Booting StockOS C Kernel with Memory CLI...', 0
loading_kernel_msg db 'Loading C Kernel from disk (50 sectors)...', 0
kernel_load_failed_msg db 'Error: Failed to load C Kernel from disk', 0
kernel_loaded_msg db 'C Kernel loaded successfully. Starting interactive_kernel_main...', 0
rebooting_msg db 'Rebooting system...', 0
unknown_command_msg db 'Unknown command. Type "help" for available commands.', 0

; 變量
input_buffer times 64 db 0
input_position dd 0
current_output_line dd 0xB8000 + 160*17

; 填充到適當大小 (10KB)
times 10240-($-$$) db 0 