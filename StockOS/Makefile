# StockOS Makefile
# 用於編譯意識容器系統和運行測試

CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -g -O2
INCLUDES = -I./src -I./arch/x86_64/hal
LIBS = -lm
LD = ld.lld

# 目錄
SRC_DIR = src
TEST_DIR = tests
BUILD_DIR = build
DOCS_DIR = docs

# 源文件
CONSCIOUSNESS_SOURCES = $(SRC_DIR)/consciousness/consciousness_container.c
MEMORY_SOURCES = $(SRC_DIR)/crazy_memory/crazy_memory.c $(SRC_DIR)/crazy_memory/buddy_allocator.c $(SRC_DIR)/crazy_memory/slab_allocator.c
KERNEL_MEMORY_SOURCES = $(SRC_DIR)/kernel/memory/pmm.c
KERNEL_SOURCES = $(SRC_DIR)/kernel/kernel.c $(SRC_DIR)/kernel/interactive_kernel.c $(SRC_DIR)/kernel/cli/memory_cli.c $(SRC_DIR)/kernel/entry.c $(SRC_DIR)/kernel/syscalls/memory_syscalls.c

# New: HAL assembly source for port I/O (x86_64)
HAL_SOURCES = arch/x86_64/hal/io.S

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
BOOT_ASM_SOURCES = boot/stivale2_header.S
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

# add variable near top
LIMINE_DIR = ext/limine
ISO_BIOS_SYS = limine-bios.sys
ISO_BIOS_CD  = limine-bios-cd.bin
ISO_EFI_FILE = BOOTX64.EFI

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
	@echo "StockOS 編譯系統 - 可用目標:"
	@echo ""
	@echo "🎯 推薦使用 (多階段系統):"
	@echo "  multi-stage-boot   - 編譯多階段bootloader (Stage1+Stage2)"
	@echo "  multi-stage-floppy - 創建多階段軟盤映像"
	@echo "  qemu-multistage    - QEMU測試多階段系統 ⭐️ 推薦"
	@echo ""
	@echo "基本目標:"
	@echo "  build              - 編譯 StockOS 內核"
	@echo "  clean              - 清理建構文件"
	@echo "  help               - 顯示此幫助"
	@echo ""
	@echo "簡單 Bootloader (512字節限制):"
	@echo "  simple-boot        - 編譯簡單 bootloader"
	@echo "  simple-floppy      - 創建簡單軟盤映像"
	@echo "  qemu-simple        - QEMU 測試簡單版本"
	@echo "  test-simple        - 快速測試簡單版本"
	@echo ""
	@echo "交互式 Bootloader (已棄用):"
	@echo "  interactive-boot   - 編譯交互式 bootloader"
	@echo "  interactive-floppy - 創建交互式軟盤映像"
	@echo "  qemu-interactive   - QEMU 測試交互式系統"
	@echo ""
	@echo "調試目標:"
	@echo "  debug              - 顯示工具版本信息"
	@echo "  test-env           - 測試編譯環境"
	@echo ""
	@echo "💡 快速開始: make qemu-multistage"

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
BOOT_SOURCES = $(SRC_DIR)/kernel/kernel.c $(SRC_DIR)/kernel/lib/string.c $(SRC_DIR)/kernel/stubs.c $(SRC_DIR)/kernel/serial.c $(SRC_DIR)/kernel/idt.c boot/stivale2_header.S

# Pattern rule: compile kernel sources with Clang cross-compiler
$(BUILD_DIR)/%.o: %.c
	@mkdir -p $(dir $@)
	$(CLANG) --target=x86_64-elf -I./src -ffreestanding -DKERNEL_MODE -O2 -mcmodel=kernel -fno-pic -mno-red-zone -mno-mmx -mno-sse -mno-sse2 -c $< -o $@

KERNEL_CLANG_OBJECTS = $(patsubst %.c,$(BUILD_DIR)/%.o,$(patsubst %.S,$(BUILD_DIR)/%.o,$(BOOT_SOURCES)))

kernel.elf: $(KERNEL_CLANG_OBJECTS)
	$(LD) -nostdlib -z max-page-size=0x1000 -T boot/linker.ld -o $(BUILD_DIR)/kernel.elf $(KERNEL_CLANG_OBJECTS)

