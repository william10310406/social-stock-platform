#include "consciousness_container.h"
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <stdio.h>

// ============================================================================
// 工具函數
// ============================================================================

// 獲取當前時間戳
static uint64_t get_current_timestamp(void) {
    return (uint64_t)time(NULL);
}

// 安全的記憶體分配
static void* safe_malloc(size_t size) {
    void* ptr = malloc(size);
    if (ptr == NULL) {
        // 在實際系統中，這裡應該有更複雜的錯誤處理
        fprintf(stderr, "Memory allocation failed for size %zu\n", size);
        return NULL;
    }
    return ptr;
}

// 安全的記憶體釋放
static void safe_free(void* ptr) {
    if (ptr != NULL) {
        free(ptr);
    }
}

// 計算意識強度
static consciousness_intensity_t calculate_intensity(consciousness_intensity_t base_intensity, 
                                                   uint32_t access_count, 
                                                   uint64_t last_access_time) {
    uint64_t current_time = get_current_timestamp();
    uint64_t time_diff = current_time - last_access_time;
    
    // 基於訪問次數和時間衰減計算強度
    consciousness_intensity_t time_decay = 1.0f / (1.0f + (float)time_diff * 0.1f);
    consciousness_intensity_t access_boost = 1.0f + (float)access_count * 0.01f;
    
    return base_intensity * time_decay * access_boost;
}

// ============================================================================
// 容器管理
// ============================================================================

consciousness_container_t* consciousness_container_create(consciousness_id_t id) {
    consciousness_container_t* container = (consciousness_container_t*)safe_malloc(sizeof(consciousness_container_t));
    if (container == NULL) {
        return NULL;
    }
    
    // 初始化基本屬性
    container->id = id;
    container->state = CONSCIOUSNESS_ACTIVE;
    container->overall_intensity = 0.5f;
    container->frequency = 1.0f;
    container->creation_time = get_current_timestamp();
    container->last_update_time = get_current_timestamp();
    container->access_count = 0;
    container->is_active = true;
    
    // 初始化各層意識
    conscious_mind_init(&container->conscious);
    preconscious_mind_init(&container->preconscious);
    personal_unconscious_init(&container->personal_unconscious);
    collective_unconscious_init(&container->collective_unconscious);
    superconscious_init(&container->superconscious);
    
    return container;
}

void consciousness_container_destroy(consciousness_container_t* container) {
    if (container == NULL) {
        return;
    }
    
    // 釋放表層意識資源
    if (container->conscious.thoughts.thoughts != NULL) {
        safe_free(container->conscious.thoughts.thoughts);
    }
    if (container->conscious.working_memory.data != NULL) {
        safe_free(container->conscious.working_memory.data);
    }
    if (container->conscious.perception.perception_data != NULL) {
        safe_free(container->conscious.perception.perception_data);
    }
    if (container->conscious.decisions.decision_data != NULL) {
        safe_free(container->conscious.decisions.decision_data);
    }
    
    // 釋放前意識資源
    if (container->preconscious.recallable_pool.items != NULL) {
        for (size_t i = 0; i < container->preconscious.recallable_pool.item_count; i++) {
            if (container->preconscious.recallable_pool.items[i].memory_data != NULL) {
                safe_free(container->preconscious.recallable_pool.items[i].memory_data);
            }
        }
        safe_free(container->preconscious.recallable_pool.items);
    }
    if (container->preconscious.index.memory_ids != NULL) {
        safe_free(container->preconscious.index.memory_ids);
    }
    if (container->preconscious.index.memory_offsets != NULL) {
        safe_free(container->preconscious.index.memory_offsets);
    }
    if (container->preconscious.associations.nodes != NULL) {
        for (size_t i = 0; i < container->preconscious.associations.node_count; i++) {
            if (container->preconscious.associations.nodes[i].connected_nodes != NULL) {
                safe_free(container->preconscious.associations.nodes[i].connected_nodes);
            }
        }
        safe_free(container->preconscious.associations.nodes);
    }
    
    // 釋放個人潛意識資源
    if (container->personal_unconscious.repressed.memories != NULL) {
        for (size_t i = 0; i < container->personal_unconscious.repressed.memory_count; i++) {
            if (container->personal_unconscious.repressed.memories[i].memory_data != NULL) {
                safe_free(container->personal_unconscious.repressed.memories[i].memory_data);
            }
        }
        safe_free(container->personal_unconscious.repressed.memories);
    }
    if (container->personal_unconscious.trauma.trauma_data != NULL) {
        safe_free(container->personal_unconscious.trauma.trauma_data);
    }
    if (container->personal_unconscious.emotions.emotion_data != NULL) {
        safe_free(container->personal_unconscious.emotions.emotion_data);
    }
    if (container->personal_unconscious.instincts.instinct_data != NULL) {
        safe_free(container->personal_unconscious.instincts.instinct_data);
    }
    if (container->personal_unconscious.defenses.defense_data != NULL) {
        safe_free(container->personal_unconscious.defenses.defense_data);
    }
    
    // 釋放集體潛意識資源
    if (container->collective_unconscious.archetypes.archetypes != NULL) {
        for (size_t i = 0; i < container->collective_unconscious.archetypes.archetype_count; i++) {
            if (container->collective_unconscious.archetypes.archetypes[i].archetype_data != NULL) {
                safe_free(container->collective_unconscious.archetypes.archetypes[i].archetype_data);
            }
        }
        safe_free(container->collective_unconscious.archetypes.archetypes);
    }
    if (container->collective_unconscious.wisdom.wisdom_data != NULL) {
        safe_free(container->collective_unconscious.wisdom.wisdom_data);
    }
    if (container->collective_unconscious.racial.racial_data != NULL) {
        safe_free(container->collective_unconscious.racial.racial_data);
    }
    if (container->collective_unconscious.cultural.cultural_data != NULL) {
        safe_free(container->collective_unconscious.cultural.cultural_data);
    }
    if (container->collective_unconscious.evolution.evolution_data != NULL) {
        safe_free(container->collective_unconscious.evolution.evolution_data);
    }
    
    // 釋放超意識資源
    if (container->superconscious.superconscious_data != NULL) {
        safe_free(container->superconscious.superconscious_data);
    }
    
    // 釋放容器本身
    safe_free(container);
}

