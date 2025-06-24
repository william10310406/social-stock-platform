#include "superconscious.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* --------------------------- 內部工具 --------------------------- */
static void _recalculate_overall(SuperConsciousSystem* sys)
{
    float total = 0.0f;
    for (int i = 0; i < sys->count; ++i) {
        total += sys->nodes[i].super_level;
    }
    sys->overall_level = (sys->count > 0) ? total / sys->count : 0.0f;
}

static SuperNode* _find_node(SuperConsciousSystem* sys, const char* node_id)
{
    for (int i = 0; i < sys->count; ++i) {
        if (strncmp(sys->nodes[i].node_id, node_id, SUPER_NODE_ID_MAX) == 0) {
            return &sys->nodes[i];
        }
    }
    return NULL;
}

/* --------------------------- API 實作 --------------------------- */
SuperConsciousSystem* super_init_system(void)
{
    SuperConsciousSystem* sys = (SuperConsciousSystem*)malloc(sizeof(SuperConsciousSystem));
    if (!sys) {
        return NULL;
    }
    sys->capacity      = SUPER_INITIAL_CAPACITY;
    sys->count         = 0;
    sys->overall_level = 0.0f;
    sys->created_time  = time(NULL);

    sys->nodes = (SuperNode*)calloc(sys->capacity, sizeof(SuperNode));
    if (!sys->nodes) {
        free(sys);
        return NULL;
    }
    if (pthread_mutex_init(&sys->mutex, NULL) != 0) {
        free(sys->nodes);
        free(sys);
        return NULL;
    }
    return sys;
}

void super_destroy_system(SuperConsciousSystem* sys)
{
    if (!sys) return;
    pthread_mutex_lock(&sys->mutex);
    free(sys->nodes);
    pthread_mutex_unlock(&sys->mutex);
    pthread_mutex_destroy(&sys->mutex);
    free(sys);
}

bool super_register_node(SuperConsciousSystem* sys, const char* node_id, float initial_level)
{
    if (!sys || !node_id || initial_level < 0.0f || initial_level > 1.0f) {
        return false;
    }
    pthread_mutex_lock(&sys->mutex);

    /* 檢查是否已存在 */
    if (_find_node(sys, node_id) != NULL) {
        pthread_mutex_unlock(&sys->mutex);
        return false; /* duplicate */
    }
    /* 擴充容量 */
    if (sys->count >= sys->capacity) {
        int new_cap = sys->capacity * 2;
        SuperNode* new_nodes = (SuperNode*)realloc(sys->nodes, new_cap * sizeof(SuperNode));
        if (!new_nodes) {
            pthread_mutex_unlock(&sys->mutex);
            return false;
        }
        /* zero new memory */
        memset(new_nodes + sys->capacity, 0, (new_cap - sys->capacity) * sizeof(SuperNode));
        sys->nodes    = new_nodes;
        sys->capacity = new_cap;
    }
    /* 初始化節點 */
    SuperNode* node   = &sys->nodes[sys->count++];
    strncpy(node->node_id, node_id, SUPER_NODE_ID_MAX - 1);
    node->node_id[SUPER_NODE_ID_MAX - 1] = '\0';
    node->super_level       = initial_level;
    node->intuition[0]      = '\0';
    node->transcended       = false;
    node->last_transcendence = 0;

    _recalculate_overall(sys);
    pthread_mutex_unlock(&sys->mutex);
    return true;
}

bool super_trigger_transcendence(SuperConsciousSystem* sys, const char* node_id)
{
    if (!sys || !node_id) return false;
    pthread_mutex_lock(&sys->mutex);
    SuperNode* node = _find_node(sys, node_id);
    if (!node) {
        pthread_mutex_unlock(&sys->mutex);
        return false;
    }
    /* 提升超意識水平 */
    if (node->super_level < 1.0f) {
        node->super_level += 0.1f;
        if (node->super_level > 1.0f) node->super_level = 1.0f;
    }
    node->transcended        = true;
    node->last_transcendence = time(NULL);
    /* 生成簡易直覺資料 */
    snprintf(node->intuition, SUPER_INTUITION_MAX, "{\"insight\":\"%s transcended at %ld\"}", node->node_id, (long)node->last_transcendence);

    _recalculate_overall(sys);
    pthread_mutex_unlock(&sys->mutex);
    return true;
}

const char* super_get_intuition(SuperConsciousSystem* sys, const char* node_id, const char* query)
{
    (void)query; /* TODO: 增加關鍵字過濾 */
    if (!sys || !node_id) return NULL;
    pthread_mutex_lock(&sys->mutex);
    SuperNode* node = _find_node(sys, node_id);
    const char* result = (node) ? node->intuition : NULL;
    pthread_mutex_unlock(&sys->mutex);
    return result;
}

float super_get_overall_level(SuperConsciousSystem* sys)
{
    if (!sys) return 0.0f;
    pthread_mutex_lock(&sys->mutex);
    float level = sys->overall_level;
    pthread_mutex_unlock(&sys->mutex);
    return level;
} 