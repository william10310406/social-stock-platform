// Minimal stub implementations to satisfy linker for bare-metal boot tests
// These will be replaced by real implementations later.

#include <stddef.h>
#include "memory/pmm.h"
#include "serial.h"

int pmm_init(pmm_manager_t* pmm, memory_map_t* map) { (void)pmm; (void)map; return 0; }
void pmm_cleanup(pmm_manager_t* pmm) { (void)pmm; }

int memory_syscalls_init(void) { return 0; }

int memory_cli_init(void) { return 0; }
void memory_cli_cleanup(void) {}
void memory_cli_main_loop(void) {}

static pmm_manager_t* cli_pmm_instance(void) {
    extern pmm_manager_t* kernel_get_pmm(void);
    return kernel_get_pmm();
}

static void cli_print(const char* s) { serial_print(s); }

static void cli_print_uint(size_t v) {
    char buf[32];
    int i=0; if(v==0){buf[i++]='0';}
    size_t t=v; while(t){buf[i++]='0'+(t%10); t/=10;}
    for(int j=i-1;j>=0;j--) serial_write(buf[j]);
}

static int kstrcmp(const char* a, const char* b) {
    while (*a && (*a == *b)) {
        a++; b++;
    }
    return (int)((unsigned char)*a) - (int)((unsigned char)*b);
}

void memory_cli_execute_command(const char* cmd) {
    if(!cmd||!*cmd) return;

    if(kstrcmp(cmd,"help")==0) {
        cli_print("可用指令與說明：\n");
        cli_print("  help       - 顯示此說明\n");
        cli_print("  meminfo / 記憶體資訊  - 顯示記憶體統計\n");
        return;
    }

    if(kstrcmp(cmd,"meminfo")==0) {
        pmm_manager_t* pmm = cli_pmm_instance();
        if(!pmm) { cli_print("PMM not initialized\n"); return; }
        pmm_stats_t st = pmm_get_stats(pmm);
        cli_print("Total frames: "); cli_print_uint(st.total_frames); cli_print("\n");
        cli_print("Free frames : "); cli_print_uint(st.free_frames); cli_print("\n");
        cli_print("Used frames : "); cli_print_uint(st.used_frames); cli_print("\n");
        return;
    }

    cli_print("Unknown command. Type 'help'.\n");
}

// Stub for pmm_get_stats in freestanding kernel build
pmm_stats_t pmm_get_stats(pmm_manager_t* pmm) {
    (void)pmm;
    pmm_stats_t s = {0};
    return s;
} 