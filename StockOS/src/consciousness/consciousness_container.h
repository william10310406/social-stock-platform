#ifndef CONSCIOUSNESS_CONTAINER_H
#define CONSCIOUSNESS_CONTAINER_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

// ============================================================================
// 意識容器基礎定義
// ============================================================================

// 意識容器ID
typedef uint64_t consciousness_id_t;

// 意識狀態
typedef enum {
    CONSCIOUSNESS_ACTIVE,      // 活躍狀態
    CONSCIOUSNESS_DORMANT,     // 休眠狀態
    CONSCIOUSNESS_DREAMING,    // 夢境狀態
    CONSCIOUSNESS_MEDITATING,  // 冥想狀態
    CONSCIOUSNESS_TRANSCENDED  // 超越狀態
} consciousness_state_t;

// 意識強度 (0.0 - 1.0)
typedef float consciousness_intensity_t;

// 意識頻率 (Hz)
typedef float consciousness_frequency_t;

// ============================================================================
// 表層意識 (Conscious Mind)
// ============================================================================

// 工作記憶
typedef struct {
    void* data;                    // 記憶數據
    size_t size;                   // 記憶大小
    uint64_t access_time;          // 最後訪問時間
    uint32_t access_count;         // 訪問次數
    consciousness_intensity_t intensity; // 記憶強度
} working_memory_t;

// 注意力焦點
typedef struct {
    void* focus_target;            // 焦點目標
    consciousness_intensity_t focus_strength; // 焦點強度
    uint64_t focus_start_time;     // 焦點開始時間
    uint64_t focus_duration;       // 焦點持續時間
} attention_focus_t;

// 思維流
typedef struct {
    void** thoughts;               // 思維內容
    size_t thought_count;          // 思維數量
    size_t max_thoughts;           // 最大思維數量
    consciousness_frequency_t thought_frequency; // 思維頻率
} thought_stream_t;

// 即時感知
typedef struct {
    void* perception_data;         // 感知數據
    size_t perception_size;        // 感知大小
    uint64_t perception_time;      // 感知時間
    consciousness_intensity_t perception_clarity; // 感知清晰度
} immediate_perception_t;

// 決策中心
typedef struct {
    void* decision_data;           // 決策數據
    size_t decision_count;         // 決策數量
    uint64_t last_decision_time;   // 最後決策時間
    consciousness_intensity_t decision_confidence; // 決策信心
} decision_center_t;

// 表層意識結構
typedef struct {
    working_memory_t working_memory;
    attention_focus_t attention;
    thought_stream_t thoughts;
    immediate_perception_t perception;
    decision_center_t decisions;
    consciousness_intensity_t overall_intensity;
} conscious_mind_t;

// ============================================================================
// 前意識 (Preconscious)
// ============================================================================

// 記憶池項目
typedef struct {
    void* memory_data;             // 記憶數據
    size_t memory_size;            // 記憶大小
    uint64_t creation_time;        // 創建時間
    uint64_t last_recall_time;     // 最後喚醒時間
    consciousness_intensity_t recall_strength; // 喚醒強度
    bool is_recallable;            // 是否可喚醒
} memory_pool_item_t;

// 記憶池
typedef struct {
    memory_pool_item_t* items;     // 記憶項目
    size_t item_count;             // 項目數量
    size_t max_items;              // 最大項目數量
    consciousness_intensity_t pool_intensity; // 池強度
} memory_pool_t;

// 記憶索引
typedef struct {
    uint64_t* memory_ids;          // 記憶ID
    size_t* memory_offsets;        // 記憶偏移
    size_t index_size;             // 索引大小
    uint64_t last_index_update;    // 最後索引更新時間
} memory_index_t;

// 關聯網絡節點
typedef struct {
    uint64_t node_id;              // 節點ID
    void* node_data;               // 節點數據
    consciousness_intensity_t association_strength; // 關聯強度
    uint64_t* connected_nodes;     // 連接節點
    size_t connection_count;       // 連接數量
} association_node_t;

// 關聯網絡
typedef struct {
    association_node_t* nodes;     // 網絡節點
    size_t node_count;             // 節點數量
    size_t max_nodes;              // 最大節點數量
    consciousness_intensity_t network_intensity; // 網絡強度
} association_network_t;

// 記憶喚醒機制
typedef struct {
    consciousness_intensity_t recall_threshold; // 喚醒閾值
    uint64_t recall_timeout;       // 喚醒超時
    consciousness_frequency_t recall_frequency; // 喚醒頻率
    bool auto_recall_enabled;      // 自動喚醒啟用
} recall_mechanism_t;