iso: kernel.elf
	@echo "📦 Creating ISO with Limine (no install)..."
	@mkdir -p $(BUILD_DIR)/iso_root
	cp $(BUILD_DIR)/kernel.elf $(BUILD_DIR)/iso_root/
	cp boot/limine.cfg $(BUILD_DIR)/iso_root/
	cp $(LIMINE_DIR)/$(ISO_BIOS_SYS) $(LIMINE_DIR)/$(ISO_BIOS_CD) $(LIMINE_DIR)/$(ISO_EFI_FILE) $(BUILD_DIR)/iso_root/
	xorriso -as mkisofs \
	    -b $(ISO_BIOS_CD) -no-emul-boot -boot-load-size 4 -boot-info-table \
	    -eltorito-alt-boot -e $(ISO_EFI_FILE) -no-emul-boot \
	    -o $(ISO_NAME) $(BUILD_DIR)/iso_root
	@echo "✅ ISO created: $(ISO_NAME)"

qemu: iso
	qemu-system-x86_64 -cdrom $(ISO_NAME) -m 256M -serial stdio -no-reboot -no-shutdown | cat

# Build Docker image for cross environment
docker-build:
	docker buildx build --platform linux/amd64 -t stockos/dev-x86_64 docker/dev --load

# Build ISO inside Docker cross environment
docker-iso:
	docker run --rm -v "$(CURDIR)":/workspace -w /workspace stockos/dev-x86_64 make iso

# Simple bootloader - 避免複雜工具鏈問題
simple-boot: 
	@echo "🚀 Building simple StockOS bootloader..."
	nasm -f bin boot/simple_boot.asm -o $(BUILD_DIR)/stockos_simple.bin
	@echo "✅ Simple bootloader built: $(BUILD_DIR)/stockos_simple.bin"

# 創建簡單的軟盤映像
simple-floppy: simple-boot
	@echo "💾 Creating bootable floppy image..."
	@mkdir -p $(BUILD_DIR)
	dd if=/dev/zero of=$(BUILD_DIR)/stockos_simple.img bs=1024 count=1440
	dd if=$(BUILD_DIR)/stockos_simple.bin of=$(BUILD_DIR)/stockos_simple.img bs=512 count=1 conv=notrunc
	@echo "✅ Bootable floppy created: $(BUILD_DIR)/stockos_simple.img"

# 使用QEMU運行簡單版本
qemu-simple: simple-floppy
	@echo "🖥️ Running StockOS in QEMU..."
	qemu-system-x86_64 -fda $(BUILD_DIR)/stockos_simple.img -boot a -serial stdio -m 256M

# 創建 ISO 映像檔
simple-iso: simple-boot
	@echo "💿 Creating StockOS ISO image..."
	@mkdir -p $(BUILD_DIR)/iso_root/boot
	cp $(BUILD_DIR)/stockos_simple.bin $(BUILD_DIR)/iso_root/boot/
	@# 創建 El Torito 可啟動 ISO
	mkisofs -o $(BUILD_DIR)/stockos.iso -b boot/stockos_simple.bin -no-emul-boot -boot-load-size 1 -boot-info-table $(BUILD_DIR)/iso_root/
	@echo "✅ ISO created: $(BUILD_DIR)/stockos.iso"

# 使用 ISO 在 QEMU 中運行
qemu-iso: simple-iso  
	@echo "🖥️ Running StockOS from ISO in QEMU..."
	qemu-system-x86_64 -cdrom $(BUILD_DIR)/stockos.iso -boot d -serial stdio -m 256M

# 交互式 Bootloader 目標
interactive-boot:
	@echo "編譯交互式 StockOS Bootloader..."
	@mkdir -p $(BUILD_DIR)
	nasm -f bin boot/enhanced_simple.asm -o $(BUILD_DIR)/$(INTERACTIVE_NAME).bin
	@echo "成功創建: $(BUILD_DIR)/$(INTERACTIVE_NAME).bin"

