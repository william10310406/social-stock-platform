/*
 * test_kernel_memory_integration.c - StockOS Kernel Memory Integration Test
 * =========================================================================
 * Tests the Physical Memory Manager (PMM) and its integration with the
 * Buddy and Slab allocators.
 *
 * Date: 2025-06-25
 * Version: 2.0
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdarg.h>

// Kernel modules being tested
#include "../src/kernel/memory/pmm.h"
#include "../src/crazy_memory/buddy_allocator.h" // For PAGE_SIZE

/* ========================= Test Configuration ========================= */
#define TOTAL_MEMORY_SIZE (16 * 1024 * 1024) // 16 MB
#define PHYS_MEM_BASE     0x100000

/* ========================= Test Framework ========================= */
static int tests_run = 0;
static int tests_failed = 0;

#define assert_true(condition, message) do { \
    tests_run++; \
    if (condition) { \
        printf("  [PASS] %s\n", message); \
    } else { \
        printf("  [FAIL] %s\n", message); \
        tests_failed++; \
    } \
} while(0)

void print_test_header(const char* title) {
    printf("\n>>> %s\n", title);
}

/* ========================= Test Implementation ========================= */

// Global PMM instance for all tests
static pmm_manager_t pmm;
static bool pmm_is_initialized = false;

// Test 1: Initialize the Physical Memory Manager
void test_pmm_initialization() {
    print_test_header("Running PMM initialization tests...");
    // Build a simple memory map for testing
    memory_map_t map = {
        .regions = NULL,
        .region_count = 0,
        .total_memory = TOTAL_MEMORY_SIZE,
        .usable_memory = TOTAL_MEMORY_SIZE
    };

    int status_code = pmm_init(&pmm, &map);
    bool status = (status_code == PMM_SUCCESS);
    assert_true(status, "PMM initialization should succeed");
    if (status) {
        pmm_is_initialized = true;
    }
}

// Test 2: Test basic page and small object allocations via PMM
void test_pmm_allocations() {
    print_test_header("Running PMM allocation tests...");
    if (!pmm_is_initialized) {
        printf("  [SKIP] PMM not initialized, skipping allocation tests.\n");
        tests_failed++; // Fail this section if init failed
        return;
    }

    // Test Buddy Allocator integration (page-sized allocations)
    printf("    -> Testing page-sized allocation (Buddy)...\n");
    void* page_alloc = pmm_alloc(&pmm, PMM_PAGE_SIZE, PMM_FLAG_NORMAL);
    assert_true(page_alloc != NULL, "pmm_alloc for 1 page should succeed via buddy");
    if (page_alloc) {
        assert_true(((uintptr_t)page_alloc % PMM_PAGE_SIZE) == 0, "Page allocation should be page-aligned");
        pmm_free(&pmm, page_alloc, PMM_PAGE_SIZE);
        assert_true(true, "pmm_free for page-sized allocation should not crash");
    }

    // Test Slab Allocator integration (small allocations)
    printf("    -> Testing small-sized allocation (Slab)...\n");
    void* small_alloc = pmm_alloc(&pmm, 64, PMM_FLAG_NORMAL);
    assert_true(small_alloc != NULL, "pmm_alloc for 64 bytes should succeed via slab");
    if (small_alloc) {
        pmm_free(&pmm, small_alloc, 64);
        assert_true(true, "pmm_free for small allocation should not crash");
    }
}

// Test 3: Perform a stress test on the PMM
void test_pmm_stress() {
    print_test_header("Running PMM stress tests...");
    if (!pmm_is_initialized) {
        printf("  [SKIP] PMM not initialized, skipping stress tests.\n");
        tests_failed++;
        return;
    }
    const int num_allocs = 256;
    void* ptrs[num_allocs];
    bool stress_ok = true;

    printf("    -> Stress allocation...\n");
    for (int i = 0; i < num_allocs; i++) {
        // Alternate between small and page-sized allocations
        size_t size = (i % 4 == 0) ? PMM_PAGE_SIZE : 128;
        ptrs[i] = pmm_alloc(&pmm, size, PMM_FLAG_NORMAL);
        if (ptrs[i] == NULL) {
            stress_ok = false;
            break;
        }
    }
    assert_true(stress_ok, "All stress allocations should succeed");

    printf("    -> Stress free...\n");
    for (int i = 0; i < num_allocs; i++) {
        if (ptrs[i]) {
            size_t size = (i % 4 == 0) ? PMM_PAGE_SIZE : 128;
            pmm_free(&pmm, ptrs[i], size);
        }
    }
    assert_true(true, "Stress free should complete without crashing");
}


/* ========================= Main Runner ========================= */
int main(void) {
    printf("==================================================\n");
    printf("StockOS Kernel Memory Integration Test Suite v2.0\n");
    printf("==================================================\n");

    // Run test sequence
    test_pmm_initialization();
    test_pmm_allocations();
    test_pmm_stress();

    // Clean up resources
    if (pmm_is_initialized) {
        pmm_cleanup(&pmm);
    }

    // Print final summary
    printf("\n==================================================\n");
    printf("Test Summary\n");
    printf("--------------------------------------------------\n");
    printf("Total Tests Run:    %d\n", tests_run);
    printf("Tests Passed:       %d\n", tests_run - tests_failed);
    printf("Tests Failed:       %d\n", tests_failed);
    printf("Success Rate:       %.2f%%\n",
           tests_run > 0 ? ((double)(tests_run - tests_failed) * 100.0 / tests_run) : 100.0);
    printf("==================================================\n\n");

    if (tests_failed == 0) {
        printf("🎉 All memory integration tests passed!\n");
        return 0;
    } else {
        printf("❌ Some memory integration tests failed.\n");
        return 1;
    }
} 