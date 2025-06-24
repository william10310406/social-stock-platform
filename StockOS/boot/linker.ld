OUTPUT_FORMAT(elf64-x86-64)
ENTRY(_start)
SECTIONS
{
  . = 2M;
  .stivale2hdr ALIGN(4K) : { *(.stivale2hdr) }
  .text ALIGN(4K) : { *(.text*) }
  .rodata ALIGN(4K) : { *(.rodata*) }
  .data ALIGN(4K) : { *(.data*) }
  .bss ALIGN(4K) : { *(.bss*) *(COMMON) }
  /DISCARD/ : { *(.eh_frame*) }
} 