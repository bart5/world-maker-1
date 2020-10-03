<template>
  <h2>QuestTree</h2>
  <TreeNode
    :task="firstTask"
  >
  </TreeNode>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import staticData from '@/game/data/static'
import TreeNode from '@/views/TreeNode.vue'

@Options({
  components: {
    TreeNode
  },
})
export default class QuestTree extends Vue {
  get quests() {
    return staticData.quests
  }

  get anyQuest() {
    return this.quests[Object.keys(this.quests)[0]]
  }

  get firstTask() {
    return staticData.tasks[this.anyQuest.id][this.anyQuest.firstTask]
  }
}
</script>

<style lang="scss">
</style>
