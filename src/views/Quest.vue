<template>
  <div class="map-wrapper">
    <h1>Quest</h1>
    <div>Selected task id: {{ selectedTask && selectedTask.id }}</div>
    <QuestTree
      @select-task="onSelectTask"
    />
    <TaskEditor
      :selectedTask="selectedTask"
      :isNewTask="false"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import QuestTree from '@/views/QuestTree.vue'
import TaskEditor from '@/views/TaskEditor.vue'
import staticData from '@/game/data/static'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { remote } = window.require('electron')

const electronFs = remote.require('fs')

console.log(electronFs)

const root = electronFs.readdirSync('/')

console.log(root)

@Options({
  components: {
    QuestTree,
    TaskEditor,
  },
})
export default class Quest extends Vue {
  selectedTask: Task | null = null

  onSelectTask({ questId, taskId }: { questId: string; taskId: string }) {
    const task = staticData.tasks[questId][taskId]
    this.selectedTask = task
  }

  // mounted() {
  //   console.log('root: ', root)
  // }
}
</script>

<style lang="scss">
</style>
