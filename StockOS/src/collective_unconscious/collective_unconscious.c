#include "collective_unconscious.h"
#include "../consciousness/consciousness_container.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <math.h>

// ============================================================================
// 常量定義
// ============================================================================

#define INITIAL_MEMORY_CAPACITY 100
#define INITIAL_NODE_CAPACITY 50
#define INITIAL_SUPERCONSCIOUS_CAPACITY 20
#define MAX_MEMORY_CONTENT_LENGTH 2047
#define MAX_CONTRIBUTORS_LENGTH 511
#define SYNC_PROTOCOL_VERSION "1.0.0"
#define DEFAULT_SYNC_INTERVAL_MS 1000
#define DEFAULT_FUSION_THRESHOLD 0.7f
#define DEFAULT_LEARNING_RATE 0.1f

// ============================================================================
// 內部工具函數
// ============================================================================

// 生成唯一ID
static void generate_unique_id(char* id_buffer, size_t buffer_size) {
    time_t now = time(NULL);
    unsigned int random = (unsigned int)(now % 1000000);
    snprintf(id_buffer, buffer_size, "cloud_%ld_%u", now, random);
}

// 安全的字符串複製
static bool safe_strcpy(char* dest, const char* src, size_t dest_size) {
    if (!dest || !src || dest_size == 0) return false;
    strncpy(dest, src, dest_size - 1);
    dest[dest_size - 1] = '\0';
    return true;
}

// 驗證記憶類型
static bool is_valid_memory_type(CloudMemoryType type) {
    return type >= CLOUD_MEMORY_ARCHETYPE && type <= CLOUD_MEMORY_SHARED;
}

// 驗證強度範圍
static bool is_valid_strength(float strength) {
    return strength >= 0.0f && strength <= 1.0f;
}

// ============================================================================
// 雲端記憶池管理實現
// ============================================================================

CollectiveUnconsciousCloud* create_collective_unconscious_cloud(
    const char* cloud_id,
    const char* cloud_name,
    bool persistent
) {
    if (!cloud_id || !cloud_name) {
        return NULL;
    }

    CollectiveUnconsciousCloud* cloud = malloc(sizeof(CollectiveUnconsciousCloud));
    if (!cloud) {
        return NULL;
    }

    // 初始化基本信息
    safe_strcpy(cloud->cloud_id, cloud_id, sizeof(cloud->cloud_id));
    safe_strcpy(cloud->cloud_name, cloud_name, sizeof(cloud->cloud_name));
    cloud->created_time = time(NULL);
    cloud->last_updated = cloud->created_time;
    cloud->is_persistent = persistent;
    cloud->sync_interval_ms = DEFAULT_SYNC_INTERVAL_MS;
    cloud->fusion_threshold = DEFAULT_FUSION_THRESHOLD;

    // 初始化雲端記憶池
    cloud->memory_pool.memories = malloc(INITIAL_MEMORY_CAPACITY * sizeof(CloudMemory));
    if (!cloud->memory_pool.memories) {
        free(cloud);
        return NULL;
    }
    cloud->memory_pool.capacity = INITIAL_MEMORY_CAPACITY;
    cloud->memory_pool.count = 0;
    cloud->memory_pool.total_collective_strength = 0.0f;
    cloud->memory_pool.last_sync_time = time(NULL);
    pthread_mutex_init(&cloud->memory_pool.mutex, NULL);

    // 初始化意識同步網絡
    cloud->sync_network.nodes = malloc(INITIAL_NODE_CAPACITY * sizeof(SyncNode));
    if (!cloud->sync_network.nodes) {
        free(cloud->memory_pool.memories);
        free(cloud);
        return NULL;
    }
    cloud->sync_network.node_capacity = INITIAL_NODE_CAPACITY;
    cloud->sync_network.node_count = 0;
    cloud->sync_network.network_resonance = 0.0f;
    cloud->sync_network.last_network_sync = time(NULL);
    pthread_mutex_init(&cloud->sync_network.network_mutex, NULL);

    // 初始化集體智慧引擎
    cloud->intelligence_engine.collective_intelligence_level = 0.0f;
    cloud->intelligence_engine.wisdom_patterns_count = 0;
    cloud->intelligence_engine.wisdom_patterns = NULL;
    cloud->intelligence_engine.learning_rate = DEFAULT_LEARNING_RATE;
    cloud->intelligence_engine.last_learning_cycle = time(NULL);
    cloud->intelligence_engine.is_learning_active = false;

    // 初始化意識融合中心
    cloud->fusion_center.fusion_threshold = DEFAULT_FUSION_THRESHOLD;
    cloud->fusion_center.fusion_cycles_count = 0;
    cloud->fusion_center.last_fusion_cycle = time(NULL);
    cloud->fusion_center.fusion_efficiency = 0.0f;
    cloud->fusion_center.is_fusion_active = false;
    pthread_mutex_init(&cloud->fusion_center.fusion_mutex, NULL);

    // 初始化超意識節點
    cloud->superconscious_nodes = malloc(INITIAL_SUPERCONSCIOUS_CAPACITY * sizeof(SuperconsciousNode));
    if (!cloud->superconscious_nodes) {
        free(cloud->sync_network.nodes);
        free(cloud->memory_pool.memories);
        free(cloud);
        return NULL;
    }
    cloud->superconscious_capacity = INITIAL_SUPERCONSCIOUS_CAPACITY;
    cloud->superconscious_count = 0;

    // 初始化統計信息
    cloud->total_containers = 0;
    cloud->active_containers = 0;
    cloud->overall_resonance = 0.0f;
    cloud->collective_consciousness_level = 0.0f;

    // 初始化主鎖
    pthread_mutex_init(&cloud->cloud_mutex, NULL);

    return cloud;
}

