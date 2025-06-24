# Bootloader + QEMU Phase Plan (StockOS)

_Date: 2025-06-24_
_Author: AI assistant (o3)_

## 1. Goal
Boot StockOS kernel inside QEMU on x86-64 by packaging the existing user-space kernel (`stockos_kernel`) into a proper multibootable long-mode kernel image via Limine + stivale2.  The CLI prompt should appear on QEMU serial console.

## 2. Major Decisions
| Area | Choice | Rationale |
|------|--------|-----------|
| Bootloader | **Limine** (latest `v4.x` dev) | Actively maintained, supports BIOS & UEFI, simple `limine-install`, friendly to stivale2. |
| Spec | **stivale2** | Modern, extensible tags (SMP, higher-half off, X2APIC), widely adopted. |
| Toolchain | Docker image with `x86_64-elf-gcc`, `nasm`, `limine`, `grub-mkrescue`, `qemu-system-x86_64` | Avoid polluting macOS host; reproducible CI. |
| Console I/O | **Serial (UART to stdio)** | Simplest way to reuse current stdio-based CLI; pass `-serial stdio` to QEMU. |
| Memory map | Use stivale2 MEMMAP tag | Feed directly into current PMM init. |

## 3. Deliverables
1. `boot/` directory
   * `limine/` – git submodule or downloaded release
   * `stage1.asm` – 16/32→64-bit switch, stivale2 header
   * `linker.ld` – kernel layout (2 MiB align, .stivale2hdr section)
   * `limine.cfg` – boot menu (serial enabled)
2. `src/kernel/boot.c` – new entry: `void kmain(struct stivale2_struct*)`
3. Updated Makefile targets
   * `kernel.elf` – cross-link with `linker.ld`
   * `StockOS.iso` – created via `limine-install`
   * `qemu` – run QEMU with serial console
4. Docker development image `docker/dev/Dockerfile`
5. Report (this file) & README for usage.

## 4. Task Breakdown
| # | Task | Files | Owner |
|---|------|-------|-------|
| 1 | Add Limine as git submodule | boot/limine | AI |
| 2 | Write `stage1.asm` & stivale2 header | boot/stage1.asm | AI |
| 3 | Create `linker.ld` | boot/linker.ld | AI |
| 4 | Convert current `entry.c` to `boot.c` with stivale2 structs | src/kernel/boot.c | AI |
| 5 | Dockerfile with all build deps | docker/dev/Dockerfile | AI |
| 6 | Extend top-level Makefile (`make qemu`) | StockOS/Makefile | AI |
| 7 | Docs update (`boot-flow.md`) | docs/architecture | AI |
| 8 | Verify in CI & produce demo GIF | gifs/boot_demo.gif | AI |

## 5. Timeline (estimate)
* Day 1 – Environment & Dockerfile ready; Limine submodule added.
* Day 2 – stage1.asm + linker.ld; kernel builds to ELF; ISO boots to serial stub.
* Day 3 – Hook existing PMM + CLI, memory map parsing; demo prompt.
* Day 4 – Cleanup, docs, CI, push.

## 6. Risks & Mitigations
* **Toolchain mismatch** – use official Archlinux base + pinned versions in Docker.
* **Serial only (no VGA)** – acceptable short-term; GUI future will switch to framebuffer tag.
* **Limine updates** – pin commit hash.

## 7. Next Action
* Create Dockerfile & boot directory scaffolding.
* Add Makefile targets; build empty kernel to confirm QEMU boots.

---
After approval, implementation will begin in branch `phase/bootloader-qemu`. 