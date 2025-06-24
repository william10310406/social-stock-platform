#include "superconscious.h"
#include <assert.h>
#include <stdio.h>

int main(void)
{
    SuperConsciousSystem* sys = super_init_system();
    assert(sys != NULL);
    assert(super_get_overall_level(sys) == 0.0f);

    /* 註冊三個節點 */
    assert(super_register_node(sys, "nodeA", 0.3f));
    assert(super_register_node(sys, "nodeB", 0.6f));
    assert(super_register_node(sys, "nodeC", 0.9f));

    float lvl1 = super_get_overall_level(sys);
    assert(lvl1 > 0.5f && lvl1 < 0.7f); /* (0.3+0.6+0.9)/3 = 0.6 */

    /* 觸發 nodeA 超越 */
    assert(super_trigger_transcendence(sys, "nodeA"));
    const char* intuition = super_get_intuition(sys, "nodeA", NULL);
    assert(intuition != NULL);
    printf("nodeA intuition: %s\n", intuition);

    /* 確認 super level 上升 */
    float lvl2 = super_get_overall_level(sys);
    assert(lvl2 > lvl1);

    super_destroy_system(sys);
    printf("All tests passed!\n");
    return 0;
} 