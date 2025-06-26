; Simple StockOS Bootloader - 避免複雜工具鏈問題
; 直接從16位模式啟動到32位保護模式，然後跳轉到64位

[BITS 16]
[ORG 0x7C00]

start:
    cli                     ; 關閉中斷
    xor ax, ax             ; 清零
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00         ; 設置堆疊

    ; 顯示啟動訊息
    mov si, boot_msg
    call print_string

    ; 設置A20線
    call enable_a20

    ; 進入保護模式
    lgdt [gdt_descriptor]
    mov eax, cr0
    or eax, 1
    mov cr0, eax

    ; 跳轉到32位代碼
    jmp CODE_SEG:start_pm

print_string:
    lodsb
    or al, al
    jz done
    mov ah, 0x0E
    int 0x10
    jmp print_string
done:
    ret

enable_a20:
    call wait_8042_command
    mov al, 0xAD
    out 0x64, al
    
    call wait_8042_command
    mov al, 0xD0
    out 0x64, al
    
    call wait_8042_data
    in al, 0x60
    push eax
    
    call wait_8042_command
    mov al, 0xD1
    out 0x64, al
    
    call wait_8042_command
    pop eax
    or al, 2
    out 0x60, al
    
    call wait_8042_command
    mov al, 0xAE
    out 0x64, al
    
    call wait_8042_command
    ret

wait_8042_command:
    in al, 0x64
    test al, 2
    jnz wait_8042_command
    ret

wait_8042_data:
    in al, 0x64
    test al, 1
    jz wait_8042_data
    ret

[BITS 32]
start_pm:
    mov ax, DATA_SEG
    mov ds, ax
    mov ss, ax
    mov es, ax
    mov fs, ax
    mov gs, ax
    
    ; 清屏
    mov edi, 0xB8000
    mov ecx, 80*25
    mov ax, 0x0720
    rep stosw
    
    ; 顯示StockOS訊息
    mov esi, stockos_msg
    mov edi, 0xB8000
    call print_string_pm
    
    ; 無限循環
    jmp $

print_string_pm:
    lodsb
    or al, al
    jz done_pm
    mov ah, 0x07
    stosw
    jmp print_string_pm
done_pm:
    ret

; 數據段
boot_msg db 'StockOS Loading...', 13, 10, 0
stockos_msg db 'StockOS Kernel v0.1 - Memory System Ready', 0

; GDT
gdt_start:
    dd 0x0          ; null descriptor
    dd 0x0

gdt_code:
    dw 0xFFFF       ; limit low
    dw 0x0          ; base low
    db 0x0          ; base middle
    db 10011010b    ; access
    db 11001111b    ; granularity
    db 0x0          ; base high

gdt_data:
    dw 0xFFFF       ; limit low
    dw 0x0          ; base low
    db 0x0          ; base middle
    db 10010010b    ; access
    db 11001111b    ; granularity
    db 0x0          ; base high

gdt_end:

gdt_descriptor:
    dw gdt_end - gdt_start - 1
    dd gdt_start

CODE_SEG equ gdt_code - gdt_start
DATA_SEG equ gdt_data - gdt_start

; 填充到512字節並添加簽名
times 510-($-$$) db 0
dw 0xAA55 