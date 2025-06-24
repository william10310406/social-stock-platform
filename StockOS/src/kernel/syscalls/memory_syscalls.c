#include "memory_syscalls.h"
#include <stdio.h>

int memory_syscalls_init(void) { return 0; }

// Stub implementations returning not supported
#define NOT_IMPL -100
long sys_balloc(size_t size, uint32_t flags){(void)size;(void)flags;return NOT_IMPL;}
long sys_bfree(void* ptr,size_t size){(void)ptr;(void)size;return NOT_IMPL;}
long sys_salloc(uint32_t cache_id,uint32_t flags){(void)cache_id;(void)flags;return NOT_IMPL;}
long sys_sfree(void* ptr,uint32_t cache_id){(void)ptr;(void)cache_id;return NOT_IMPL;}
long sys_cmalloc(size_t size,uint32_t level){(void)size;(void)level;return NOT_IMPL;}
long sys_cmfree(void* ptr,uint32_t level){(void)ptr;(void)level;return NOT_IMPL;}
long sys_mstat(memory_stat_request_t* req){(void)req;return NOT_IMPL;}
long sys_mmonitor(memory_monitor_request_t* req){(void)req;return NOT_IMPL;}
long sys_mreport(char* buf,size_t sz){(void)buf;(void)sz;return NOT_IMPL;}
long sys_mcheck(void){return NOT_IMPL;}

syscall_result_t handle_memory_syscall(uint32_t no,long args[]){(void)no;(void)args;syscall_result_t r={.result=NOT_IMPL,.error_code=NOT_IMPL,.flags=0};return r;}

bool validate_syscall_params(uint32_t no,long args[]){(void)no;(void)args;return false;}
bool check_syscall_permission(uint32_t no,uint32_t pid){(void)no;(void)pid;return true;}

memory_syscall_stats_t get_memory_syscall_stats(void){memory_syscall_stats_t s={0};return s;}
void reset_memory_syscall_stats(void){} 