void destroy_collective_unconscious_cloud(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) return;

    pthread_mutex_lock(&cloud->cloud_mutex);

    // 清理記憶池
    if (cloud->memory_pool.memories) {
        free(cloud->memory_pool.memories);
    }
    pthread_mutex_destroy(&cloud->memory_pool.mutex);

    // 清理同步網絡
    if (cloud->sync_network.nodes) {
        free(cloud->sync_network.nodes);
    }
    pthread_mutex_destroy(&cloud->sync_network.network_mutex);

    // 清理智慧引擎
    if (cloud->intelligence_engine.wisdom_patterns) {
        free(cloud->intelligence_engine.wisdom_patterns);
    }

    // 清理融合中心
    pthread_mutex_destroy(&cloud->fusion_center.fusion_mutex);

    // 清理超意識節點
    if (cloud->superconscious_nodes) {
        free(cloud->superconscious_nodes);
    }

    // 清理主鎖
    pthread_mutex_unlock(&cloud->cloud_mutex);
    pthread_mutex_destroy(&cloud->cloud_mutex);

    free(cloud);
}

bool add_cloud_memory(
    CollectiveUnconsciousCloud* cloud,
    const char* content,
    CloudMemoryType type,
    const char* contributor_id,
    float collective_strength
) {
    if (!cloud || !content || !contributor_id || !is_valid_memory_type(type) || !is_valid_strength(collective_strength)) {
        return false;
    }

    pthread_mutex_lock(&cloud->memory_pool.mutex);

    // 檢查是否需要擴展容量
    if (cloud->memory_pool.count >= cloud->memory_pool.capacity) {
        int new_capacity = cloud->memory_pool.capacity * 2;
        CloudMemory* new_memories = realloc(cloud->memory_pool.memories, new_capacity * sizeof(CloudMemory));
        if (!new_memories) {
            pthread_mutex_unlock(&cloud->memory_pool.mutex);
            return false;
        }
        cloud->memory_pool.memories = new_memories;
        cloud->memory_pool.capacity = new_capacity;
    }

    // 創建新記憶
    CloudMemory* new_memory = &cloud->memory_pool.memories[cloud->memory_pool.count];
    
    // 生成唯一ID
    generate_unique_id(new_memory->id, sizeof(new_memory->id));
    
    // 設置記憶內容
    safe_strcpy(new_memory->content, content, sizeof(new_memory->content));
    new_memory->type = type;
    new_memory->collective_strength = collective_strength;
    new_memory->created_time = time(NULL);
    new_memory->last_accessed = new_memory->created_time;
    new_memory->access_count = 0;
    new_memory->contributor_count = 1;
    safe_strcpy(new_memory->contributors, contributor_id, sizeof(new_memory->contributors));
    new_memory->is_active = true;
    new_memory->resonance_frequency = calculate_resonance_frequency(cloud);
    memset(new_memory->archetype_pattern, 0, sizeof(new_memory->archetype_pattern));

    // 更新統計信息
    cloud->memory_pool.count++;
    cloud->memory_pool.total_collective_strength += collective_strength;
    cloud->last_updated = time(NULL);

    pthread_mutex_unlock(&cloud->memory_pool.mutex);
    return true;
}

