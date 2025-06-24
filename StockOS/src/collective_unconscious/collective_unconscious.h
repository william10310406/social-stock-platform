#ifndef COLLECTIVE_UNCONSCIOUS_H
#define COLLECTIVE_UNCONSCIOUS_H

#include <stdint.h>
#include <stdbool.h>
#include <time.h>
#include <pthread.h>
#include "../consciousness/consciousness_container.h"


// ============================================================================
// 集體無意識雲端核心數據結構
// ============================================================================

// 雲端記憶類型
typedef enum {
    CLOUD_MEMORY_ARCHETYPE = 0,    // 原型記憶
    CLOUD_MEMORY_WISDOM = 1,       // 集體智慧
    CLOUD_MEMORY_CULTURAL = 2,     // 文化記憶
    CLOUD_MEMORY_EVOLUTIONARY = 3, // 進化記憶
    CLOUD_MEMORY_SHARED = 4        // 共享記憶
} CloudMemoryType;

// 雲端記憶結構
typedef struct {
    char id[64];                    // 記憶唯一標識符
    char content[2048];             // 記憶內容
    CloudMemoryType type;           // 記憶類型
    float collective_strength;      // 集體強度 (0.0-1.0)
    time_t created_time;            // 創建時間
    time_t last_accessed;           // 最後訪問時間
    int access_count;               // 訪問次數
    int contributor_count;          // 貢獻者數量
    char contributors[512];         // 貢獻者ID列表
    bool is_active;                 // 是否活躍
    float resonance_frequency;      // 共振頻率
    char archetype_pattern[256];    // 原型模式
} CloudMemory;

// 雲端記憶池
typedef struct {
    CloudMemory* memories;          // 記憶陣列
    int capacity;                   // 容量
    int count;                      // 當前數量
    float total_collective_strength; // 總集體強度
    time_t last_sync_time;          // 最後同步時間
    pthread_mutex_t mutex;          // 線程安全鎖
} CloudMemoryPool;

// 意識同步節點
typedef struct {
    char node_id[64];               // 節點ID
    char container_id[64];          // 關聯的意識容器ID
    float sync_strength;            // 同步強度
    time_t last_sync_time;          // 最後同步時間
    bool is_online;                 // 是否在線
    float consciousness_level;      // 意識水平
    char sync_protocol[128];        // 同步協議版本
} SyncNode;

// 意識同步網絡
typedef struct {
    SyncNode* nodes;                // 同步節點陣列
    int node_capacity;              // 節點容量
    int node_count;                 // 當前節點數量
    float network_resonance;        // 網絡共振頻率
    time_t last_network_sync;       // 最後網絡同步時間
    pthread_mutex_t network_mutex;  // 網絡同步鎖
} ConsciousnessSyncNetwork;

// 集體智慧引擎
typedef struct {
    float collective_intelligence_level; // 集體智慧水平
    int wisdom_patterns_count;      // 智慧模式數量
    char* wisdom_patterns;          // 智慧模式數據
    float learning_rate;            // 學習速率
    time_t last_learning_cycle;     // 最後學習週期
    bool is_learning_active;        // 學習是否活躍
} CollectiveIntelligenceEngine;

// 意識融合中心
typedef struct {
    float fusion_threshold;         // 融合閾值
    int fusion_cycles_count;        // 融合週期計數
    time_t last_fusion_cycle;       // 最後融合週期
    float fusion_efficiency;        // 融合效率
    bool is_fusion_active;          // 融合是否活躍
    pthread_mutex_t fusion_mutex;   // 融合鎖
} ConsciousnessFusionCenter;

// 超意識節點
typedef struct {
    char node_id[64];               // 節點ID
    float superconscious_level;     // 超意識水平
    char intuition_data[1024];      // 直覺數據
    char creativity_pattern[512];   // 創造力模式
    time_t last_transcendence;      // 最後超越時間
    bool is_transcended;            // 是否已超越
} SuperconsciousNode;

