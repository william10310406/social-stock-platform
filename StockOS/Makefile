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
TEST_SOURCES = $(TEST_DIR)/test_consciousness_container.c
DEMO_SOURCES = $(TEST_DIR)/demo_consciousness_usage.c

# 目標文件
CONSCIOUSNESS_OBJECTS = $(CONSCIOUSNESS_SOURCES:.c=.o)
TEST_OBJECTS = $(TEST_SOURCES:.c=.o)
DEMO_OBJECTS = $(DEMO_SOURCES:.c=.o)

# 可執行文件
TEST_EXECUTABLE = $(BUILD_DIR)/test_consciousness_container
DEMO_EXECUTABLE = $(BUILD_DIR)/demo_consciousness_usage
CONSCIOUSNESS_LIB = $(BUILD_DIR)/libconsciousness.a

# 默認目標
all: build_dir consciousness_lib test_consciousness demo_consciousness

# 創建構建目錄
build_dir:
	@mkdir -p $(BUILD_DIR)
	@echo "📁 Created build directory"

# 編譯意識容器庫
consciousness_lib: build_dir $(CONSCIOUSNESS_OBJECTS)
	@echo "🧠 Building consciousness library..."
	ar rcs $(CONSCIOUSNESS_LIB) $(CONSCIOUSNESS_OBJECTS)
	@echo "✅ Consciousness library built: $(CONSCIOUSNESS_LIB)"

# 編譯測試
test_consciousness: consciousness_lib $(TEST_OBJECTS)
	@echo "🧪 Building consciousness tests..."
	$(CC) $(CFLAGS) $(INCLUDES) $(TEST_OBJECTS) $(CONSCIOUSNESS_LIB) $(LIBS) -o $(TEST_EXECUTABLE)
	@echo "✅ Consciousness tests built: $(TEST_EXECUTABLE)"

# 編譯演示程序
demo_consciousness: consciousness_lib $(DEMO_OBJECTS)
	@echo "🎭 Building consciousness demo..."
	$(CC) $(CFLAGS) $(INCLUDES) $(DEMO_OBJECTS) $(CONSCIOUSNESS_LIB) $(LIBS) -o $(DEMO_EXECUTABLE)
	@echo "✅ Consciousness demo built: $(DEMO_EXECUTABLE)"

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

# 清理
clean:
	@echo "🧹 Cleaning build files..."
	rm -rf $(BUILD_DIR)
	rm -f $(CONSCIOUSNESS_OBJECTS) $(TEST_OBJECTS) $(DEMO_OBJECTS)
	rm -f test_output.log demo_output.log
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
	@echo "StockOS Consciousness Container Build System"
	@echo "============================================="
	@echo ""
	@echo "Available targets:"
	@echo "  all              - Build everything (default)"
	@echo "  consciousness_lib - Build consciousness library only"
	@echo "  test_consciousness - Build tests only"
	@echo "  demo_consciousness - Build demo program only"
	@echo "  test             - Build and run tests"
	@echo "  test_verbose     - Build and run tests with detailed output"
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
	@echo "  help             - Show this help message"
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
.PHONY: all build_dir consciousness_lib test_consciousness demo_consciousness test test_verbose demo demo_verbose clean install uninstall lint analyze docs benchmark memcheck help 