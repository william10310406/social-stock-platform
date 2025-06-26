; StockOS Stage 1 Bootloader - 512 字節載入器
; 職責：載入更大的 Stage 2 + C Kernel

[BITS 16]
[ORG 0x7C00]

start:
    cli
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00
    
    ; 顯示載入訊息
    mov si, loading_msg
    call print_16
    
    ; 載入 Stage 2 (從扇區2開始，載入20個扇區 = 10KB)
    mov dl, [boot_drive]    ; 保存啟動驅動器
    mov bx, STAGE2_LOAD_ADDR
    mov ah, 0x02           ; BIOS 讀取扇區功能
    mov al, 20             ; 載入20個扇區
    mov ch, 0              ; 柱面 0
    mov cl, 2              ; 從扇區 2 開始
    mov dh, 0              ; 磁頭 0
    int 0x13
    
    jc load_error
    
    ; 顯示成功訊息
    mov si, success_msg
    call print_16
    
    ; 設置 A20 線
    call enable_a20
    
    ; 跳轉到 Stage 2
    jmp STAGE2_LOAD_ADDR

load_error:
    mov si, error_msg
    call print_16
    hlt

print_16:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0E
    int 0x10
    jmp print_16
.done:
    ret

enable_a20:
    ; 快速 A20 啟用
    in al, 0x92
    or al, 2
    out 0x92, al
    ret

; 常數定義
STAGE2_LOAD_ADDR equ 0x8000

; 數據
boot_drive db 0x80
loading_msg db 'StockOS Stage 1: Loading kernel...', 13, 10, 0
success_msg db 'Stage 2 loaded. Booting...', 13, 10, 0
error_msg db 'Load failed!', 13, 10, 0

; 填充到 510 字節
times 510-($-$$) db 0
dw 0xAA55 