// 前意識結構
typedef struct {
    memory_pool_t recallable_pool;
    memory_index_t index;
    association_network_t associations;
    recall_mechanism_t recall;
    consciousness_intensity_t overall_intensity;
} preconscious_mind_t;

// ============================================================================
// 個人潛意識 (Personal Unconscious)
// ============================================================================

// 壓抑記憶
typedef struct {
    void* memory_data;             // 記憶數據
    size_t memory_size;            // 記憶大小
    uint64_t repression_time;      // 壓抑時間
    consciousness_intensity_t repression_strength; // 壓抑強度
    bool is_traumatic;             // 是否創傷性
} repressed_memory_t;

// 壓抑記憶庫
typedef struct {
    repressed_memory_t* memories;  // 壓抑記憶
    size_t memory_count;           // 記憶數量
    size_t max_memories;           // 最大記憶數量
    consciousness_intensity_t repression_intensity; // 壓抑強度
} repressed_memory_bank_t;

// 創傷記憶
typedef struct {
    void* trauma_data;             // 創傷數據
    size_t trauma_size;            // 創傷大小
    uint64_t trauma_time;          // 創傷時間
    consciousness_intensity_t trauma_intensity; // 創傷強度
    bool is_processed;             // 是否已處理
} trauma_memory_t;

// 情感記憶
typedef struct {
    void* emotion_data;            // 情感數據
    size_t emotion_size;           // 情感大小
    uint64_t emotion_time;         // 情感時間
    consciousness_intensity_t emotion_intensity; // 情感強度
    char emotion_type[32];         // 情感類型
} emotional_memory_t;

// 本能反應
typedef struct {
    void* instinct_data;           // 本能數據
    size_t instinct_size;          // 本能大小
    consciousness_intensity_t instinct_strength; // 本能強度
    bool is_activated;             // 是否激活
    uint64_t activation_time;      // 激活時間
} instinctive_response_t;

// 防禦機制
typedef struct {
    void* defense_data;            // 防禦數據
    size_t defense_size;           // 防禦大小
    consciousness_intensity_t defense_strength; // 防禦強度
    bool is_active;                // 是否活躍
    char defense_type[32];         // 防禦類型
} defense_mechanism_t;

// 個人潛意識結構
typedef struct {
    repressed_memory_bank_t repressed;
    trauma_memory_t trauma;
    emotional_memory_t emotions;
    instinctive_response_t instincts;
    defense_mechanism_t defenses;
    consciousness_intensity_t overall_intensity;
} personal_unconscious_t;

// ============================================================================
// 集體潛意識 (Collective Unconscious)
// ============================================================================

// 原型記憶
typedef struct {
    void* archetype_data;          // 原型數據
    size_t archetype_size;         // 原型大小
    char archetype_name[64];       // 原型名稱
    consciousness_intensity_t archetype_strength; // 原型強度
    uint64_t creation_time;        // 創建時間
} archetype_memory_t;

// 原型記憶庫
typedef struct {
    archetype_memory_t* archetypes; // 原型記憶
    size_t archetype_count;        // 原型數量
    size_t max_archetypes;         // 最大原型數量
    consciousness_intensity_t archetype_intensity; // 原型強度
} archetype_memory_bank_t;

// 集體智慧
typedef struct {
    void* wisdom_data;             // 智慧數據
    size_t wisdom_size;            // 智慧大小
    consciousness_intensity_t wisdom_strength; // 智慧強度
    uint64_t accumulation_time;    // 累積時間
    bool is_accessible;            // 是否可訪問
} collective_wisdom_t;

// 種族記憶
typedef struct {
    void* racial_data;             // 種族數據
    size_t racial_size;            // 種族大小
    consciousness_intensity_t racial_strength; // 種族強度
    char racial_type[32];          // 種族類型
    uint64_t inheritance_time;     // 繼承時間
} racial_memory_t;

// 文化記憶
typedef struct {
    void* cultural_data;           // 文化數據
    size_t cultural_size;          // 文化大小
    consciousness_intensity_t cultural_strength; // 文化強度
    char cultural_type[32];        // 文化類型
    uint64_t formation_time;       // 形成時間
} cultural_memory_t;

// 進化記憶
typedef struct {
    void* evolution_data;          // 進化數據
    size_t evolution_size;         // 進化大小
    consciousness_intensity_t evolution_strength; // 進化強度
    uint64_t evolution_time;       // 進化時間
    bool is_evolving;              // 是否在進化
} evolutionary_memory_t;

