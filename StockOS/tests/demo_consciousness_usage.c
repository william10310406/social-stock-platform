#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include "../src/consciousness/consciousness_container.h"

int main() {
    printf("\n==== StockOS Consciousness Container Demo ====\n");

    // 1. 創建意識容器
    consciousness_id_t id = 42;
    consciousness_container_t* container = consciousness_container_create(id);
    if (!container) {
        printf("[FAIL] 無法創建意識容器\n");
        return 1;
    }
    printf("[OK] 創建意識容器 (ID: %llu)\n", container->id);

    // 2. 新增一段工作記憶
    const char* work_data = "Hello, this is working memory!";
    conscious_mind_add_working_memory(&container->conscious, (void*)work_data, strlen(work_data) + 1);
    printf("[OK] 新增工作記憶: %s\n", (char*)container->conscious.working_memory.data);

    // 3. 查詢工作記憶內容
    printf("[INFO] 查詢工作記憶內容: %s\n", (char*)container->conscious.working_memory.data);

    // 4. 新增一段前意識記憶並喚醒
    const char* pre_data = "This is a preconscious memory.";
    preconscious_mind_add_memory(&container->preconscious, (void*)pre_data, strlen(pre_data) + 1);
    printf("[OK] 新增前意識記憶: %s\n", pre_data);
    void* recalled = preconscious_mind_recall_memory(&container->preconscious, 0);
    printf("[INFO] 喚醒前意識記憶: %s\n", (char*)recalled);

    // 5. 壓抑一段潛意識記憶並查詢
    const char* repress_data = "This is a repressed memory.";
    personal_unconscious_repress_memory(&container->personal_unconscious, (void*)repress_data, strlen(repress_data) + 1, false);
    printf("[OK] 壓抑記憶: %s\n", repress_data);
    repressed_memory_t* rep = &container->personal_unconscious.repressed.memories[0];
    printf("[INFO] 查詢壓抑記憶內容: %s\n", (char*)rep->memory_data);

    // 6. 切換意識狀態
    consciousness_container_set_state(container, CONSCIOUSNESS_DREAMING);
    printf("[OK] 切換意識狀態為 DREAMING\n");

    // 7. 查詢意識強度與統計
    consciousness_container_update_intensity(container);
    char stats[512] = {0};
    consciousness_container_get_stats(container, stats);
    printf("[INFO] 意識容器統計資訊:\n%s\n", stats);

    // 8. 持久化與還原
    consciousness_container_save(container, "demo_consciousness_save.bin");
    printf("[OK] 持久化意識容器到 demo_consciousness_save.bin\n");
    consciousness_container_t* loaded = consciousness_container_load("demo_consciousness_save.bin");
    if (loaded) {
        printf("[OK] 成功還原意識容器 (ID: %llu, 狀態: %d)\n", loaded->id, loaded->state);
        consciousness_container_destroy(loaded);
    } else {
        printf("[FAIL] 還原意識容器失敗\n");
    }

    // 9. 銷毀容器釋放資源
    consciousness_container_destroy(container);
    printf("[OK] 已釋放意識容器資源\n");

    printf("\n==== Demo 完成！你可以根據這個流程擴充更多功能 ====\n");
    return 0;
} 