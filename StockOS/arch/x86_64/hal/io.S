#ifdef __x86_64__
.intel_syntax noprefix
.section .text
.global hal_inb
.type hal_inb, @function
hal_inb:
    mov dx, di          # port -> DX
    in al, dx
    movzx eax, al
    ret

.global hal_outb
.type hal_outb, @function
hal_outb:
    mov dx, di          # port
    mov al, sil         # data
    out dx, al
    ret

.global hal_inw
.type hal_inw, @function
hal_inw:
    mov dx, di
    in ax, dx
    movzx eax, ax
    ret

.global hal_outw
.type hal_outw, @function
hal_outw:
    mov dx, di
    mov ax, si
    out dx, ax
    ret

.global hal_inl
.type hal_inl, @function
hal_inl:
    mov dx, di
    in eax, dx
    ret

.global hal_outl
.type hal_outl, @function
hal_outl:
    mov dx, di
    mov eax, esi
    out dx, eax
    ret

.global hal_io_wait
.type hal_io_wait, @function
hal_io_wait:
    out 0x80, al
    ret
#endif 