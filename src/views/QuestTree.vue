<template>
  <h2>QuestTree</h2>
  <div class="tree-wrapper">
    <TreeNode
      :task="firstTask"
      @select-task="onSelectTask"
    >
    </TreeNode>
  </div>
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

  onSelectTask(id: string) {
    this.$store.dispatch('selectTask', { questId: this.anyQuest.id, taskId: id })
    console.log('Task :', id, ' selected')
    this.$emit('select-task', { questId: this.anyQuest.id, taskId: id })
  }
}
</script>

<style lang="scss">
.tree-wrapper {
  display: flex;
  justify-content: center;
  width: 500px;
}
</style>