interactive-floppy: interactive-boot
	@echo "創建交互式軟盤映像..."
	dd if=/dev/zero of=$(BUILD_DIR)/$(INTERACTIVE_NAME).img bs=1024 count=1440 status=none
	dd if=$(BUILD_DIR)/$(INTERACTIVE_NAME).bin of=$(BUILD_DIR)/$(INTERACTIVE_NAME).img conv=notrunc status=none
	@echo "成功創建: $(BUILD_DIR)/$(INTERACTIVE_NAME).img"

interactive-iso: interactive-boot
	@echo "創建交互式 ISO 映像..."
	@mkdir -p $(ISO_DIR)/boot
	cp $(BUILD_DIR)/$(INTERACTIVE_NAME).bin $(ISO_DIR)/boot/
	mkisofs -b boot/$(INTERACTIVE_NAME).bin -no-emul-boot -boot-load-size 4 \
	        -A "StockOS Interactive" -input-charset iso8859-1 -quiet \
	        -boot-info-table -o $(BUILD_DIR)/stockos_interactive.iso $(ISO_DIR)
	@echo "成功創建: $(BUILD_DIR)/stockos_interactive.iso"

# QEMU 測試目標
qemu-interactive: interactive-floppy
	@echo "啟動 StockOS 交互式系統 (軟盤)..."
	qemu-system-x86_64 -fda $(BUILD_DIR)/$(INTERACTIVE_NAME).img -boot a

qemu-interactive-iso: interactive-iso
	@echo "啟動 StockOS 交互式系統 (ISO)..."
	qemu-system-x86_64 -cdrom $(BUILD_DIR)/stockos_interactive.iso -boot d 

# 多階段 Bootloader 系統
multi-stage-boot:
	@echo "🚀 編譯多階段 StockOS Bootloader 系統..."
	@mkdir -p $(BUILD_DIR)
	
	# Stage 1: 512字節載入器
	@echo "  📁 Stage 1: 編譯512字節載入器..."
	nasm -f bin boot/stage1_loader.asm -o $(BUILD_DIR)/stage1.bin
	
	# Stage 2: 10KB交互系統
	@echo "  📁 Stage 2: 編譯10KB交互系統..."
	nasm -f bin boot/stage2_interactive.asm -o $(BUILD_DIR)/stage2.bin
	
	@echo "✅ 多階段系統編譯完成!"

# 編譯交互式內核為平面二進制文件
interactive-kernel-flat: consciousness_lib memory_lib
	@echo "🧠 編譯交互式內核..."
	@mkdir -p $(BUILD_DIR)
	
	# 編譯交互式內核和依賴
	$(CC) $(CFLAGS) $(INCLUDES) -c $(SRC_DIR)/kernel/interactive_kernel.c -o $(BUILD_DIR)/interactive_kernel.o
	$(CC) $(CFLAGS) $(INCLUDES) -c $(SRC_DIR)/kernel/lib/string.c -o $(BUILD_DIR)/string.o
	$(CC) $(CFLAGS) $(INCLUDES) -c $(SRC_DIR)/kernel/stubs.c -o $(BUILD_DIR)/stubs.o
	
	# 鏈接成平面二進制
	$(LD) -Ttext 0x100000 --oformat binary -o $(BUILD_DIR)/interactive_kernel_flat.bin \
		$(BUILD_DIR)/interactive_kernel.o $(BUILD_DIR)/string.o $(BUILD_DIR)/stubs.o \
		$(SRC_DIR)/kernel/cli/memory_cli.o $(SRC_DIR)/kernel/memory/pmm.o \
		$(CONSCIOUSNESS_LIB) $(MEMORY_LIB)
	
	@echo "✅ 交互式內核編譯完成: $(BUILD_DIR)/interactive_kernel_flat.bin"

multi-stage-floppy: multi-stage-boot
	@echo "🖱️ 創建多階段軟盤映像 (含C Kernel)..."
	
	# 創建1.44MB軟盤映像
	dd if=/dev/zero of=$(BUILD_DIR)/stockos_multistage.img bs=512 count=2880 status=none
	
	# 寫入Stage 1到第一個扇區
	dd if=$(BUILD_DIR)/stage1.bin of=$(BUILD_DIR)/stockos_multistage.img bs=512 count=1 conv=notrunc status=none
	
	# 寫入Stage 2從第二個扇區開始 (扇區2-20)
	dd if=$(BUILD_DIR)/stage2.bin of=$(BUILD_DIR)/stockos_multistage.img bs=512 seek=1 conv=notrunc status=none
	
	# C Kernel 暫時跳過，使用 Stage 2 內建功能
	
	@echo "✅ 軟盤映像創建完成: $(BUILD_DIR)/stockos_multistage.img"