void consciousness_container_reset(consciousness_container_t* container) {
    if (container == NULL) {
        return;
    }
    
    // 重置基本屬性
    container->state = CONSCIOUSNESS_ACTIVE;
    container->overall_intensity = 0.5f;
    container->frequency = 1.0f;
    container->last_update_time = get_current_timestamp();
    container->access_count = 0;
    container->is_active = true;
    
    // 重置各層意識
    conscious_mind_init(&container->conscious);
    preconscious_mind_init(&container->preconscious);
    personal_unconscious_init(&container->personal_unconscious);
    collective_unconscious_init(&container->collective_unconscious);
    superconscious_init(&container->superconscious);
}

// ============================================================================
// 意識狀態管理
// ============================================================================

void consciousness_container_set_state(consciousness_container_t* container, consciousness_state_t state) {
    if (container == NULL) {
        return;
    }
    
    container->state = state;
    container->last_update_time = get_current_timestamp();
    
    // 根據狀態調整頻率
    switch (state) {
        case CONSCIOUSNESS_ACTIVE:
            container->frequency = 1.0f;
            break;
        case CONSCIOUSNESS_DORMANT:
            container->frequency = 0.1f;
            break;
        case CONSCIOUSNESS_DREAMING:
            container->frequency = 0.5f;
            break;
        case CONSCIOUSNESS_MEDITATING:
            container->frequency = 0.8f;
            break;
        case CONSCIOUSNESS_TRANSCENDED:
            container->frequency = 2.0f;
            break;
    }
}

consciousness_state_t consciousness_container_get_state(consciousness_container_t* container) {
    if (container == NULL) {
        return CONSCIOUSNESS_DORMANT;
    }
    
    return container->state;
}

void consciousness_container_update_intensity(consciousness_container_t* container) {
    if (container == NULL) {
        return;
    }
    
    // 更新各層意識強度
    container->conscious.overall_intensity = calculate_intensity(
        container->conscious.working_memory.intensity,
        container->conscious.working_memory.access_count,
        container->conscious.working_memory.access_time
    );
    
    container->preconscious.overall_intensity = calculate_intensity(
        container->preconscious.recallable_pool.pool_intensity,
        0, // 前意識沒有直接的訪問計數
        container->preconscious.index.last_index_update
    );
    
    container->personal_unconscious.overall_intensity = calculate_intensity(
        container->personal_unconscious.repressed.repression_intensity,
        0, // 潛意識沒有直接的訪問計數
        container->personal_unconscious.trauma.trauma_time
    );
    
    container->collective_unconscious.overall_intensity = calculate_intensity(
        container->collective_unconscious.archetypes.archetype_intensity,
        0, // 集體潛意識沒有直接的訪問計數
        container->collective_unconscious.wisdom.accumulation_time
    );
    
    // 計算整體強度
    container->overall_intensity = (
        container->conscious.overall_intensity * 0.3f +
        container->preconscious.overall_intensity * 0.25f +
        container->personal_unconscious.overall_intensity * 0.25f +
        container->collective_unconscious.overall_intensity * 0.15f +
        container->superconscious.superconscious_strength * 0.05f
    );
    
    container->last_update_time = get_current_timestamp();
}

