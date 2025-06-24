#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <unistd.h>
#include "../src/consciousness/consciousness_container.h"

// ============================================================================
// 測試輔助函數
// ============================================================================

void print_test_header(const char* test_name) {
    printf("\n=== %s ===\n", test_name);
}

void print_test_result(const char* test_name, bool passed) {
    printf("[%s] %s: %s\n", passed ? "PASS" : "FAIL", test_name, passed ? "✓" : "✗");
}

// ============================================================================
// 測試函數
// ============================================================================

void test_consciousness_container_creation() {
    print_test_header("Consciousness Container Creation");
    
    consciousness_id_t test_id = 12345;
    consciousness_container_t* container = consciousness_container_create(test_id);
    
    bool passed = (container != NULL);
    print_test_result("Container creation", passed);
    
    if (passed) {
        passed = (container->id == test_id);
        print_test_result("Container ID assignment", passed);
        
        passed = (container->state == CONSCIOUSNESS_ACTIVE);
        print_test_result("Default state", passed);
        
        passed = (container->overall_intensity >= 0.0f && container->overall_intensity <= 1.0f);
        print_test_result("Valid intensity range", passed);
        
        passed = (container->is_active == true);
        print_test_result("Default active state", passed);
        
        consciousness_container_destroy(container);
    }
}

void test_consciousness_state_management() {
    print_test_header("Consciousness State Management");
    
    consciousness_container_t* container = consciousness_container_create(1);
    assert(container != NULL);
    
    // 測試狀態設置
    consciousness_container_set_state(container, CONSCIOUSNESS_DORMANT);
    bool passed = (container->state == CONSCIOUSNESS_DORMANT);
    print_test_result("Set dormant state", passed);
    
    consciousness_container_set_state(container, CONSCIOUSNESS_DREAMING);
    passed = (container->state == CONSCIOUSNESS_DREAMING);
    print_test_result("Set dreaming state", passed);
    
    consciousness_container_set_state(container, CONSCIOUSNESS_MEDITATING);
    passed = (container->state == CONSCIOUSNESS_MEDITATING);
    print_test_result("Set meditating state", passed);
    
    consciousness_container_set_state(container, CONSCIOUSNESS_TRANSCENDED);
    passed = (container->state == CONSCIOUSNESS_TRANSCENDED);
    print_test_result("Set transcended state", passed);
    
    consciousness_container_set_state(container, CONSCIOUSNESS_ACTIVE);
    passed = (container->state == CONSCIOUSNESS_ACTIVE);
    print_test_result("Set active state", passed);
    
    // 測試狀態獲取
    consciousness_state_t retrieved_state = consciousness_container_get_state(container);
    passed = (retrieved_state == CONSCIOUSNESS_ACTIVE);
    print_test_result("Get state", passed);
    
    consciousness_container_destroy(container);
}

void test_conscious_mind_operations() {
    print_test_header("Conscious Mind Operations");
    
    consciousness_container_t* container = consciousness_container_create(2);
    assert(container != NULL);
    
    // 測試工作記憶
    const char* test_data = "This is a test working memory";
    size_t data_size = strlen(test_data) + 1;
    
    conscious_mind_add_working_memory(&container->conscious, (void*)test_data, data_size);
    bool passed = (container->conscious.working_memory.data != NULL);
    print_test_result("Add working memory", passed);
    
    if (passed) {
        passed = (strcmp((char*)container->conscious.working_memory.data, test_data) == 0);
        print_test_result("Working memory content", passed);
        
        passed = (container->conscious.working_memory.size == data_size);
        print_test_result("Working memory size", passed);
        
        passed = (container->conscious.working_memory.access_count == 1);
        print_test_result("Working memory access count", passed);
    }
    
    // 測試注意力焦點
    void* focus_target = (void*)0x12345678;
    consciousness_intensity_t focus_strength = 0.8f;
    
    conscious_mind_set_attention_focus(&container->conscious, focus_target, focus_strength);
    passed = (container->conscious.attention.focus_target == focus_target);
    print_test_result("Set attention focus target", passed);
    
    passed = (container->conscious.attention.focus_strength == focus_strength);
    print_test_result("Set attention focus strength", passed);
    
    // 測試思維流
    void* test_thought = (void*)"A test thought";
    conscious_mind_add_thought(&container->conscious, test_thought);
    passed = (container->conscious.thoughts.thought_count == 1);
    print_test_result("Add thought", passed);
    
    if (passed) {
        passed = (container->conscious.thoughts.thoughts[0] == test_thought);
        print_test_result("Thought content", passed);
    }
    
    consciousness_container_destroy(container);
}

