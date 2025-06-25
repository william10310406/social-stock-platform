# StockOS Makefile
# 用於編譯意識容器系統和運行測試

CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -g -O2
INCLUDES = -I./src
LIBS = -lm

# 目錄
SRC_DIR = src
TEST_DIR = tests
BUILD_DIR = build
DOCS_DIR = docs

# 源文件
CONSCIOUSNESS_SOURCES = $(SRC_DIR)/consciousness/consciousness_container.c
MEMORY_SOURCES = $(SRC_DIR)/crazy_memory/crazy_memory.c $(SRC_DIR)/crazy_memory/buddy_allocator.c $(SRC_DIR)/crazy_memory/slab_allocator.c
KERNEL_MEMORY_SOURCES = $(SRC_DIR)/kernel/memory/pmm.c
KERNEL_SOURCES = $(SRC_DIR)/kernel/kernel.c $(SRC_DIR)/kernel/cli/memory_cli.c $(SRC_DIR)/kernel/entry.c $(SRC_DIR)/kernel/syscalls/memory_syscalls.c

# 測試源文件
TEST_CONSCIOUSNESS_SOURCES = $(TEST_DIR)/test_consciousness_container.c
TEST_CONSCIOUSNESS_OBJECTS = $(TEST_CONSCIOUSNESS_SOURCES:.c=.o)

TEST_MEMORY_SOURCES = $(TEST_DIR)/test_kernel_memory_integration.c
TEST_MEMORY_OBJECTS = $(TEST_MEMORY_SOURCES:.c=.o)

DEMO_SOURCES = $(TEST_DIR)/demo_consciousness_usage.c

# 目標文件
CONSCIOUSNESS_OBJECTS = $(CONSCIOUSNESS_SOURCES:.c=.o)
MEMORY_OBJECTS = $(MEMORY_SOURCES:.c=.o)
KERNEL_MEMORY_OBJECTS = $(KERNEL_MEMORY_SOURCES:.c=.o)
KERNEL_OBJECTS = $(KERNEL_SOURCES:.c=.o)
TEST_OBJECTS = $(TEST_CONSCIOUSNESS_OBJECTS) $(TEST_MEMORY_OBJECTS)
DEMO_OBJECTS = $(DEMO_SOURCES:.c=.o)

# 可執行文件
TEST_EXECUTABLE = $(BUILD_DIR)/test_consciousness_container
TEST_KERNEL_MEMORY = $(BUILD_DIR)/test_kernel_memory_integration
DEMO_EXECUTABLE = $(BUILD_DIR)/demo_consciousness_usage
CONSCIOUSNESS_LIB = $(BUILD_DIR)/libconsciousness.a
MEMORY_LIB = $(BUILD_DIR)/libmemory.a
KERNEL_EXECUTABLE = $(BUILD_DIR)/stockos_kernel

# 默認目標
all: build_dir memory_lib consciousness_lib test_consciousness demo_consciousness test_kernel_memory

# 創建構建目錄
build_dir:
	@mkdir -p $(BUILD_DIR)
	@echo "📁 Created build directory"

# 編譯記憶體庫
memory_lib: build_dir $(MEMORY_OBJECTS) $(KERNEL_MEMORY_OBJECTS)
	@echo "💾 Building memory library..."
	ar rcs $(MEMORY_LIB) $(MEMORY_OBJECTS) $(KERNEL_MEMORY_OBJECTS)
	@echo "✅ Memory library built: $(MEMORY_LIB)"

# 編譯意識容器庫
consciousness_lib: build_dir $(CONSCIOUSNESS_OBJECTS)
	@echo "🧠 Building consciousness library..."
	ar rcs $(CONSCIOUSNESS_LIB) $(CONSCIOUSNESS_OBJECTS)
	@echo "✅ Consciousness library built: $(CONSCIOUSNESS_LIB)"

# 編譯測試
test_consciousness: consciousness_lib memory_lib $(TEST_CONSCIOUSNESS_OBJECTS)
	@echo "🧪 Building consciousness tests..."
	$(CC) $(CFLAGS) $(INCLUDES) $(TEST_CONSCIOUSNESS_OBJECTS) $(CONSCIOUSNESS_LIB) $(MEMORY_LIB) $(LIBS) -o $(TEST_EXECUTABLE)
	@echo "✅ Consciousness tests built: $(TEST_EXECUTABLE)"

# 編譯演示程序
demo_consciousness: consciousness_lib $(DEMO_OBJECTS)
	@echo "🎭 Building consciousness demo..."
	$(CC) $(CFLAGS) $(INCLUDES) $(DEMO_OBJECTS) $(CONSCIOUSNESS_LIB) $(LIBS) -o $(DEMO_EXECUTABLE)
	@echo "✅ Consciousness demo built: $(DEMO_EXECUTABLE)"

