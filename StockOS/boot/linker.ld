OUTPUT_FORMAT(elf64-x86-64)
ENTRY(_start)

/* Higher-half kernel linker script for Limine/Stivale2 */

PHDRS
{
  text   PT_LOAD FLAGS((1 << 0) | (1 << 2));      /* R X */
  rodata PT_LOAD FLAGS((1 << 2));                 /* R   */
  data   PT_LOAD FLAGS((1 << 0) | (1 << 1) | (1 << 2)); /* R W */
}

SECTIONS
{
  /* link virtual addresses at 0xFFFFFFFF80000000 */
  . = 0xffffffff80000000;

  /* Stivale2 header – keep so linker does not discard */
  .stivale2hdr : AT(ADDR(.stivale2hdr) - 0xffffffff80000000) {
    KEEP(*(.stivale2hdr))
  } :text

  /* Ensure next segment starts on fresh 4 KiB page */
  . = ALIGN(CONSTANT(MAXPAGESIZE));

  /* Code */
  .text : AT(ADDR(.text) - 0xffffffff80000000) {
    *(.text*)
    *(.gnu.linkonce.t*)
  } :text

  /* New page for rodata (R) */
  . = ALIGN(CONSTANT(MAXPAGESIZE));

  /* Read-only data */
  .rodata : AT(ADDR(.rodata) - 0xffffffff80000000) {
    *(.rodata*)
    *(.gnu.linkonce.r*)
  } :rodata

  /* New page for RW data */
  . = ALIGN(CONSTANT(MAXPAGESIZE));

  /* Writable data */
  .data : AT(ADDR(.data) - 0xffffffff80000000) {
    *(.data*)
    *(.gnu.linkonce.d*)
  } :data

  /* New page for BSS shares perms with data so optional, but keep alignment */
  . = ALIGN(CONSTANT(MAXPAGESIZE));

  /* BSS */
  .bss : AT(ADDR(.bss) - 0xffffffff80000000) {
    *(.bss*)
    *(COMMON)
    *(.gnu.linkonce.b*)
  } :data

  /DISCARD/ : {
    *(.eh_frame*)
    *(.note*)
    *(.comment*)
  }
} 