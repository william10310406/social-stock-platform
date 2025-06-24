#include "collective_unconscious.h"
#include <stdio.h>
#include <assert.h>

int main() {
    // 建立雲端
    CollectiveUnconsciousCloud* cloud = create_collective_unconscious_cloud("cloud1", "Demo Cloud", false);
    assert(cloud != NULL);

    // 新增記憶
    bool ok = add_cloud_memory(cloud, "這是第一個集體記憶", CLOUD_MEMORY_ARCHETYPE, "userA", 0.8f);
    assert(ok);

    // 查詢記憶
    CloudMemory* mem = retrieve_cloud_memory(cloud, "第一個", CLOUD_MEMORY_ARCHETYPE);
    assert(mem != NULL);
    printf("查詢到記憶內容: %s\n", mem->content);

    // 測試同步網絡
    // 這裡可用 mock 的 consciousness_container_t 結構
    consciousness_container_t fake_container = {0};
    fake_container.id = 12345;
    fake_container.overall_intensity = 0.7f;
    ok = register_consciousness_container(cloud, &fake_container, 0.9f);
    assert(ok);

    // 執行同步
    ok = perform_network_sync(cloud);
    assert(ok);

    // 取得統計
    CloudStats stats = get_cloud_stats(cloud);
    printf("總記憶數: %d, 活躍容器: %d\n", stats.total_memories, stats.active_containers);

    // 銷毀雲端
    destroy_collective_unconscious_cloud(cloud);

    printf("所有測試通過！\n");
    return 0;
}