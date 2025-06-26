#include "serial.h"
#include <stdint.h>

#define COM1 0x3F8

static inline void outb(uint16_t port, uint8_t val) {
    __asm__ volatile ("outb %0, %1" : : "a"(val), "Nd"(port)); /* NOLINT */
}
static inline uint8_t inb(uint16_t port) {
    uint8_t ret;
    __asm__ volatile ("inb %1, %0" : "=a"(ret) : "Nd"(port)); /* NOLINT */
    return ret;
}

void serial_init(void) {
    outb(COM1 + 1, 0x00);    /* Disable all interrupts */
    outb(COM1 + 3, 0x80);    /* Enable DLAB */
    outb(COM1 + 0, 0x03);    /* 38400 baud divisor low byte */
    outb(COM1 + 1, 0x00);    /* divisor high byte */
    outb(COM1 + 3, 0x03);    /* 8 bits, no parity, one stop bit */
    outb(COM1 + 2, 0xC7);    /* Enable FIFO, clear them, 14-byte threshold */
    outb(COM1 + 4, 0x0B);    /* IRQs enabled, RTS/DSR set */
}

void serial_write(char c) {
    while (!(inb(COM1 + 5) & 0x20));
    outb(COM1, (uint8_t)c);
}

void serial_print(const char *s) {
    while (*s) {
        if (*s == '\n') serial_write('\r');
        serial_write(*s++);
    }
}

void log_hex(unsigned long long v) {
    static const char *hex = "0123456789ABCDEF";
    char buf[19] = "0x0000000000000000"; // 0x + 16 nibbles + null
    for (int i = 0; i < 16; i++) {
        buf[17 - i] = hex[v & 0xF];
        v >>= 4;
    }
    serial_print(buf);
    serial_print("\n");
}

int serial_received(void) {
    // Line Status Register bit 0 set if data ready
    return inb(COM1 + 5) & 0x01;
}

char serial_read_char(void) {
    while (!serial_received()) {
        // busy wait; could add pause instruction later
    }
    return (char)inb(COM1);
} 