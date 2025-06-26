#include "idt.h"
#include "serial.h"

struct idt_entry {
    uint16_t offset_low;
    uint16_t selector;
    uint8_t  ist;
    uint8_t  type_attr;
    uint16_t offset_mid;
    uint32_t offset_high;
    uint32_t zero;
} __attribute__((packed));

struct idt_ptr {
    uint16_t limit;
    uint64_t base;
} __attribute__((packed));

static struct idt_entry idt[256];

static void set_gate(int vec, void *handler) {
    uint64_t addr = (uint64_t)handler;
    idt[vec].offset_low  = addr & 0xFFFF;
    idt[vec].selector    = 0x08; // kernel code
    idt[vec].ist         = 0;
    idt[vec].type_attr   = 0x8E; // present, interrupt gate
    idt[vec].offset_mid  = (addr >> 16) & 0xFFFF;
    idt[vec].offset_high = (addr >> 32) & 0xFFFFFFFF;
    idt[vec].zero        = 0;
}

__attribute__((interrupt))
void fault_handler(void *frame) {
    (void)frame;
    LOG("=== CPU EXCEPTION ===\n");
    asm volatile ("cli");
    while (1) asm volatile ("hlt");
}

extern void *isr_stub_table[32];

void idt_init(void) {
    for (int i = 0; i < 32; i++) {
        set_gate(i, fault_handler);
    }
    struct idt_ptr ptr = {
        .limit = sizeof(idt) - 1,
        .base  = (uint64_t)idt
    };
    asm volatile ("lidt %0" : : "m"(ptr));
} 