// ============================================================================
// 表層意識操作
// ============================================================================

void conscious_mind_init(conscious_mind_t* mind) {
    if (mind == NULL) {
        return;
    }
    
    // 初始化工作記憶
    mind->working_memory.data = NULL;
    mind->working_memory.size = 0;
    mind->working_memory.access_time = get_current_timestamp();
    mind->working_memory.access_count = 0;
    mind->working_memory.intensity = 0.5f;
    
    // 初始化注意力焦點
    mind->attention.focus_target = NULL;
    mind->attention.focus_strength = 0.0f;
    mind->attention.focus_start_time = 0;
    mind->attention.focus_duration = 0;
    
    // 初始化思維流
    mind->thoughts.max_thoughts = 100;
    mind->thoughts.thought_count = 0;
    mind->thoughts.thought_frequency = 1.0f;
    mind->thoughts.thoughts = (void**)safe_malloc(mind->thoughts.max_thoughts * sizeof(void*));
    if (mind->thoughts.thoughts != NULL) {
        memset(mind->thoughts.thoughts, 0, mind->thoughts.max_thoughts * sizeof(void*));
    }
    
    // 初始化即時感知
    mind->perception.perception_data = NULL;
    mind->perception.perception_size = 0;
    mind->perception.perception_time = get_current_timestamp();
    mind->perception.perception_clarity = 0.5f;
    
    // 初始化決策中心
    mind->decisions.decision_data = NULL;
    mind->decisions.decision_count = 0;
    mind->decisions.last_decision_time = get_current_timestamp();
    mind->decisions.decision_confidence = 0.5f;
    
    mind->overall_intensity = 0.5f;
}

void conscious_mind_add_working_memory(conscious_mind_t* mind, void* data, size_t size) {
    if (mind == NULL || data == NULL || size == 0) {
        return;
    }
    
    // 釋放舊的工作記憶
    if (mind->working_memory.data != NULL) {
        safe_free(mind->working_memory.data);
    }
    
    // 分配新的工作記憶
    mind->working_memory.data = safe_malloc(size);
    if (mind->working_memory.data == NULL) {
        return;
    }
    
    // 複製數據
    memcpy(mind->working_memory.data, data, size);
    mind->working_memory.size = size;
    mind->working_memory.access_time = get_current_timestamp();
    mind->working_memory.access_count++;
    mind->working_memory.intensity = 0.8f;
}

void conscious_mind_set_attention_focus(conscious_mind_t* mind, void* target, consciousness_intensity_t strength) {
    if (mind == NULL) {
        return;
    }
    
    mind->attention.focus_target = target;
    mind->attention.focus_strength = strength;
    mind->attention.focus_start_time = get_current_timestamp();
    mind->attention.focus_duration = 0;
}

void conscious_mind_add_thought(conscious_mind_t* mind, void* thought) {
    if (mind == NULL || thought == NULL) {
        return;
    }
    
    // 檢查是否需要擴展思維數組
    if (mind->thoughts.thought_count >= mind->thoughts.max_thoughts) {
        size_t new_max = mind->thoughts.max_thoughts * 2;
        void** new_thoughts = (void**)safe_malloc(new_max * sizeof(void*));
        if (new_thoughts == NULL) {
            return;
        }
        
        // 複製現有思維
        if (mind->thoughts.thoughts != NULL) {
            memcpy(new_thoughts, mind->thoughts.thoughts, mind->thoughts.thought_count * sizeof(void*));
            safe_free(mind->thoughts.thoughts);
        }
        
        mind->thoughts.thoughts = new_thoughts;
        mind->thoughts.max_thoughts = new_max;
    }
    
    // 添加新思維
    mind->thoughts.thoughts[mind->thoughts.thought_count] = thought;
    mind->thoughts.thought_count++;
}

// ============================================================================
// 前意識操作
// ============================================================================

