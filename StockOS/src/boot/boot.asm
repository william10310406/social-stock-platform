; StockOS Bootloader
; 基於 Stock Insight Platform 的模組載入概念

[BITS 16]           ; 16位實模式
ORG 0x7C00          ; BIOS 載入位置

; 啟動代碼
boot:
    ; 清屏 - 類似你的 Loading 組件概念
    mov ax, 0x03
    int 0x10
    
    ; 顯示啟動訊息 - 類似你的 Toast 通知系統
    mov si, msg_boot
    call print_string
    
    ; 載入 kernel - 類似你的模組載入機制
    call load_kernel
    
    ; 檢查載入是否成功
    cmp ax, 0
    je kernel_loaded
    
    ; 載入失敗
    mov si, msg_load_error
    call print_string
    jmp halt
    
kernel_loaded:
    ; 顯示成功訊息
    mov si, msg_kernel_loaded
    call print_string
    
    ; 跳轉到 32位保護模式
    jmp switch_to_pm

; 字串輸出函數 - 類似你的 Formatter 組件
print_string:
    pusha
    mov ah, 0x0E    ; BIOS 中斷功能：顯示字符
.loop:
    lodsb           ; 載入字符到 AL
    test al, al     ; 檢查是否為字串結尾 (0)
    jz .done        ; 如果是 0，結束
    int 0x10        ; 調用 BIOS 中斷
    jmp .loop       ; 繼續下一個字符
.done:
    popa
    ret

; 載入 kernel 函數
load_kernel:
    ; 設定磁碟讀取參數
    mov ah, 0x02    ; BIOS 讀取扇區功能
    mov al, 15      ; 讀取 15 個扇區 (kernel 大小)
    mov ch, 0       ; 柱面 0
    mov cl, 2       ; 從第 2 個扇區開始 (bootloader 佔用第 1 個)
    mov dh, 0       ; 磁頭 0
    mov dl, 0x80    ; 第一個硬碟
    mov bx, 0x1000  ; 載入到記憶體 0x1000 位置
    
    int 0x13        ; 調用 BIOS 中斷
    jc .error       ; 如果有錯誤 (CF=1)
    
    mov ax, 0       ; 成功，返回 0
    ret
.error:
    mov ax, 1       ; 失敗，返回 1
    ret

; 切換到保護模式
switch_to_pm:
    ; 禁用中斷
    cli
    
    ; 載入 GDT
    lgdt [gdt_descriptor]
    
    ; 設定 CR0 的 PE 位
    mov eax, cr0
    or eax, 1
    mov cr0, eax
    
    ; 遠跳轉到 32位代碼
    jmp 0x08:init_pm

[BITS 32]
; 32位保護模式初始化
init_pm:
    ; 設定段暫存器
    mov ax, 0x10
    mov ds, ax
    mov ss, ax
    mov es, ax
    mov fs, ax
    mov gs, ax
    
    ; 設定堆疊
    mov ebp, 0x90000
    mov esp, ebp
    
    ; 跳轉到 kernel
    call 0x1000

; 停止執行
halt:
    hlt
    jmp halt

; 數據段
msg_boot db 'StockOS Loading...', 0x0D, 0x0A, 0
msg_kernel_loaded db 'Kernel loaded successfully!', 0x0D, 0x0A, 0
msg_load_error db 'Failed to load kernel!', 0x0D, 0x0A, 0

; GDT (Global Descriptor Table)
gdt_start:
    ; 空描述符
    dd 0x0
    dd 0x0
    
    ; 代碼段描述符
    dw 0xFFFF       ; Limit (bits 0-15)
    dw 0x0          ; Base (bits 0-15)
    db 0x0          ; Base (bits 16-23)
    db 10011010b    ; Access byte
    db 11001111b    ; Flags + Limit (bits 16-19)
    db 0x0          ; Base (bits 24-31)
    
    ; 數據段描述符
    dw 0xFFFF       ; Limit (bits 0-15)
    dw 0x0          ; Base (bits 0-15)
    db 0x0          ; Base (bits 16-23)
    db 10010010b    ; Access byte
    db 11001111b    ; Flags + Limit (bits 16-19)
    db 0x0          ; Base (bits 24-31)
gdt_end:

; GDT 描述符
gdt_descriptor:
    dw gdt_end - gdt_start - 1  ; GDT 大小
    dd gdt_start                ; GDT 地址

; Bootloader 簽名
times 510-($-$$) db 0
dw 0xAA55 