#ifndef KERNEL_STRING_H
#define KERNEL_STRING_H

#ifdef KERNEL_MODE
#ifndef __SIZE_T_DEFINED__
#define __SIZE_T_DEFINED__
typedef unsigned long size_t;
#endif
#else
#include <stddef.h>
#endif

size_t strlen(const char* str);
int strcmp(const char* s1, const char* s2);
void* memcpy(void* dest, const void* src, size_t n);

#endif /* KERNEL_STRING_H */ 