// 集體無意識雲端主結構
typedef struct {
    char cloud_id[64];              // 雲端ID
    char cloud_name[128];           // 雲端名稱
    time_t created_time;            // 創建時間
    time_t last_updated;            // 最後更新時間
    
    // 核心組件
    CloudMemoryPool memory_pool;    // 雲端記憶池
    ConsciousnessSyncNetwork sync_network; // 意識同步網絡
    CollectiveIntelligenceEngine intelligence_engine; // 集體智慧引擎
    ConsciousnessFusionCenter fusion_center; // 意識融合中心
    
    // 超意識節點
    SuperconsciousNode* superconscious_nodes; // 超意識節點陣列
    int superconscious_capacity;    // 超意識節點容量
    int superconscious_count;       // 當前超意識節點數量
    
    // 統計信息
    int total_containers;           // 總容器數量
    int active_containers;          // 活躍容器數量
    float overall_resonance;        // 整體共振頻率
    float collective_consciousness_level; // 集體意識水平
    
    // 配置選項
    bool is_persistent;             // 是否持久化
    char persistence_path[256];     // 持久化路徑
    int sync_interval_ms;           // 同步間隔(毫秒)
    float fusion_threshold;         // 融合閾值
    
    // 線程安全
    pthread_mutex_t cloud_mutex;    // 雲端主鎖
} CollectiveUnconsciousCloud;

// ============================================================================
// 雲端記憶池管理函數
// ============================================================================

/**
 * 創建新的集體無意識雲端
 * @param cloud_id 雲端唯一標識符
 * @param cloud_name 雲端名稱
 * @param persistent 是否啟用持久化
 * @return 雲端指針，失敗返回NULL
 */
CollectiveUnconsciousCloud* create_collective_unconscious_cloud(
    const char* cloud_id,
    const char* cloud_name,
    bool persistent
);

/**
 * 銷毀集體無意識雲端
 * @param cloud 要銷毀的雲端指針
 */
void destroy_collective_unconscious_cloud(CollectiveUnconsciousCloud* cloud);

/**
 * 添加雲端記憶
 * @param cloud 目標雲端
 * @param content 記憶內容
 * @param type 記憶類型
 * @param contributor_id 貢獻者ID
 * @param collective_strength 集體強度
 * @return 成功返回true
 */
bool add_cloud_memory(
    CollectiveUnconsciousCloud* cloud,
    const char* content,
    CloudMemoryType type,
    const char* contributor_id,
    float collective_strength
);

/**
 * 檢索雲端記憶
 * @param cloud 目標雲端
 * @param query 檢索查詢
 * @param type 記憶類型過濾
 * @return 找到的記憶指針，未找到返回NULL
 */
CloudMemory* retrieve_cloud_memory(
    CollectiveUnconsciousCloud* cloud,
    const char* query,
    CloudMemoryType type
);

/**
 * 更新雲端記憶強度
 * @param cloud 目標雲端
 * @param memory_id 記憶ID
 * @param new_strength 新強度
 * @return 成功返回true
 */
bool update_cloud_memory_strength(
    CollectiveUnconsciousCloud* cloud,
    const char* memory_id,
    float new_strength
);

// ============================================================================
// 意識同步網絡函數
// ============================================================================

/**
 * 註冊意識容器到同步網絡
 * @param cloud 目標雲端
 * @param container 意識容器
 * @param sync_strength 同步強度
 * @return 成功返回true
 */
bool register_consciousness_container(
    CollectiveUnconsciousCloud* cloud,
    consciousness_container_t* container,
    float sync_strength
);

/**
 * 從同步網絡註銷意識容器
 * @param cloud 目標雲端
 * @param container_id 容器ID
 * @return 成功返回true
 */
bool unregister_consciousness_container(
    CollectiveUnconsciousCloud* cloud,
    const char* container_id
);

/**
 * 執行網絡同步
 * @param cloud 目標雲端
 * @return 成功返回true
 */
bool perform_network_sync(CollectiveUnconsciousCloud* cloud);

/**
 * 獲取網絡共振頻率
 * @param cloud 目標雲端
 * @return 共振頻率
 */
float get_network_resonance(CollectiveUnconsciousCloud* cloud);

// ============================================================================
// 集體智慧引擎函數
// ============================================================================

/**
 * 啟動集體智慧學習
 * @param cloud 目標雲端
 * @return 成功返回true
 */
bool start_collective_learning(CollectiveUnconsciousCloud* cloud);

/**
 * 停止集體智慧學習
 * @param cloud 目標雲端
 * @return 成功返回true
 */
bool stop_collective_learning(CollectiveUnconsciousCloud* cloud);

