<template>
  <h2>QuestTree</h2>
  <div class="treeLevel">
  </div>
  <div
    class="treeNode"
    :class="{}"
  >
  </div>
  <div class="branch-box">
    <div
      class="node-box"
      :class="{ leftArrow, rightArrow }"
    >
      <div class="task"></div>

      <template v-if="!isLastTask">
        <TreeNode
          v-for="task in nextTasks"
          :key="task.id"
          :task="task"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

type direction = 'left' | 'right'

@Options({
  components: {}
})
export default class TreeNode extends Vue {
  @Prop() task!: Task

  @Prop({ default: 0 }) level!: number

  @Prop({ default: 'right' }) direction!: direction

  customDirection: direction | null = null

  setCustomDirection(value: direction) {
    this.customDirection = value
  }

  get isLastTask() {
    return this.task.isLastTask
  }

  get nextTasks() {
    return this.task.nextTasks
  }
}
</script>

<style lang="scss">
.branch-box {
  display: flex;
  flex-flow: row nowrap;
  border: 1px solid red;
}
.node-box {
  width: 30px;
  height: 30px;
}
</style>