CloudMemory* retrieve_cloud_memory(
    CollectiveUnconsciousCloud* cloud,
    const char* query,
    CloudMemoryType type
) {
    if (!cloud || !query) {
        return NULL;
    }

    pthread_mutex_lock(&cloud->memory_pool.mutex);

    CloudMemory* best_match = NULL;
    float best_score = 0.0f;

    for (int i = 0; i < cloud->memory_pool.count; i++) {
        CloudMemory* memory = &cloud->memory_pool.memories[i];
        
        // 類型過濾
        if (type != CLOUD_MEMORY_SHARED && memory->type != type) {
            continue;
        }

        // 計算匹配分數（簡單的字符串匹配）
        float score = 0.0f;
        if (strstr(memory->content, query) != NULL) {
            score = memory->collective_strength * (1.0f + memory->access_count * 0.1f);
        }

        if (score > best_score) {
            best_score = score;
            best_match = memory;
        }
    }

    // 更新訪問統計
    if (best_match) {
        best_match->access_count++;
        best_match->last_accessed = time(NULL);
    }

    pthread_mutex_unlock(&cloud->memory_pool.mutex);
    return best_match;
}

bool update_cloud_memory_strength(
    CollectiveUnconsciousCloud* cloud,
    const char* memory_id,
    float new_strength
) {
    if (!cloud || !memory_id || !is_valid_strength(new_strength)) {
        return false;
    }

    pthread_mutex_lock(&cloud->memory_pool.mutex);

    for (int i = 0; i < cloud->memory_pool.count; i++) {
        CloudMemory* memory = &cloud->memory_pool.memories[i];
        if (strcmp(memory->id, memory_id) == 0) {
            float old_strength = memory->collective_strength;
            memory->collective_strength = new_strength;
            
            // 更新總強度
            cloud->memory_pool.total_collective_strength = 
                cloud->memory_pool.total_collective_strength - old_strength + new_strength;
            
            cloud->last_updated = time(NULL);
            pthread_mutex_unlock(&cloud->memory_pool.mutex);
            return true;
        }
    }

    pthread_mutex_unlock(&cloud->memory_pool.mutex);
    return false;
}

// ============================================================================
// 意識同步網絡實現
// ============================================================================

bool register_consciousness_container(
    CollectiveUnconsciousCloud* cloud,
    consciousness_container_t* container,
    float sync_strength
) {
    if (!cloud || !container || !is_valid_strength(sync_strength)) {
        return false;
    }

    pthread_mutex_lock(&cloud->sync_network.network_mutex);

    // 檢查是否需要擴展容量
    if (cloud->sync_network.node_count >= cloud->sync_network.node_capacity) {
        int new_capacity = cloud->sync_network.node_capacity * 2;
        SyncNode* new_nodes = realloc(cloud->sync_network.nodes, new_capacity * sizeof(SyncNode));
        if (!new_nodes) {
            pthread_mutex_unlock(&cloud->sync_network.network_mutex);
            return false;
        }
        cloud->sync_network.nodes = new_nodes;
        cloud->sync_network.node_capacity = new_capacity;
    }

    // 創建新同步節點
    SyncNode* new_node = &cloud->sync_network.nodes[cloud->sync_network.node_count];
    
    generate_unique_id(new_node->node_id, sizeof(new_node->node_id));
    snprintf(new_node->container_id, sizeof(new_node->container_id), "%llu", container->id);
    new_node->sync_strength = sync_strength;
    new_node->last_sync_time = time(NULL);
    new_node->is_online = true;
    new_node->consciousness_level = container->overall_intensity;
    safe_strcpy(new_node->sync_protocol, SYNC_PROTOCOL_VERSION, sizeof(new_node->sync_protocol));

    cloud->sync_network.node_count++;
    cloud->total_containers++;
    cloud->active_containers++;
    cloud->last_updated = time(NULL);

    pthread_mutex_unlock(&cloud->sync_network.network_mutex);
    return true;
}

