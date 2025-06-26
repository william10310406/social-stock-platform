.section .stivale2hdr,"a"
.globl _stivale2_header
_stivale2_header:
    .quad 0x73747632
    .quad _start
    .quad stack_top
    .quad 1
    .quad hhdm_tag
    .zero 32

    .align 16
hhdm_tag:
    .quad 0xB0ED257E6AB0A0A0  # HHDM request tag ID
    .quad 0                   # next = 0 (end)
    .quad 0                   # flags

.section .text
.globl _start
_start:
    mov $stack_top, %rsp
    lea stivale2_info(%rip), %rax
    mov %rdi, (%rax)
    call kernel_main
1:  hlt
    jmp 1b

.section .bss
.align 16
stack:
    .zero 16384
stack_top: 

.extern stivale2_info 