# QEMU 測試多階段系統
qemu-multistage: multi-stage-floppy
	@echo "🖥️ 啟動多階段 StockOS 交互系統..."
	qemu-system-x86_64 -fda $(BUILD_DIR)/stockos_multistage.img -boot a -m 64M

# 測試原始簡單版本
test-simple: simple-floppy
	@echo "🖥️ 測試簡單版本..."
	qemu-system-x86_64 -fda $(BUILD_DIR)/$(SIMPLE_NAME).img -boot a -m 64M

# 更新幫助目標
help:
	@echo "StockOS 編譯系統 - 可用目標:"
	@echo ""
	@echo "🎯 推薦使用 (多階段系統):"
	@echo "  multi-stage-boot   - 編譯多階段bootloader (Stage1+Stage2)"
	@echo "  multi-stage-floppy - 創建多階段軟盤映像"
	@echo "  qemu-multistage    - QEMU測試多階段系統 ⭐️ 推薦"
	@echo ""
	@echo "基本目標:"
	@echo "  build              - 編譯 StockOS 內核"
	@echo "  clean              - 清理建構文件"
	@echo "  help               - 顯示此幫助"
	@echo ""
	@echo "簡單 Bootloader (512字節限制):"
	@echo "  simple-boot        - 編譯簡單 bootloader"
	@echo "  simple-floppy      - 創建簡單軟盤映像"
	@echo "  qemu-simple        - QEMU 測試簡單版本"
	@echo "  test-simple        - 快速測試簡單版本"
	@echo ""
	@echo "交互式 Bootloader (已棄用):"
	@echo "  interactive-boot   - 編譯交互式 bootloader"
	@echo "  interactive-floppy - 創建交互式軟盤映像"
	@echo "  qemu-interactive   - QEMU 測試交互式系統"
	@echo ""
	@echo "調試目標:"
	@echo "  debug              - 顯示工具版本信息"
	@echo "  test-env           - 測試編譯環境"
	@echo ""
	@echo "💡 快速開始: make qemu-multistage"

.PHONY: multi-stage-boot multi-stage-floppy qemu-multistage test-simple help

# Pattern rule to build assembly sources (*.S) with the host compiler (supports preprocessing)
$(BUILD_DIR)/%.o: %.S
	@mkdir -p $(dir $@)
	$(CLANG) --target=x86_64-elf -c $< -o $@ 

# ------------------------------------------------------------
# 🖥️  User-space Memory CLI (no QEMU required)
# ------------------------------------------------------------
CLI_EXECUTABLE = $(BUILD_DIR)/stockos_cli
KILO_SRC = $(SRC_DIR)/apps/kilo/kilo.c
KILO_OBJ = $(KILO_SRC:.c=.o)
KILO_EXECUTABLE = $(BUILD_DIR)/kilo

$(KILO_OBJ): %.o: %.c | build_dir
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

kilo: $(KILO_OBJ)
	@echo "📝 Building kilo editor..."
	$(CC) $(CFLAGS) $(INCLUDES) $(KILO_OBJ) -o $(KILO_EXECUTABLE)
	@echo "✅ Kilo built: $(KILO_EXECUTABLE)"

CLI_OBJS = $(BUILD_DIR)/entry_cli.o $(SRC_DIR)/kernel/cli/memory_cli.o

cli: consciousness_lib memory_lib kilo $(CLI_OBJS)
	@echo "🖥️  Building StockOS user-space Memory CLI..."
	$(CC) $(CFLAGS) $(INCLUDES) $(CLI_OBJS) $(CONSCIOUSNESS_LIB) $(MEMORY_LIB) $(LIBS) -o $(CLI_EXECUTABLE)
	@echo "✅ Memory CLI built: $(CLI_EXECUTABLE)"
	@echo "👉  Run it with: $(CLI_EXECUTABLE)" 