# 編譯內核記憶體測試
test_kernel_memory: memory_lib consciousness_lib $(TEST_MEMORY_OBJECTS)
	@echo "🧪 Building kernel memory integration test..."
	$(CC) $(CFLAGS) $(INCLUDES) $(TEST_MEMORY_OBJECTS) $(MEMORY_LIB) $(CONSCIOUSNESS_LIB) $(LIBS) -o $(TEST_KERNEL_MEMORY)
	@echo "✅ Kernel memory test built: $(TEST_KERNEL_MEMORY)"

# 編譯完整內核 (簡化版，僅用於測試)
kernel: memory_lib consciousness_lib $(KERNEL_OBJECTS)
	@echo "🖥️ Building StockOS kernel..."
	$(CC) $(CFLAGS) $(INCLUDES) $(KERNEL_OBJECTS) $(MEMORY_LIB) $(CONSCIOUSNESS_LIB) $(LIBS) -o $(KERNEL_EXECUTABLE)
	@echo "✅ StockOS kernel built: $(KERNEL_EXECUTABLE)"

# 運行測試
test: test_consciousness
	@echo "🚀 Running consciousness container tests..."
	@$(TEST_EXECUTABLE)

# 運行測試並顯示詳細輸出
test_verbose: test_consciousness
	@echo "🚀 Running consciousness container tests (verbose)..."
	@$(TEST_EXECUTABLE) 2>&1 | tee test_output.log

# 運行演示程序
demo: demo_consciousness
	@echo "🎭 Running consciousness container demo..."
	@$(DEMO_EXECUTABLE)

# 運行演示程序並顯示詳細輸出
demo_verbose: demo_consciousness
	@echo "🎭 Running consciousness container demo (verbose)..."
	@$(DEMO_EXECUTABLE) 2>&1 | tee demo_output.log

# 運行內核記憶體測試
test_memory: test_kernel_memory
	@echo "🧪 Running kernel memory integration tests..."
	@$(TEST_KERNEL_MEMORY)

# 運行內核記憶體測試 (詳細模式)
test_memory_verbose: test_kernel_memory
	@echo "🧪 Running kernel memory integration tests (verbose)..."
	@$(TEST_KERNEL_MEMORY) -v 2>&1 | tee memory_test_output.log

# 運行所有測試
test_all: test test_memory
	@echo "✅ All tests completed"

# 清理
clean:
	@echo "🧹 Cleaning build files..."
	rm -rf $(BUILD_DIR)
	rm -f $(CONSCIOUSNESS_OBJECTS) $(MEMORY_OBJECTS) $(KERNEL_MEMORY_OBJECTS) $(KERNEL_OBJECTS) $(TEST_CONSCIOUSNESS_OBJECTS) $(TEST_MEMORY_OBJECTS) $(DEMO_OBJECTS)
	rm -f test_output.log demo_output.log memory_test_output.log
	@echo "✅ Clean complete"

# 安裝（如果需要）
install: consciousness_lib
	@echo "📦 Installing consciousness library..."
	@mkdir -p /usr/local/lib
	@mkdir -p /usr/local/include/stockos
	cp $(CONSCIOUSNESS_LIB) /usr/local/lib/
	cp $(SRC_DIR)/consciousness/consciousness_container.h /usr/local/include/stockos/
	@echo "✅ Installation complete"

# 卸載
uninstall:
	@echo "🗑️ Uninstalling consciousness library..."
	rm -f /usr/local/lib/libconsciousness.a
	rm -f /usr/local/include/stockos/consciousness_container.h
	@echo "✅ Uninstallation complete"