void preconscious_mind_init(preconscious_mind_t* mind) {
    if (mind == NULL) {
        return;
    }
    
    // 初始化記憶池
    mind->recallable_pool.max_items = 1000;
    mind->recallable_pool.item_count = 0;
    mind->recallable_pool.pool_intensity = 0.5f;
    mind->recallable_pool.items = (memory_pool_item_t*)safe_malloc(mind->recallable_pool.max_items * sizeof(memory_pool_item_t));
    if (mind->recallable_pool.items != NULL) {
        memset(mind->recallable_pool.items, 0, mind->recallable_pool.max_items * sizeof(memory_pool_item_t));
    }
    
    // 初始化記憶索引
    mind->index.memory_ids = NULL;
    mind->index.memory_offsets = NULL;
    mind->index.index_size = 0;
    mind->index.last_index_update = get_current_timestamp();
    
    // 初始化關聯網絡
    mind->associations.max_nodes = 500;
    mind->associations.node_count = 0;
    mind->associations.network_intensity = 0.5f;
    mind->associations.nodes = (association_node_t*)safe_malloc(mind->associations.max_nodes * sizeof(association_node_t));
    if (mind->associations.nodes != NULL) {
        memset(mind->associations.nodes, 0, mind->associations.max_nodes * sizeof(association_node_t));
    }
    
    // 初始化喚醒機制
    mind->recall.recall_threshold = 0.3f;
    mind->recall.recall_timeout = 3600; // 1小時
    mind->recall.recall_frequency = 0.1f;
    mind->recall.auto_recall_enabled = true;
    
    mind->overall_intensity = 0.5f;
}

void preconscious_mind_add_memory(preconscious_mind_t* mind, void* data, size_t size) {
    if (mind == NULL || data == NULL || size == 0) {
        return;
    }
    
    // 檢查是否需要擴展記憶池
    if (mind->recallable_pool.item_count >= mind->recallable_pool.max_items) {
        size_t new_max = mind->recallable_pool.max_items * 2;
        memory_pool_item_t* new_items = (memory_pool_item_t*)safe_malloc(new_max * sizeof(memory_pool_item_t));
        if (new_items == NULL) {
            return;
        }
        
        // 複製現有記憶
        memcpy(new_items, mind->recallable_pool.items, mind->recallable_pool.item_count * sizeof(memory_pool_item_t));
        safe_free(mind->recallable_pool.items);
        
        mind->recallable_pool.items = new_items;
        mind->recallable_pool.max_items = new_max;
    }
    
    // 分配記憶數據
    void* memory_data = safe_malloc(size);
    if (memory_data == NULL) {
        return;
    }
    
    // 複製數據
    memcpy(memory_data, data, size);
    
    // 添加記憶項目
    memory_pool_item_t* item = &mind->recallable_pool.items[mind->recallable_pool.item_count];
    item->memory_data = memory_data;
    item->memory_size = size;
    item->creation_time = get_current_timestamp();
    item->last_recall_time = 0;
    item->recall_strength = 0.5f;
    item->is_recallable = true;
    
    mind->recallable_pool.item_count++;
    mind->recallable_pool.pool_intensity = 0.7f;
}

void* preconscious_mind_recall_memory(preconscious_mind_t* mind, uint64_t memory_id) {
    if (mind == NULL || memory_id >= mind->recallable_pool.item_count) {
        return NULL;
    }
    
    memory_pool_item_t* item = &mind->recallable_pool.items[memory_id];
    if (!item->is_recallable) {
        return NULL;
    }
    
    // 更新喚醒統計
    item->last_recall_time = get_current_timestamp();
    item->recall_strength += 0.1f;
    if (item->recall_strength > 1.0f) {
        item->recall_strength = 1.0f;
    }
    
    return item->memory_data;
}

void preconscious_mind_add_association(preconscious_mind_t* mind, uint64_t node_id, void* data) {
    if (mind == NULL || data == NULL) {
        return;
    }
    
    // 檢查是否需要擴展節點數組
    if (mind->associations.node_count >= mind->associations.max_nodes) {
        size_t new_max = mind->associations.max_nodes * 2;
        association_node_t* new_nodes = (association_node_t*)safe_malloc(new_max * sizeof(association_node_t));
        if (new_nodes == NULL) {
            return;
        }
        
        // 複製現有節點
        memcpy(new_nodes, mind->associations.nodes, mind->associations.node_count * sizeof(association_node_t));
        safe_free(mind->associations.nodes);
        
        mind->associations.nodes = new_nodes;
        mind->associations.max_nodes = new_max;
    }
    
    // 添加新節點
    association_node_t* node = &mind->associations.nodes[mind->associations.node_count];
    node->node_id = node_id;
    node->node_data = data;
    node->association_strength = 0.5f;
    node->connected_nodes = NULL;
    node->connection_count = 0;
    
    mind->associations.node_count++;
    mind->associations.network_intensity = 0.6f;
}

