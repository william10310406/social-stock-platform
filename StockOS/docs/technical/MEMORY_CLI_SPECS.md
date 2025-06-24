# Memory CLI MVP – Technical Specifications

**Version:** 0.1 (MVP)  
**Date:** 2025-06-24

## Overview
The Memory CLI provides a user-space command-line interface to interact with StockOS memory subsystems (PMM, Buddy, Slab, CCMS). The MVP focuses on read-only statistics commands.

## Build/Run (user-space)
```bash
make kernel                # builds ./build/stockos_kernel
./build/stockos_kernel      # interactive CLI
printf "meminfo\nexit\n" | ./build/stockos_kernel  # scripted use
```

## Command Table
| Command     | Syntax                      | Description                         |
|-------------|----------------------------|-------------------------------------|
| help        | help                       | List commands                       |
| meminfo     | meminfo                    | Full PMM report via pmm_get_memory_report |
| buddy stat  | buddy stat                 | Buddy allocator counters            |
| slab stat   | slab stat                  | Slab allocator counters             |
| exit        | exit                       | Leave CLI loop                      |

## Extensibility
* **Dispatch**: `dispatch_command()` maps first token to handler.  
* **Argument Parsing**: simple `strtok` with max 16 args; future improvement: quote handling.
* **Adding New Commands**: implement `cli_cmd_xyz(argc,argv)` and add an entry in dispatch.

## File Layout
```
src/kernel/cli/
 └── memory_cli.c      # implementation
src/kernel/entry.c     # user-space entry, initializes PMM + CLI
```

## Thread-Safety
MVP runs single-threaded in user-space; no additional locking is required beyond PMM internal mutexes.

## Future Work
1. **Allocator commands**: `buddy alloc/free`, `slab alloc/free`, generic `alloc` auto route.  
2. **Stress/Test**: `test stress`, `test frag` commands to invoke internal test suites.  
3. **Interactive features**: history, tab-completion (readline), color output.  
4. **Kernel Integration**: reuse same CLI code after booting StockOS in QEMU. 