# 檢查代碼風格
lint:
	@echo "🔍 Running code linting..."
	@if command -v clang-format >/dev/null 2>&1; then \
		clang-format --style=Google -i $(SRC_DIR)/consciousness/*.c $(SRC_DIR)/consciousness/*.h $(TEST_DIR)/*.c; \
		echo "✅ Code formatting complete"; \
	else \
		echo "⚠️ clang-format not found, skipping formatting"; \
	fi

# 靜態分析
analyze: consciousness_lib
	@echo "🔬 Running static analysis..."
	@if command -v cppcheck >/dev/null 2>&1; then \
		cppcheck --enable=all --std=c99 $(SRC_DIR)/consciousness/ $(TEST_DIR)/; \
		echo "✅ Static analysis complete"; \
	else \
		echo "⚠️ cppcheck not found, skipping static analysis"; \
	fi

# 生成文檔
docs:
	@echo "📚 Generating documentation..."
	@mkdir -p $(DOCS_DIR)
	@if command -v doxygen >/dev/null 2>&1; then \
		doxygen Doxyfile 2>/dev/null || echo "⚠️ Doxygen configuration not found"; \
		echo "✅ Documentation generated"; \
	else \
		echo "⚠️ Doxygen not found, skipping documentation generation"; \
	fi

# 性能測試
benchmark: test_consciousness
	@echo "⚡ Running performance benchmarks..."
	@time $(TEST_EXECUTABLE) > /dev/null 2>&1
	@echo "✅ Benchmark complete"

# 記憶體檢查
memcheck: test_consciousness
	@echo "🔍 Running memory check..."
	@if command -v valgrind >/dev/null 2>&1; then \
		valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes $(TEST_EXECUTABLE); \
		echo "✅ Memory check complete"; \
	else \
		echo "⚠️ Valgrind not found, skipping memory check"; \
	fi

# 幫助
help:
	@echo "StockOS Kernel Memory Management Build System"
	@echo "=============================================="
	@echo ""
	@echo "Available targets:"
	@echo "  all              - Build everything (default)"
	@echo "  memory_lib       - Build memory management library"
	@echo "  consciousness_lib - Build consciousness library"
	@echo "  kernel           - Build StockOS kernel"
	@echo "  test_consciousness - Build consciousness tests"
	@echo "  test_kernel_memory - Build kernel memory tests"
	@echo "  demo_consciousness - Build demo program"
	@echo "  test             - Build and run consciousness tests"
	@echo "  test_memory      - Build and run kernel memory tests"
	@echo "  test_all         - Run all tests"
	@echo "  test_verbose     - Run consciousness tests with detailed output"
	@echo "  test_memory_verbose - Run memory tests with detailed output"
	@echo "  demo             - Build and run demo program"
	@echo "  demo_verbose     - Build and run demo with detailed output"
	@echo "  clean            - Remove all build files"
	@echo "  install          - Install library to system"
	@echo "  uninstall        - Remove library from system"
	@echo "  lint             - Format code with clang-format"
	@echo "  analyze          - Run static analysis with cppcheck"
	@echo "  docs             - Generate documentation with Doxygen"
	@echo "  benchmark        - Run performance benchmarks"
	@echo "  memcheck         - Run memory leak detection"
	@echo "  docker-build     - Build cross-compile Docker image"
	@echo "  iso              - Build bootable StockOS.iso (Limine)"
	@echo "  qemu             - Run ISO in QEMU (serial console)"
	@echo ""
	@echo "🚀 Quick Start for Kernel Memory Testing:"
	@echo "  make test_memory  - Test the integrated memory system"
	@echo "  make kernel       - Build the StockOS kernel"
	@echo ""
	@echo "Environment variables:"
	@echo "  CC               - C compiler (default: gcc)"
	@echo "  CFLAGS           - Compiler flags"
	@echo "  BUILD_DIR        - Build directory (default: build)"

# 通用編譯規則
%.o: %.c
	@echo "🔨 Compiling $<..."
	@$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

# 依賴關係
$(SRC_DIR)/consciousness/consciousness_container.o: $(SRC_DIR)/consciousness/consciousness_container.h
$(TEST_DIR)/test_consciousness_container.o: $(SRC_DIR)/consciousness/consciousness_container.h
$(TEST_DIR)/demo_consciousness_usage.o: $(SRC_DIR)/consciousness/consciousness_container.h

# 偽目標
.PHONY: all build_dir memory_lib consciousness_lib kernel test_consciousness test_kernel_memory demo_consciousness test test_memory test_all test_verbose test_memory_verbose demo demo_verbose clean install uninstall lint analyze docs benchmark memcheck help

# ---------------- Bootloader / ISO / QEMU ----------------
ISO_NAME = StockOS.iso
ASM = nasm
CLANG = clang

# Minimal kernel sources for bare-metal ISO (exclude user-space helpers)
BOOT_SOURCES = $(SRC_DIR)/kernel/kernel.c

# Pattern rule: compile kernel sources with Clang cross-compiler
$(BUILD_DIR)/%.o: %.c
	@mkdir -p $(dir $@)
	$(CLANG) --target=x86_64-elf -I./src -ffreestanding -DKERNEL_MODE -O2 -c $< -o $@

KERNEL_CLANG_OBJECTS = $(patsubst %.c,$(BUILD_DIR)/%.o,$(BOOT_SOURCES))

kernel.elf: boot/stage1.asm $(KERNEL_CLANG_OBJECTS)
	$(ASM) -f elf64 boot/stage1.asm -o $(BUILD_DIR)/stage1.o
	$(CLANG) --target=x86_64-elf -T boot/linker.ld -nostdlib -ffreestanding -Wl,-z,max-page-size=0x200000 -o $(BUILD_DIR)/kernel.elf $(BUILD_DIR)/stage1.o $(KERNEL_CLANG_OBJECTS)

iso: kernel.elf
	cp $(BUILD_DIR)/kernel.elf boot/kernel.elf
	cp boot/limine.cfg build/
	/opt/limine/limine-install build
	mv build/image.iso $(ISO_NAME)
	@echo "✅ ISO created: $(ISO_NAME)"

qemu: iso
	qemu-system-x86_64 -cdrom $(ISO_NAME) -m 256M -serial stdio -no-reboot -no-shutdown | cat

# Build Docker image for cross environment
docker-build:
	docker build -t stockos/dev-x86_64 docker/dev 