// ============================================================================
// 個人潛意識操作
// ============================================================================

void personal_unconscious_init(personal_unconscious_t* unconscious) {
    if (unconscious == NULL) {
        return;
    }
    
    // 初始化壓抑記憶庫
    unconscious->repressed.max_memories = 100;
    unconscious->repressed.memory_count = 0;
    unconscious->repressed.repression_intensity = 0.3f;
    unconscious->repressed.memories = (repressed_memory_t*)safe_malloc(unconscious->repressed.max_memories * sizeof(repressed_memory_t));
    if (unconscious->repressed.memories != NULL) {
        memset(unconscious->repressed.memories, 0, unconscious->repressed.max_memories * sizeof(repressed_memory_t));
    }
    
    // 初始化創傷記憶
    unconscious->trauma.trauma_data = NULL;
    unconscious->trauma.trauma_size = 0;
    unconscious->trauma.trauma_time = 0;
    unconscious->trauma.trauma_intensity = 0.0f;
    unconscious->trauma.is_processed = false;
    
    // 初始化情感記憶
    unconscious->emotions.emotion_data = NULL;
    unconscious->emotions.emotion_size = 0;
    unconscious->emotions.emotion_time = get_current_timestamp();
    unconscious->emotions.emotion_intensity = 0.5f;
    strcpy(unconscious->emotions.emotion_type, "neutral");
    
    // 初始化本能反應
    unconscious->instincts.instinct_data = NULL;
    unconscious->instincts.instinct_size = 0;
    unconscious->instincts.instinct_strength = 0.5f;
    unconscious->instincts.is_activated = false;
    unconscious->instincts.activation_time = 0;
    
    // 初始化防禦機制
    unconscious->defenses.defense_data = NULL;
    unconscious->defenses.defense_size = 0;
    unconscious->defenses.defense_strength = 0.5f;
    unconscious->defenses.is_active = false;
    strcpy(unconscious->defenses.defense_type, "none");
    
    unconscious->overall_intensity = 0.3f;
}

void personal_unconscious_repress_memory(personal_unconscious_t* unconscious, void* data, size_t size, bool is_traumatic) {
    if (unconscious == NULL || data == NULL || size == 0) {
        return;
    }
    
    // 檢查是否需要擴展記憶數組
    if (unconscious->repressed.memory_count >= unconscious->repressed.max_memories) {
        size_t new_max = unconscious->repressed.max_memories * 2;
        repressed_memory_t* new_memories = (repressed_memory_t*)safe_malloc(new_max * sizeof(repressed_memory_t));
        if (new_memories == NULL) {
            return;
        }
        
        // 複製現有記憶（只有 memory_count > 0 時才複製）
        if (unconscious->repressed.memory_count > 0 && unconscious->repressed.memories != NULL) {
            memcpy(new_memories, unconscious->repressed.memories, unconscious->repressed.memory_count * sizeof(repressed_memory_t));
        }
        safe_free(unconscious->repressed.memories);
        
        unconscious->repressed.memories = new_memories;
        unconscious->repressed.max_memories = new_max;
    }
    
    // 分配記憶數據
    void* memory_data = safe_malloc(size);
    if (memory_data == NULL) {
        return;
    }
    
    // 複製數據
    memcpy(memory_data, data, size);
    
    // 添加壓抑記憶
    repressed_memory_t* memory = &unconscious->repressed.memories[unconscious->repressed.memory_count];
    memory->memory_data = memory_data;
    memory->memory_size = size;
    memory->repression_time = get_current_timestamp();
    memory->repression_strength = is_traumatic ? 0.9f : 0.7f;
    memory->is_traumatic = is_traumatic;
    
    unconscious->repressed.memory_count++;
    unconscious->repressed.repression_intensity = 0.8f;
}