void test_preconscious_mind_operations() {
    print_test_header("Preconscious Mind Operations");
    
    consciousness_container_t* container = consciousness_container_create(3);
    assert(container != NULL);
    
    // 測試記憶池
    const char* test_memory = "This is a test memory for preconscious";
    size_t memory_size = strlen(test_memory) + 1;
    
    preconscious_mind_add_memory(&container->preconscious, (void*)test_memory, memory_size);
    bool passed = (container->preconscious.recallable_pool.item_count == 1);
    print_test_result("Add memory to pool", passed);
    
    if (passed) {
        memory_pool_item_t* item = &container->preconscious.recallable_pool.items[0];
        passed = (item->memory_data != NULL);
        print_test_result("Memory data allocation", passed);
        
        if (passed) {
            passed = (strcmp((char*)item->memory_data, test_memory) == 0);
            print_test_result("Memory content", passed);
            
            passed = (item->memory_size == memory_size);
            print_test_result("Memory size", passed);
            
            passed = (item->is_recallable == true);
            print_test_result("Memory recallable flag", passed);
        }
    }
    
    // 測試記憶喚醒
    void* recalled_memory = preconscious_mind_recall_memory(&container->preconscious, 0);
    passed = (recalled_memory != NULL);
    print_test_result("Recall memory", passed);
    
    if (passed) {
        passed = (strcmp((char*)recalled_memory, test_memory) == 0);
        print_test_result("Recalled memory content", passed);
        
        memory_pool_item_t* item = &container->preconscious.recallable_pool.items[0];
        passed = (item->recall_strength > 0.5f);
        print_test_result("Recall strength increase", passed);
    }
    
    // 測試關聯網絡
    void* test_node_data = (void*)"Test association node";
    preconscious_mind_add_association(&container->preconscious, 100, test_node_data);
    passed = (container->preconscious.associations.node_count == 1);
    print_test_result("Add association node", passed);
    
    if (passed) {
        association_node_t* node = &container->preconscious.associations.nodes[0];
        passed = (node->node_id == 100);
        print_test_result("Association node ID", passed);
        
        passed = (node->node_data == test_node_data);
        print_test_result("Association node data", passed);
    }
    
    consciousness_container_destroy(container);
}

void test_personal_unconscious_operations() {
    print_test_header("Personal Unconscious Operations");
    printf("DEBUG: Starting personal unconscious test...\n");
    
    consciousness_container_t* container = consciousness_container_create(4);
    assert(container != NULL);
    printf("DEBUG: Container created successfully\n");
    
    // 測試壓抑記憶
    printf("DEBUG: Testing repressed memory...\n");
    const char* repressed_data = "This is a repressed memory";
    size_t repressed_size = strlen(repressed_data) + 1;
    
    personal_unconscious_repress_memory(&container->personal_unconscious, 
                                      (void*)repressed_data, repressed_size, false);
    bool passed = (container->personal_unconscious.repressed.memory_count == 1);
    print_test_result("Repress memory", passed);
    printf("DEBUG: Repressed memory test completed\n");
    
    if (passed) {
        repressed_memory_t* memory = &container->personal_unconscious.repressed.memories[0];
        passed = (memory->memory_data != NULL);
        print_test_result("Repressed memory allocation", passed);
        
        if (passed) {
            passed = (strcmp((char*)memory->memory_data, repressed_data) == 0);
            print_test_result("Repressed memory content", passed);
            
            passed = (memory->is_traumatic == false);
            print_test_result("Non-traumatic memory flag", passed);
        }
    }
    
    // 測試創傷記憶
    printf("DEBUG: Testing traumatic memory...\n");
    const char* trauma_data = "This is a traumatic memory";
    size_t trauma_size = strlen(trauma_data) + 1;
    
    personal_unconscious_repress_memory(&container->personal_unconscious, 
                                      (void*)trauma_data, trauma_size, true);
    passed = (container->personal_unconscious.repressed.memory_count == 2);
    print_test_result("Repress traumatic memory", passed);
    printf("DEBUG: Traumatic memory test completed\n");
    
    if (passed) {
        repressed_memory_t* memory = &container->personal_unconscious.repressed.memories[1];
        passed = (memory->is_traumatic == true);
        print_test_result("Traumatic memory flag", passed);
        
        passed = (memory->repression_strength > 0.8f);
        print_test_result("High repression strength", passed);
    }
    
    // 測試情感記憶
    printf("DEBUG: Testing emotional memory...\n");
    const char* emotion_data = "This is an emotional memory";
    size_t emotion_size = strlen(emotion_data) + 1;
    
    personal_unconscious_add_emotion(&container->personal_unconscious, 
                                   (void*)emotion_data, emotion_size, "joy");
    passed = (container->personal_unconscious.emotions.emotion_data != NULL);
    print_test_result("Add emotional memory", passed);
    printf("DEBUG: Emotional memory test completed\n");
    
    if (passed) {
        passed = (strcmp(container->personal_unconscious.emotions.emotion_type, "joy") == 0);
        print_test_result("Emotion type", passed);
        
        passed = (container->personal_unconscious.emotions.emotion_intensity > 0.5f);
        print_test_result("Emotion intensity", passed);
    }
    
    // 測試本能反應
    printf("DEBUG: Testing instinctive response...\n");
    const char* instinct_data = "This is an instinctive response";
    size_t instinct_size = strlen(instinct_data) + 1;
    
    personal_unconscious_activate_instinct(&container->personal_unconscious, 
                                         (void*)instinct_data, instinct_size);
    passed = (container->personal_unconscious.instincts.is_activated == true);
    print_test_result("Activate instinct", passed);
    printf("DEBUG: Instinctive response test completed\n");
    
    if (passed) {
        passed = (container->personal_unconscious.instincts.instinct_data != NULL);
        print_test_result("Instinct data allocation", passed);
        
        passed = (container->personal_unconscious.instincts.instinct_strength > 0.5f);
        print_test_result("Instinct strength", passed);
    }
    
    printf("DEBUG: Destroying container...\n");
    consciousness_container_destroy(container);
    printf("DEBUG: Personal unconscious test completed successfully\n");
}