bool unregister_consciousness_container(
    CollectiveUnconsciousCloud* cloud,
    const char* container_id
) {
    if (!cloud || !container_id) {
        return false;
    }

    pthread_mutex_lock(&cloud->sync_network.network_mutex);

    for (int i = 0; i < cloud->sync_network.node_count; i++) {
        SyncNode* node = &cloud->sync_network.nodes[i];
        if (strcmp(node->container_id, container_id) == 0) {
            // 移除節點（移動後面的節點）
            for (int j = i; j < cloud->sync_network.node_count - 1; j++) {
                cloud->sync_network.nodes[j] = cloud->sync_network.nodes[j + 1];
            }
            cloud->sync_network.node_count--;
            cloud->active_containers--;
            cloud->last_updated = time(NULL);
            
            pthread_mutex_unlock(&cloud->sync_network.network_mutex);
            return true;
        }
    }

    pthread_mutex_unlock(&cloud->sync_network.network_mutex);
    return false;
}

bool perform_network_sync(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return false;
    }

    pthread_mutex_lock(&cloud->sync_network.network_mutex);

    // 計算網絡共振頻率
    float total_resonance = 0.0f;
    int active_nodes = 0;

    for (int i = 0; i < cloud->sync_network.node_count; i++) {
        SyncNode* node = &cloud->sync_network.nodes[i];
        if (node->is_online) {
            total_resonance += node->sync_strength * node->consciousness_level;
            active_nodes++;
        }
    }

    if (active_nodes > 0) {
        cloud->sync_network.network_resonance = total_resonance / active_nodes;
    }

    cloud->sync_network.last_network_sync = time(NULL);
    cloud->overall_resonance = cloud->sync_network.network_resonance;
    cloud->last_updated = time(NULL);

    pthread_mutex_unlock(&cloud->sync_network.network_mutex);
    return true;
}

float get_network_resonance(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return 0.0f;
    }
    return cloud->overall_resonance;
}

// ============================================================================
// 集體智慧引擎實現
// ============================================================================

bool start_collective_learning(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return false;
    }

    cloud->intelligence_engine.is_learning_active = true;
    cloud->last_updated = time(NULL);
    return true;
}

bool stop_collective_learning(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return false;
    }

    cloud->intelligence_engine.is_learning_active = false;
    cloud->last_updated = time(NULL);
    return true;
}

bool perform_learning_cycle(CollectiveUnconsciousCloud* cloud) {
    if (!cloud || !cloud->intelligence_engine.is_learning_active) {
        return false;
    }

    // 簡單的學習算法：基於記憶池的集體強度
    float total_strength = cloud->memory_pool.total_collective_strength;
    int total_memories = cloud->memory_pool.count;
    
    if (total_memories > 0) {
        float average_strength = total_strength / total_memories;
        cloud->intelligence_engine.collective_intelligence_level = 
            fminf(1.0f, average_strength * cloud->intelligence_engine.learning_rate);
    }

    cloud->intelligence_engine.last_learning_cycle = time(NULL);
    cloud->collective_consciousness_level = cloud->intelligence_engine.collective_intelligence_level;
    cloud->last_updated = time(NULL);

    return true;
}

float get_collective_intelligence_level(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return 0.0f;
    }
    return cloud->intelligence_engine.collective_intelligence_level;
}

// ============================================================================
// 意識融合中心實現
// ============================================================================

bool start_consciousness_fusion(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return false;
    }

    pthread_mutex_lock(&cloud->fusion_center.fusion_mutex);
    cloud->fusion_center.is_fusion_active = true;
    pthread_mutex_unlock(&cloud->fusion_center.fusion_mutex);
    
    cloud->last_updated = time(NULL);
    return true;
}

bool stop_consciousness_fusion(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return false;
    }

    pthread_mutex_lock(&cloud->fusion_center.fusion_mutex);
    cloud->fusion_center.is_fusion_active = false;
    pthread_mutex_unlock(&cloud->fusion_center.fusion_mutex);
    
    cloud->last_updated = time(NULL);
    return true;
}