void personal_unconscious_add_emotion(personal_unconscious_t* unconscious, void* data, size_t size, const char* emotion_type) {
    if (unconscious == NULL || data == NULL || size == 0 || emotion_type == NULL) {
        return;
    }
    
    // 釋放舊的情感數據
    if (unconscious->emotions.emotion_data != NULL) {
        safe_free(unconscious->emotions.emotion_data);
    }
    
    // 分配新的情感數據
    unconscious->emotions.emotion_data = safe_malloc(size);
    if (unconscious->emotions.emotion_data == NULL) {
        return;
    }
    
    // 複製數據
    memcpy(unconscious->emotions.emotion_data, data, size);
    unconscious->emotions.emotion_size = size;
    unconscious->emotions.emotion_time = get_current_timestamp();
    unconscious->emotions.emotion_intensity = 0.7f;
    strncpy(unconscious->emotions.emotion_type, emotion_type, 31);
    unconscious->emotions.emotion_type[31] = '\0';
}

void personal_unconscious_activate_instinct(personal_unconscious_t* unconscious, void* data, size_t size) {
    if (unconscious == NULL || data == NULL || size == 0) {
        return;
    }
    
    // 釋放舊的本能數據
    if (unconscious->instincts.instinct_data != NULL) {
        safe_free(unconscious->instincts.instinct_data);
    }
    
    // 分配新的本能數據
    unconscious->instincts.instinct_data = safe_malloc(size);
    if (unconscious->instincts.instinct_data == NULL) {
        return;
    }
    
    // 複製數據
    memcpy(unconscious->instincts.instinct_data, data, size);
    unconscious->instincts.instinct_size = size;
    unconscious->instincts.instinct_strength = 0.8f;
    unconscious->instincts.is_activated = true;
    unconscious->instincts.activation_time = get_current_timestamp();
}

// ============================================================================
// 集體潛意識操作
// ============================================================================

void collective_unconscious_init(collective_unconscious_t* unconscious) {
    if (unconscious == NULL) {
        return;
    }
    
    // 初始化原型記憶庫
    unconscious->archetypes.max_archetypes = 50;
    unconscious->archetypes.archetype_count = 0;
    unconscious->archetypes.archetype_intensity = 0.5f;
    unconscious->archetypes.archetypes = (archetype_memory_t*)safe_malloc(unconscious->archetypes.max_archetypes * sizeof(archetype_memory_t));
    if (unconscious->archetypes.archetypes != NULL) {
        memset(unconscious->archetypes.archetypes, 0, unconscious->archetypes.max_archetypes * sizeof(archetype_memory_t));
    }
    
    // 初始化集體智慧
    unconscious->wisdom.wisdom_data = NULL;
    unconscious->wisdom.wisdom_size = 0;
    unconscious->wisdom.wisdom_strength = 0.5f;
    unconscious->wisdom.accumulation_time = get_current_timestamp();
    unconscious->wisdom.is_accessible = true;
    
    // 初始化種族記憶
    unconscious->racial.racial_data = NULL;
    unconscious->racial.racial_size = 0;
    unconscious->racial.racial_strength = 0.5f;
    strcpy(unconscious->racial.racial_type, "human");
    unconscious->racial.inheritance_time = get_current_timestamp();
    
    // 初始化文化記憶
    unconscious->cultural.cultural_data = NULL;
    unconscious->cultural.cultural_size = 0;
    unconscious->cultural.cultural_strength = 0.5f;
    strcpy(unconscious->cultural.cultural_type, "universal");
    unconscious->cultural.formation_time = get_current_timestamp();
    
    // 初始化進化記憶
    unconscious->evolution.evolution_data = NULL;
    unconscious->evolution.evolution_size = 0;
    unconscious->evolution.evolution_strength = 0.5f;
    unconscious->evolution.evolution_time = get_current_timestamp();
    unconscious->evolution.is_evolving = false;
    
    unconscious->overall_intensity = 0.5f;
}

