# Crazy Custom Memory System – Technical Specs

**Version**: 0.1 (MVP)  
**Created**: 2025-06-24  
**Status**: Draft  

---

## 1. Levels
| Level Enum | Purpose | Initial Use |
|------------|---------|-------------|
| `CM_SHORT_TERM` | Fast cache, small objs | malloc backend |
| `CM_WORKING` | Active pages, medium objs | malloc backend |
| `CM_LONG_TERM` | Large blocks, file-backed | malloc backend |
| `CM_SUBCONSCIOUS` | Compressed pool | TBD (zstd) |
| `CM_COLLECTIVE` | Shared pages across nodes | TBD (NUMA/RDMA) |

### 1.1 Backend Mapping (v0.2)
| Level | Allocator |
|-------|-----------|
| SHORT_TERM | Slab (page-size cache) |
| WORKING    | Buddy (power-of-two pages) |
| LONG_TERM  | malloc (TBD: file-backed) |
| SUBCONSCIOUS | malloc (TBD: compressed pool) |
| COLLECTIVE | malloc (TBD: RDMA shared) |

---

## 2. API Semantics
• `cm_alloc(size,lvl)` – allocate from selected pool.  
• `cm_free(ptr,lvl)`  – free back to pool.  
• `cm_get_level_stats(lvl)` – returns counters.  
• Thread-safe – global mutex (future: per-level RW-lock).

Error codes: NULL return => OOM / bad param.

---

## 3. Internals (MVP)
```
static cm_level_stats_t cm_stats[CM_LEVEL_COUNT];
static pthread_mutex_t cm_mutex;
```
Bytes-in-use increments on alloc (size), free doesn't decrement yet – header tracking required in v0.2.

---

## 4. Future Roadmap
1. Per-allocation header → accurate size tracking.  
2. Buddy allocator for WORKING.  
3. Slab/Cache for SHORT_TERM small objs.  
4. Compression pool for SUBCONSCIOUS (lz4/zstd).  
5. RDMA-backed COLLECTIVE pool.  
6. Telemetry hooks to Superconscious alerts when pressure high.

---

## 5. Performance Target (post-Buddy)
| Operation | Target |
|-----------|--------|
| alloc <1 KiB | < 50 µs |
| free <1 KiB | < 50 µs |
| Large alloc  | scalable O(log n) |

---

Maintainer: Core OS Memory Team  
License: MIT 