bool perform_fusion_cycle(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return false;
    }

    pthread_mutex_lock(&cloud->fusion_center.fusion_mutex);
    
    if (cloud->fusion_center.is_fusion_active) {
        // 計算融合效率（基於網絡共振和集體智慧）
        float resonance_factor = cloud->overall_resonance;
        float intelligence_factor = cloud->intelligence_engine.collective_intelligence_level;
        
        cloud->fusion_center.fusion_efficiency = 
            (resonance_factor + intelligence_factor) / 2.0f;
        
        cloud->fusion_center.fusion_cycles_count++;
        cloud->fusion_center.last_fusion_cycle = time(NULL);
    }
    
    pthread_mutex_unlock(&cloud->fusion_center.fusion_mutex);
    
    cloud->last_updated = time(NULL);
    return true;
}

float get_fusion_efficiency(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return 0.0f;
    }
    return cloud->fusion_center.fusion_efficiency;
}

// ============================================================================
// 超意識節點實現
// ============================================================================

bool create_superconscious_node(
    CollectiveUnconsciousCloud* cloud,
    const char* node_id,
    float initial_level
) {
    if (!cloud || !node_id || !is_valid_strength(initial_level)) {
        return false;
    }

    pthread_mutex_lock(&cloud->cloud_mutex);

    // 檢查是否需要擴展容量
    if (cloud->superconscious_count >= cloud->superconscious_capacity) {
        int new_capacity = cloud->superconscious_capacity * 2;
        SuperconsciousNode* new_nodes = realloc(cloud->superconscious_nodes, 
                                               new_capacity * sizeof(SuperconsciousNode));
        if (!new_nodes) {
            pthread_mutex_unlock(&cloud->cloud_mutex);
            return false;
        }
        cloud->superconscious_nodes = new_nodes;
        cloud->superconscious_capacity = new_capacity;
    }

    // 創建新超意識節點
    SuperconsciousNode* new_node = &cloud->superconscious_nodes[cloud->superconscious_count];
    
    safe_strcpy(new_node->node_id, node_id, sizeof(new_node->node_id));
    new_node->superconscious_level = initial_level;
    memset(new_node->intuition_data, 0, sizeof(new_node->intuition_data));
    memset(new_node->creativity_pattern, 0, sizeof(new_node->creativity_pattern));
    new_node->last_transcendence = time(NULL);
    new_node->is_transcended = false;

    cloud->superconscious_count++;
    cloud->last_updated = time(NULL);

    pthread_mutex_unlock(&cloud->cloud_mutex);
    return true;
}

bool trigger_superconscious_transcendence(
    CollectiveUnconsciousCloud* cloud,
    const char* node_id
) {
    if (!cloud || !node_id) {
        return false;
    }

    pthread_mutex_lock(&cloud->cloud_mutex);

    for (int i = 0; i < cloud->superconscious_count; i++) {
        SuperconsciousNode* node = &cloud->superconscious_nodes[i];
        if (strcmp(node->node_id, node_id) == 0) {
            node->is_transcended = true;
            node->last_transcendence = time(NULL);
            node->superconscious_level = fminf(1.0f, node->superconscious_level + 0.1f);
            
            // 生成直覺數據
            snprintf(node->intuition_data, sizeof(node->intuition_data),
                    "Transcendence achieved at level %.2f", node->superconscious_level);
            
            cloud->last_updated = time(NULL);
            pthread_mutex_unlock(&cloud->cloud_mutex);
            return true;
        }
    }

    pthread_mutex_unlock(&cloud->cloud_mutex);
    return false;
}

const char* get_superconscious_intuition(
    CollectiveUnconsciousCloud* cloud,
    const char* node_id
) {
    if (!cloud || !node_id) {
        return NULL;
    }

    pthread_mutex_lock(&cloud->cloud_mutex);

    for (int i = 0; i < cloud->superconscious_count; i++) {
        SuperconsciousNode* node = &cloud->superconscious_nodes[i];
        if (strcmp(node->node_id, node_id) == 0) {
            pthread_mutex_unlock(&cloud->cloud_mutex);
            return node->intuition_data;
        }
    }

    pthread_mutex_unlock(&cloud->cloud_mutex);
    return NULL;
}

// ============================================================================
// 統計和查詢函數實現
// ============================================================================