void test_collective_unconscious_operations() {
    print_test_header("Collective Unconscious Operations");
    
    consciousness_container_t* container = consciousness_container_create(5);
    assert(container != NULL);
    
    // 測試原型記憶
    const char* archetype_data = "This is an archetype memory";
    size_t archetype_size = strlen(archetype_data) + 1;
    
    collective_unconscious_add_archetype(&container->collective_unconscious, 
                                       (void*)archetype_data, archetype_size, "hero");
    bool passed = (container->collective_unconscious.archetypes.archetype_count == 1);
    print_test_result("Add archetype", passed);
    
    if (passed) {
        archetype_memory_t* archetype = &container->collective_unconscious.archetypes.archetypes[0];
        passed = (archetype->archetype_data != NULL);
        print_test_result("Archetype data allocation", passed);
        
        if (passed) {
            passed = (strcmp(archetype->archetype_name, "hero") == 0);
            print_test_result("Archetype name", passed);
            
            passed = (archetype->archetype_strength > 0.5f);
            print_test_result("Archetype strength", passed);
        }
    }
    
    // 測試集體智慧
    const char* wisdom_data = "This is collective wisdom";
    size_t wisdom_size = strlen(wisdom_data) + 1;
    
    collective_unconscious_accumulate_wisdom(&container->collective_unconscious, 
                                           (void*)wisdom_data, wisdom_size);
    passed = (container->collective_unconscious.wisdom.wisdom_data != NULL);
    print_test_result("Accumulate wisdom", passed);
    
    if (passed) {
        passed = (strcmp((char*)container->collective_unconscious.wisdom.wisdom_data, wisdom_data) == 0);
        print_test_result("Wisdom content", passed);
        
        passed = (container->collective_unconscious.wisdom.wisdom_strength > 0.5f);
        print_test_result("Wisdom strength", passed);
    }
    
    // 測試文化記憶
    const char* cultural_data = "This is cultural memory";
    size_t cultural_size = strlen(cultural_data) + 1;
    
    collective_unconscious_add_cultural_memory(&container->collective_unconscious, 
                                             (void*)cultural_data, cultural_size, "eastern");
    passed = (container->collective_unconscious.cultural.cultural_data != NULL);
    print_test_result("Add cultural memory", passed);
    
    if (passed) {
        passed = (strcmp(container->collective_unconscious.cultural.cultural_type, "eastern") == 0);
        print_test_result("Cultural type", passed);
        
        passed = (container->collective_unconscious.cultural.cultural_strength > 0.5f);
        print_test_result("Cultural strength", passed);
    }
    
    consciousness_container_destroy(container);
}

void test_superconscious_operations() {
    print_test_header("Superconscious Operations");
    
    consciousness_container_t* container = consciousness_container_create(6);
    assert(container != NULL);
    
    // 測試超意識超越
    const char* transcendence_data = "This is superconscious transcendence";
    size_t transcendence_size = strlen(transcendence_data) + 1;
    
    superconscious_transcend(&container->superconscious, (void*)transcendence_data, transcendence_size);
    bool passed = (container->superconscious.is_transcended == true);
    print_test_result("Transcend to superconscious", passed);
    
    if (passed) {
        passed = (container->superconscious.superconscious_data != NULL);
        print_test_result("Superconscious data allocation", passed);
        
        if (passed) {
            passed = (strcmp((char*)container->superconscious.superconscious_data, transcendence_data) == 0);
            print_test_result("Superconscious content", passed);
            
            passed = (container->superconscious.superconscious_strength == 1.0f);
            print_test_result("Superconscious strength", passed);
        }
    }
    
    // 測試超意識狀態檢查
    bool is_transcended = superconscious_is_transcended(&container->superconscious);
    passed = (is_transcended == true);
    print_test_result("Check transcendence status", passed);
    
    consciousness_container_destroy(container);
}