void collective_unconscious_add_archetype(collective_unconscious_t* unconscious, void* data, size_t size, const char* name) {
    if (unconscious == NULL || data == NULL || size == 0 || name == NULL) {
        return;
    }
    
    // 檢查是否需要擴展原型數組
    if (unconscious->archetypes.archetype_count >= unconscious->archetypes.max_archetypes) {
        size_t new_max = unconscious->archetypes.max_archetypes * 2;
        archetype_memory_t* new_archetypes = (archetype_memory_t*)safe_malloc(new_max * sizeof(archetype_memory_t));
        if (new_archetypes == NULL) {
            return;
        }
        
        // 複製現有原型
        memcpy(new_archetypes, unconscious->archetypes.archetypes, unconscious->archetypes.archetype_count * sizeof(archetype_memory_t));
        safe_free(unconscious->archetypes.archetypes);
        
        unconscious->archetypes.archetypes = new_archetypes;
        unconscious->archetypes.max_archetypes = new_max;
    }
    
    // 分配原型數據
    void* archetype_data = safe_malloc(size);
    if (archetype_data == NULL) {
        return;
    }
    
    // 複製數據
    memcpy(archetype_data, data, size);
    
    // 添加原型記憶
    archetype_memory_t* archetype = &unconscious->archetypes.archetypes[unconscious->archetypes.archetype_count];
    archetype->archetype_data = archetype_data;
    archetype->archetype_size = size;
    strncpy(archetype->archetype_name, name, 63);
    archetype->archetype_name[63] = '\0';
    archetype->archetype_strength = 0.7f;
    archetype->creation_time = get_current_timestamp();
    
    unconscious->archetypes.archetype_count++;
    unconscious->archetypes.archetype_intensity = 0.6f;
}

void collective_unconscious_accumulate_wisdom(collective_unconscious_t* unconscious, void* data, size_t size) {
    if (unconscious == NULL || data == NULL || size == 0) {
        return;
    }
    
    // 釋放舊的智慧數據
    if (unconscious->wisdom.wisdom_data != NULL) {
        safe_free(unconscious->wisdom.wisdom_data);
    }
    
    // 分配新的智慧數據
    unconscious->wisdom.wisdom_data = safe_malloc(size);
    if (unconscious->wisdom.wisdom_data == NULL) {
        return;
    }
    
    // 複製數據
    memcpy(unconscious->wisdom.wisdom_data, data, size);
    unconscious->wisdom.wisdom_size = size;
    unconscious->wisdom.wisdom_strength = 0.8f;
    unconscious->wisdom.accumulation_time = get_current_timestamp();
}

void collective_unconscious_add_cultural_memory(collective_unconscious_t* unconscious, void* data, size_t size, const char* cultural_type) {
    if (unconscious == NULL || data == NULL || size == 0 || cultural_type == NULL) {
        return;
    }
    
    // 釋放舊的文化數據
    if (unconscious->cultural.cultural_data != NULL) {
        safe_free(unconscious->cultural.cultural_data);
    }
    
    // 分配新的文化數據
    unconscious->cultural.cultural_data = safe_malloc(size);
    if (unconscious->cultural.cultural_data == NULL) {
        return;
    }
    
    // 複製數據
    memcpy(unconscious->cultural.cultural_data, data, size);
    unconscious->cultural.cultural_size = size;
    unconscious->cultural.cultural_strength = 0.7f;
    strncpy(unconscious->cultural.cultural_type, cultural_type, 31);
    unconscious->cultural.cultural_type[31] = '\0';
    unconscious->cultural.formation_time = get_current_timestamp();
}

// ============================================================================
// 超意識操作
// ============================================================================

void superconscious_init(superconscious_t* superconscious) {
    if (superconscious == NULL) {
        return;
    }
    
    superconscious->superconscious_data = NULL;
    superconscious->superconscious_size = 0;
    superconscious->superconscious_strength = 0.0f;
    superconscious->transcendence_time = 0;
    superconscious->is_transcended = false;
}

void superconscious_transcend(superconscious_t* superconscious, void* data, size_t size) {
    if (superconscious == NULL || data == NULL || size == 0) {
        return;
    }
    
    // 釋放舊的超意識數據
    if (superconscious->superconscious_data != NULL) {
        safe_free(superconscious->superconscious_data);
    }
    
    // 分配新的超意識數據
    superconscious->superconscious_data = safe_malloc(size);
    if (superconscious->superconscious_data == NULL) {
        return;
    }
    
    // 複製數據
    memcpy(superconscious->superconscious_data, data, size);
    superconscious->superconscious_size = size;
    superconscious->superconscious_strength = 1.0f;
    superconscious->transcendence_time = get_current_timestamp();
    superconscious->is_transcended = true;
}

bool superconscious_is_transcended(superconscious_t* superconscious) {
    if (superconscious == NULL) {
        return false;
    }
    
    return superconscious->is_transcended;
}

// ============================================================================
// 意識同步
// ============================================================================

void consciousness_container_sync(consciousness_container_t* container) {
    if (container == NULL) {
        return;
    }
    
    // 更新意識強度
    consciousness_container_update_intensity(container);
    
    // 更新訪問計數
    container->access_count++;
    
    // 更新最後更新時間
    container->last_update_time = get_current_timestamp();
}