CloudStats get_cloud_stats(CollectiveUnconsciousCloud* cloud) {
    CloudStats stats = {0};
    
    if (!cloud) {
        return stats;
    }

    pthread_mutex_lock(&cloud->cloud_mutex);

    stats.total_memories = cloud->memory_pool.count;
    stats.active_containers = cloud->active_containers;
    stats.overall_resonance = cloud->overall_resonance;
    stats.collective_intelligence = cloud->intelligence_engine.collective_intelligence_level;
    stats.fusion_efficiency = cloud->fusion_center.fusion_efficiency;
    stats.superconscious_nodes = cloud->superconscious_count;
    stats.last_sync_time = cloud->sync_network.last_network_sync;

    pthread_mutex_unlock(&cloud->cloud_mutex);
    return stats;
}

void update_collective_unconscious_cloud(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return;
    }

    // 執行各種更新操作
    perform_network_sync(cloud);
    perform_learning_cycle(cloud);
    perform_fusion_cycle(cloud);
    
    cloud->last_updated = time(NULL);
}

// ============================================================================
// 持久化函數實現
// ============================================================================

bool save_collective_unconscious_cloud(
    CollectiveUnconsciousCloud* cloud,
    const char* filename
) {
    if (!cloud || !filename) {
        return false;
    }

    FILE* file = fopen(filename, "wb");
    if (!file) {
        return false;
    }

    pthread_mutex_lock(&cloud->cloud_mutex);

    // 寫入基本信息
    fwrite(cloud->cloud_id, sizeof(cloud->cloud_id), 1, file);
    fwrite(cloud->cloud_name, sizeof(cloud->cloud_name), 1, file);
    fwrite(&cloud->created_time, sizeof(time_t), 1, file);
    fwrite(&cloud->last_updated, sizeof(time_t), 1, file);

    // 寫入記憶池
    fwrite(&cloud->memory_pool.count, sizeof(int), 1, file);
    for (int i = 0; i < cloud->memory_pool.count; i++) {
        fwrite(&cloud->memory_pool.memories[i], sizeof(CloudMemory), 1, file);
    }

    // 寫入同步網絡
    fwrite(&cloud->sync_network.node_count, sizeof(int), 1, file);
    for (int i = 0; i < cloud->sync_network.node_count; i++) {
        fwrite(&cloud->sync_network.nodes[i], sizeof(SyncNode), 1, file);
    }

    // 寫入智慧引擎
    fwrite(&cloud->intelligence_engine, sizeof(CollectiveIntelligenceEngine), 1, file);

    // 寫入融合中心
    fwrite(&cloud->fusion_center, sizeof(ConsciousnessFusionCenter), 1, file);

    // 寫入超意識節點
    fwrite(&cloud->superconscious_count, sizeof(int), 1, file);
    for (int i = 0; i < cloud->superconscious_count; i++) {
        fwrite(&cloud->superconscious_nodes[i], sizeof(SuperconsciousNode), 1, file);
    }

    pthread_mutex_unlock(&cloud->cloud_mutex);
    fclose(file);
    return true;
}

