# StockOS Memory CLI Commands Database

_Last updated: 2025-06-25_

| Command | Sub-commands / Args | Description |
|---------|--------------------|-------------|
| `help` | – | Show available commands |
| `meminfo` | `[--detail] [--all]` | Print PMM & allocator memory report |
| `history` | `[clear]` | List or clear in-memory command history (64 entries) |
| `buddy` | `stat` | Show buddy allocator stats |
|  | `alloc <pages>` | Allocate N 4 KiB pages via buddy allocator |
|  | `free <idx>` | Free a previously allocated buddy block |
| `slab` | `stat` | Show slab allocator stats |
|  | `alloc <bytes>` | Allocate ≤ 512 B via slab allocator |
|  | `free <idx>` | Free a slab allocation |
| `cat <file>` | – | Print file contents |
| `ls [path]` | – | List files / directories (alias of `ls -al --color=auto`) |
| `mkdir <path ...>` | – | Create one or more directories (`-p`) |
| `cd [path]` | – | Change directory; no arg prints current dir |
| `pwd` | – | Print current working directory |
| `edit <file>` | – | Open file in built-in kilo editor |
| `exit` | – | Leave the CLI |

## Editing Keys / Shortcuts
* `Tab` – autocomplete (lists options on multiple matches)
* `↑ / ↓` – navigate history
* `← / →` – move cursor within line
* `Backspace` – delete char before cursor
* `Delete` (`ESC[3~`) – delete char at cursor

---
This living document tracks CLI commands for quick reference and future expansion. Please update whenever new commands are added. 