// 集體潛意識結構
typedef struct {
    archetype_memory_bank_t archetypes;
    collective_wisdom_t wisdom;
    racial_memory_t racial;
    cultural_memory_t cultural;
    evolutionary_memory_t evolution;
    consciousness_intensity_t overall_intensity;
} collective_unconscious_t;

// ============================================================================
// 超意識 (Superconscious)
// ============================================================================

// 超意識結構
typedef struct {
    void* superconscious_data;     // 超意識數據
    size_t superconscious_size;    // 超意識大小
    consciousness_intensity_t superconscious_strength; // 超意識強度
    uint64_t transcendence_time;   // 超越時間
    bool is_transcended;           // 是否已超越
} superconscious_t;

// ============================================================================
// 個人意識容器 (Consciousness Container)
// ============================================================================

// 個人意識容器
typedef struct {
    consciousness_id_t id;         // 容器ID
    consciousness_state_t state;   // 意識狀態
    consciousness_intensity_t overall_intensity; // 整體強度
    consciousness_frequency_t frequency; // 意識頻率
    
    // 意識層級
    conscious_mind_t conscious;        // 表層意識
    preconscious_mind_t preconscious;  // 前意識
    personal_unconscious_t personal_unconscious; // 個人潛意識
    collective_unconscious_t collective_unconscious; // 集體潛意識
    superconscious_t superconscious;   // 超意識
    
    // 容器統計
    uint64_t creation_time;        // 創建時間
    uint64_t last_update_time;     // 最後更新時間
    uint32_t access_count;         // 訪問次數
    bool is_active;                // 是否活躍
} consciousness_container_t;

// ============================================================================
// 函數聲明
// ============================================================================

// 容器管理
consciousness_container_t* consciousness_container_create(consciousness_id_t id);
void consciousness_container_destroy(consciousness_container_t* container);
void consciousness_container_reset(consciousness_container_t* container);

// 意識狀態管理
void consciousness_container_set_state(consciousness_container_t* container, consciousness_state_t state);
consciousness_state_t consciousness_container_get_state(consciousness_container_t* container);
void consciousness_container_update_intensity(consciousness_container_t* container);

// 表層意識操作
void conscious_mind_init(conscious_mind_t* mind);
void conscious_mind_add_working_memory(conscious_mind_t* mind, void* data, size_t size);
void conscious_mind_set_attention_focus(conscious_mind_t* mind, void* target, consciousness_intensity_t strength);
void conscious_mind_add_thought(conscious_mind_t* mind, void* thought);

// 前意識操作
void preconscious_mind_init(preconscious_mind_t* mind);
void preconscious_mind_add_memory(preconscious_mind_t* mind, void* data, size_t size);
void* preconscious_mind_recall_memory(preconscious_mind_t* mind, uint64_t memory_id);
void preconscious_mind_add_association(preconscious_mind_t* mind, uint64_t node_id, void* data);

// 個人潛意識操作
void personal_unconscious_init(personal_unconscious_t* unconscious);
void personal_unconscious_repress_memory(personal_unconscious_t* unconscious, void* data, size_t size, bool is_traumatic);
void personal_unconscious_add_emotion(personal_unconscious_t* unconscious, void* data, size_t size, const char* emotion_type);
void personal_unconscious_activate_instinct(personal_unconscious_t* unconscious, void* data, size_t size);

// 集體潛意識操作
void collective_unconscious_init(collective_unconscious_t* unconscious);
void collective_unconscious_add_archetype(collective_unconscious_t* unconscious, void* data, size_t size, const char* name);
void collective_unconscious_accumulate_wisdom(collective_unconscious_t* unconscious, void* data, size_t size);
void collective_unconscious_add_cultural_memory(collective_unconscious_t* unconscious, void* data, size_t size, const char* cultural_type);

// 超意識操作
void superconscious_init(superconscious_t* superconscious);
void superconscious_transcend(superconscious_t* superconscious, void* data, size_t size);
bool superconscious_is_transcended(superconscious_t* superconscious);

// 意識同步
void consciousness_container_sync(consciousness_container_t* container);
void consciousness_container_merge(consciousness_container_t* target, consciousness_container_t* source);

// 記憶持久化
void consciousness_container_save(consciousness_container_t* container, const char* filename);
consciousness_container_t* consciousness_container_load(const char* filename);

// 效能監控
void consciousness_container_get_stats(consciousness_container_t* container, void* stats_buffer);
consciousness_intensity_t consciousness_container_get_overall_intensity(consciousness_container_t* container);

#endif // CONSCIOUSNESS_CONTAINER_H 