/**
 * 執行學習週期
 * @param cloud 目標雲端
 * @return 成功返回true
 */
bool perform_learning_cycle(CollectiveUnconsciousCloud* cloud);

/**
 * 獲取集體智慧水平
 * @param cloud 目標雲端
 * @return 智慧水平 (0.0-1.0)
 */
float get_collective_intelligence_level(CollectiveUnconsciousCloud* cloud);

// ============================================================================
// 意識融合中心函數
// ============================================================================

/**
 * 啟動意識融合
 * @param cloud 目標雲端
 * @return 成功返回true
 */
bool start_consciousness_fusion(CollectiveUnconsciousCloud* cloud);

/**
 * 停止意識融合
 * @param cloud 目標雲端
 * @return 成功返回true
 */
bool stop_consciousness_fusion(CollectiveUnconsciousCloud* cloud);

/**
 * 執行融合週期
 * @param cloud 目標雲端
 * @return 成功返回true
 */
bool perform_fusion_cycle(CollectiveUnconsciousCloud* cloud);

/**
 * 獲取融合效率
 * @param cloud 目標雲端
 * @return 融合效率 (0.0-1.0)
 */
float get_fusion_efficiency(CollectiveUnconsciousCloud* cloud);

// ============================================================================
// 超意識節點函數
// ============================================================================

/**
 * 創建超意識節點
 * @param cloud 目標雲端
 * @param node_id 節點ID
 * @param initial_level 初始超意識水平
 * @return 成功返回true
 */
bool create_superconscious_node(
    CollectiveUnconsciousCloud* cloud,
    const char* node_id,
    float initial_level
);

/**
 * 觸發超意識超越
 * @param cloud 目標雲端
 * @param node_id 節點ID
 * @return 成功返回true
 */
bool trigger_superconscious_transcendence(
    CollectiveUnconsciousCloud* cloud,
    const char* node_id
);

/**
 * 獲取超意識直覺數據
 * @param cloud 目標雲端
 * @param node_id 節點ID
 * @return 直覺數據字符串，失敗返回NULL
 */
const char* get_superconscious_intuition(
    CollectiveUnconsciousCloud* cloud,
    const char* node_id
);

// ============================================================================
// 統計和查詢函數
// ============================================================================

/**
 * 獲取雲端統計信息
 * @param cloud 目標雲端
 * @return 統計信息結構體
 */
typedef struct {
    int total_memories;             // 總記憶數
    int active_containers;          // 活躍容器數
    float overall_resonance;        // 整體共振頻率
    float collective_intelligence;  // 集體智慧水平
    float fusion_efficiency;        // 融合效率
    int superconscious_nodes;       // 超意識節點數
    time_t last_sync_time;          // 最後同步時間
} CloudStats;

CloudStats get_cloud_stats(CollectiveUnconsciousCloud* cloud);

/**
 * 更新雲端狀態
 * @param cloud 目標雲端
 */
void update_collective_unconscious_cloud(CollectiveUnconsciousCloud* cloud);

// ============================================================================
// 持久化函數
// ============================================================================

/**
 * 保存雲端到文件
 * @param cloud 目標雲端
 * @param filename 文件名
 * @return 成功返回true
 */
bool save_collective_unconscious_cloud(
    CollectiveUnconsciousCloud* cloud,
    const char* filename
);

/**
 * 從文件加載雲端
 * @param filename 文件名
 * @return 加載的雲端指針，失敗返回NULL
 */
CollectiveUnconsciousCloud* load_collective_unconscious_cloud(
    const char* filename
);

// ============================================================================
// 工具函數
// ============================================================================

/**
 * 獲取記憶類型字符串
 * @param type 記憶類型
 * @return 類型描述字符串
 */
const char* get_cloud_memory_type_string(CloudMemoryType type);

/**
 * 計算共振頻率
 * @param cloud 目標雲端
 * @return 共振頻率
 */
float calculate_resonance_frequency(CollectiveUnconsciousCloud* cloud);

/**
 * 驗證雲端完整性
 * @param cloud 目標雲端
 * @return 完整性檢查結果
 */
bool validate_cloud_integrity(CollectiveUnconsciousCloud* cloud);

#endif // COLLECTIVE_UNCONSCIOUS_H 