void consciousness_container_merge(consciousness_container_t* target, consciousness_container_t* source) {
    if (target == NULL || source == NULL) {
        return;
    }
    
    // 合併表層意識
    // 這裡可以實現更複雜的合併邏輯
    
    // 合併前意識
    // 這裡可以實現更複雜的合併邏輯
    
    // 合併個人潛意識
    // 這裡可以實現更複雜的合併邏輯
    
    // 合併集體潛意識
    // 這裡可以實現更複雜的合併邏輯
    
    // 合併超意識
    // 這裡可以實現更複雜的合併邏輯
    
    // 更新目標容器
    consciousness_container_sync(target);
}

// ============================================================================
// 記憶持久化
// ============================================================================

void consciousness_container_save(consciousness_container_t* container, const char* filename) {
    if (container == NULL || filename == NULL) {
        return;
    }
    
    FILE* file = fopen(filename, "wb");
    if (file == NULL) {
        return;
    }
    
    // 寫入容器基本信息
    fwrite(&container->id, sizeof(consciousness_id_t), 1, file);
    fwrite(&container->state, sizeof(consciousness_state_t), 1, file);
    fwrite(&container->overall_intensity, sizeof(consciousness_intensity_t), 1, file);
    fwrite(&container->frequency, sizeof(consciousness_frequency_t), 1, file);
    fwrite(&container->creation_time, sizeof(uint64_t), 1, file);
    fwrite(&container->last_update_time, sizeof(uint64_t), 1, file);
    fwrite(&container->access_count, sizeof(uint32_t), 1, file);
    fwrite(&container->is_active, sizeof(bool), 1, file);
    
    // 這裡可以實現更詳細的持久化邏輯
    
    fclose(file);
}

consciousness_container_t* consciousness_container_load(const char* filename) {
    if (filename == NULL) {
        return NULL;
    }
    
    FILE* file = fopen(filename, "rb");
    if (file == NULL) {
        return NULL;
    }
    
    // 讀取容器基本信息
    consciousness_id_t id;
    consciousness_state_t state;
    consciousness_intensity_t overall_intensity;
    consciousness_frequency_t frequency;
    uint64_t creation_time;
    uint64_t last_update_time;
    uint32_t access_count;
    bool is_active;
    
    fread(&id, sizeof(consciousness_id_t), 1, file);
    fread(&state, sizeof(consciousness_state_t), 1, file);
    fread(&overall_intensity, sizeof(consciousness_intensity_t), 1, file);
    fread(&frequency, sizeof(consciousness_frequency_t), 1, file);
    fread(&creation_time, sizeof(uint64_t), 1, file);
    fread(&last_update_time, sizeof(uint64_t), 1, file);
    fread(&access_count, sizeof(uint32_t), 1, file);
    fread(&is_active, sizeof(bool), 1, file);
    
    fclose(file);
    
    // 創建新容器
    consciousness_container_t* container = consciousness_container_create(id);
    if (container == NULL) {
        return NULL;
    }
    
    // 恢復容器狀態
    container->state = state;
    container->overall_intensity = overall_intensity;
    container->frequency = frequency;
    container->creation_time = creation_time;
    container->last_update_time = last_update_time;
    container->access_count = access_count;
    container->is_active = is_active;
    
    // 這裡可以實現更詳細的恢復邏輯
    
    return container;
}

// ============================================================================
// 效能監控
// ============================================================================

void consciousness_container_get_stats(consciousness_container_t* container, void* stats_buffer) {
    if (container == NULL || stats_buffer == NULL) {
        return;
    }
    
    // 這裡可以實現詳細的統計信息收集
    // 目前只是簡單的示例
    char* buffer = (char*)stats_buffer;
    sprintf(buffer, "Container ID: %llu\n", container->id);
    sprintf(buffer + strlen(buffer), "State: %d\n", container->state);
    sprintf(buffer + strlen(buffer), "Overall Intensity: %.2f\n", container->overall_intensity);
    sprintf(buffer + strlen(buffer), "Frequency: %.2f\n", container->frequency);
    sprintf(buffer + strlen(buffer), "Access Count: %u\n", container->access_count);
    sprintf(buffer + strlen(buffer), "Is Active: %s\n", container->is_active ? "true" : "false");
}

consciousness_intensity_t consciousness_container_get_overall_intensity(consciousness_container_t* container) {
    if (container == NULL) {
        return 0.0f;
    }
    
    return container->overall_intensity;
} 