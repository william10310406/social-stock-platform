; stage1.asm - Limine + stivale2 header (placeholder)
; For now just provide stub to allow build system; real code will be added later.

BITS 64
DEFAULT REL
SECTION .stivale2hdr

stivale2_hdr:
    dq 0                           ; 0 -> stack pointer (filled later)
    dq 0                           ; 8 -> flags
    dq 0                           ; 16 -> framebuffer tag
    dq 0                           ; 24 -> entry point (filled by linker)

SECTION .text
GLOBAL _start
_start:
    hlt 