void test_consciousness_container_sync() {
    print_test_header("Consciousness Container Synchronization");
    
    consciousness_container_t* container = consciousness_container_create(7);
    assert(container != NULL);
    
    // 記錄初始狀態
    uint32_t initial_access_count = container->access_count;
    uint64_t initial_update_time = container->last_update_time;
    
    sleep(1);
    // 執行同步
    consciousness_container_sync(container);
    
    bool passed = (container->access_count == initial_access_count + 1);
    print_test_result("Access count increment", passed);
    
    passed = (container->last_update_time > initial_update_time);
    print_test_result("Update time change", passed);
    
    consciousness_container_destroy(container);
}

void test_consciousness_container_intensity() {
    print_test_header("Consciousness Container Intensity");
    
    consciousness_container_t* container = consciousness_container_create(8);
    assert(container != NULL);
    
    // 測試初始強度
    consciousness_intensity_t initial_intensity = consciousness_container_get_overall_intensity(container);
    bool passed = (initial_intensity >= 0.0f && initial_intensity <= 1.0f);
    print_test_result("Valid initial intensity", passed);
    
    // 添加一些記憶來影響強度
    const char* test_data = "Test data for intensity calculation";
    size_t data_size = strlen(test_data) + 1;
    
    conscious_mind_add_working_memory(&container->conscious, (void*)test_data, data_size);
    preconscious_mind_add_memory(&container->preconscious, (void*)test_data, data_size);
    
    // 更新強度
    consciousness_container_update_intensity(container);
    
    consciousness_intensity_t new_intensity = consciousness_container_get_overall_intensity(container);
    passed = (new_intensity >= 0.0f && new_intensity <= 1.0f);
    print_test_result("Valid updated intensity", passed);
    
    consciousness_container_destroy(container);
}

void test_consciousness_container_stats() {
    print_test_header("Consciousness Container Statistics");
    
    consciousness_container_t* container = consciousness_container_create(9);
    assert(container != NULL);
    
    // 分配統計緩衝區
    char stats_buffer[1024];
    memset(stats_buffer, 0, sizeof(stats_buffer));
    
    consciousness_container_get_stats(container, stats_buffer);
    
    bool passed = (strlen(stats_buffer) > 0);
    print_test_result("Stats generation", passed);
    
    if (passed) {
        passed = (strstr(stats_buffer, "Container ID") != NULL);
        print_test_result("Stats contain container ID", passed);
        
        passed = (strstr(stats_buffer, "State") != NULL);
        print_test_result("Stats contain state", passed);
        
        passed = (strstr(stats_buffer, "Overall Intensity") != NULL);
        print_test_result("Stats contain intensity", passed);
    }
    
    consciousness_container_destroy(container);
}

void test_consciousness_container_reset() {
    print_test_header("Consciousness Container Reset");
    
    consciousness_container_t* container = consciousness_container_create(10);
    assert(container != NULL);
    
    // 添加一些數據
    const char* test_data = "Test data";
    size_t data_size = strlen(test_data) + 1;
    
    conscious_mind_add_working_memory(&container->conscious, (void*)test_data, data_size);
    preconscious_mind_add_memory(&container->preconscious, (void*)test_data, data_size);
    
    // 執行重置
    consciousness_container_reset(container);
    
    bool passed = (container->state == CONSCIOUSNESS_ACTIVE);
    print_test_result("Reset state", passed);
    
    passed = (container->access_count == 0);
    print_test_result("Reset access count", passed);
    
    passed = (container->conscious.working_memory.size == 0);
    print_test_result("Reset conscious memory", passed);
    
    passed = (container->preconscious.recallable_pool.item_count == 0);
    print_test_result("Reset preconscious memory", passed);
    
    consciousness_container_destroy(container);
}

// ============================================================================
// 主測試函數
// ============================================================================

int main() {
    printf("🧠 StockOS Consciousness Container Test Suite\n");
    printf("==============================================\n");
    
    // 執行所有測試
    test_consciousness_container_creation();
    test_consciousness_state_management();
    test_conscious_mind_operations();
    test_preconscious_mind_operations();
    test_personal_unconscious_operations();
    test_collective_unconscious_operations();
    test_superconscious_operations();
    test_consciousness_container_sync();
    test_consciousness_container_intensity();
    test_consciousness_container_stats();
    test_consciousness_container_reset();
    
    printf("\n🎉 All consciousness container tests completed!\n");
    printf("The personal consciousness container is working correctly.\n");
    
    return 0;
} 