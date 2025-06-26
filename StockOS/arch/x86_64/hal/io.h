#ifndef STOCKOS_HAL_IO_H
#define STOCKOS_HAL_IO_H

#include <stdint.h>

/*
 * Hardware Abstraction Layer – x86_64 Port I/O
 * Implementations are in io.S (assembly) to avoid inline-asm
 * compatibility issues between Clang and GCC.
 */

#ifdef __cplusplus
extern "C" {
#endif

#ifdef __x86_64__

uint8_t  hal_inb (uint16_t port);
void     hal_outb(uint16_t port, uint8_t  data);
uint16_t hal_inw (uint16_t port);
void     hal_outw(uint16_t port, uint16_t data);
uint32_t hal_inl (uint16_t port);
void     hal_outl(uint16_t port, uint32_t data);
void     hal_io_wait(void);

#else  /* Non-x86_64 host build stubs */

static inline uint8_t  hal_inb (uint16_t port)                       { (void)port; return 0; }
static inline void     hal_outb(uint16_t port, uint8_t  data)       { (void)port; (void)data; }
static inline uint16_t hal_inw (uint16_t port)                       { (void)port; return 0; }
static inline void     hal_outw(uint16_t port, uint16_t data)       { (void)port; (void)data; }
static inline uint32_t hal_inl (uint16_t port)                       { (void)port; return 0; }
static inline void     hal_outl(uint16_t port, uint32_t data)       { (void)port; (void)data; }
static inline void     hal_io_wait(void)                             { }

#endif /* __x86_64__ */

#ifdef __cplusplus
}
#endif

#endif /* STOCKOS_HAL_IO_H */ 