CollectiveUnconsciousCloud* load_collective_unconscious_cloud(const char* filename) {
    if (!filename) {
        return NULL;
    }

    FILE* file = fopen(filename, "rb");
    if (!file) {
        return NULL;
    }

    // 創建新的雲端
    CollectiveUnconsciousCloud* cloud = create_collective_unconscious_cloud("temp", "temp", true);
    if (!cloud) {
        fclose(file);
        return NULL;
    }

    pthread_mutex_lock(&cloud->cloud_mutex);

    // 讀取基本信息
    fread(cloud->cloud_id, sizeof(cloud->cloud_id), 1, file);
    fread(cloud->cloud_name, sizeof(cloud->cloud_name), 1, file);
    fread(&cloud->created_time, sizeof(time_t), 1, file);
    fread(&cloud->last_updated, sizeof(time_t), 1, file);

    // 讀取記憶池
    int memory_count;
    fread(&memory_count, sizeof(int), 1, file);
    for (int i = 0; i < memory_count; i++) {
        if (i >= cloud->memory_pool.capacity) {
            // 擴展容量
            int new_capacity = cloud->memory_pool.capacity * 2;
            CloudMemory* new_memories = realloc(cloud->memory_pool.memories, 
                                               new_capacity * sizeof(CloudMemory));
            if (!new_memories) {
                pthread_mutex_unlock(&cloud->cloud_mutex);
                destroy_collective_unconscious_cloud(cloud);
                fclose(file);
                return NULL;
            }
            cloud->memory_pool.memories = new_memories;
            cloud->memory_pool.capacity = new_capacity;
        }
        fread(&cloud->memory_pool.memories[i], sizeof(CloudMemory), 1, file);
    }
    cloud->memory_pool.count = memory_count;

    // 讀取同步網絡
    int node_count;
    fread(&node_count, sizeof(int), 1, file);
    for (int i = 0; i < node_count; i++) {
        if (i >= cloud->sync_network.node_capacity) {
            // 擴展容量
            int new_capacity = cloud->sync_network.node_capacity * 2;
            SyncNode* new_nodes = realloc(cloud->sync_network.nodes, 
                                         new_capacity * sizeof(SyncNode));
            if (!new_nodes) {
                pthread_mutex_unlock(&cloud->cloud_mutex);
                destroy_collective_unconscious_cloud(cloud);
                fclose(file);
                return NULL;
            }
            cloud->sync_network.nodes = new_nodes;
            cloud->sync_network.node_capacity = new_capacity;
        }
        fread(&cloud->sync_network.nodes[i], sizeof(SyncNode), 1, file);
    }
    cloud->sync_network.node_count = node_count;

    // 讀取智慧引擎
    fread(&cloud->intelligence_engine, sizeof(CollectiveIntelligenceEngine), 1, file);

    // 讀取融合中心
    fread(&cloud->fusion_center, sizeof(ConsciousnessFusionCenter), 1, file);

    // 讀取超意識節點
    int superconscious_count;
    fread(&superconscious_count, sizeof(int), 1, file);
    for (int i = 0; i < superconscious_count; i++) {
        if (i >= cloud->superconscious_capacity) {
            // 擴展容量
            int new_capacity = cloud->superconscious_capacity * 2;
            SuperconsciousNode* new_nodes = realloc(cloud->superconscious_nodes, 
                                                   new_capacity * sizeof(SuperconsciousNode));
            if (!new_nodes) {
                pthread_mutex_unlock(&cloud->cloud_mutex);
                destroy_collective_unconscious_cloud(cloud);
                fclose(file);
                return NULL;
            }
            cloud->superconscious_nodes = new_nodes;
            cloud->superconscious_capacity = new_capacity;
        }
        fread(&cloud->superconscious_nodes[i], sizeof(SuperconsciousNode), 1, file);
    }
    cloud->superconscious_count = superconscious_count;

    pthread_mutex_unlock(&cloud->cloud_mutex);
    fclose(file);
    return cloud;
}

// ============================================================================
// 工具函數實現
// ============================================================================

const char* get_cloud_memory_type_string(CloudMemoryType type) {
    switch (type) {
        case CLOUD_MEMORY_ARCHETYPE:
            return "Archetype Memory";
        case CLOUD_MEMORY_WISDOM:
            return "Collective Wisdom";
        case CLOUD_MEMORY_CULTURAL:
            return "Cultural Memory";
        case CLOUD_MEMORY_EVOLUTIONARY:
            return "Evolutionary Memory";
        case CLOUD_MEMORY_SHARED:
            return "Shared Memory";
        default:
            return "Unknown Memory Type";
    }
}

float calculate_resonance_frequency(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return 0.0f;
    }

    // 基於集體強度和智慧水平的共振頻率計算
    float base_frequency = 1.0f;
    float strength_factor = cloud->memory_pool.total_collective_strength;
    float intelligence_factor = cloud->intelligence_engine.collective_intelligence_level;
    
    return base_frequency * (1.0f + strength_factor + intelligence_factor);
}

bool validate_cloud_integrity(CollectiveUnconsciousCloud* cloud) {
    if (!cloud) {
        return false;
    }

    // 基本完整性檢查
    if (cloud->memory_pool.count < 0 || cloud->memory_pool.count > cloud->memory_pool.capacity) {
        return false;
    }

    if (cloud->sync_network.node_count < 0 || cloud->sync_network.node_count > cloud->sync_network.node_capacity) {
        return false;
    }

    if (cloud->superconscious_count < 0 || cloud->superconscious_count > cloud->superconscious_capacity) {
        return false;
    }

    if (!is_valid_strength(cloud->overall_resonance) || 
        !is_valid_strength(cloud->collective_consciousness_level)) {
        return false;
    }

    return true;
}