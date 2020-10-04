<template>
  <div class="map-wrapper">
    <h1>Quest</h1>
    <div>Selected task id: {{ selectedTask && selectedTask.id }}</div>
    <QuestTree/>
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

@Options({
  components: {
    QuestTree,
    TaskEditor,
  },
})
export default class Quest extends Vue {
  get selectedTask() {
    return this.$store.getters.selectedTask
  }
}
</script>

<style lang="scss">
</style>
