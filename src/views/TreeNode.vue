<template>
  <div class="branch-box">
    <div
      class="node-box"
      :class="directionClasses"
    >
      <div
        class="current-node"
        :class="directionClasses"
        @click="selectTask(task.id)"
      >
        <span>{{ task.id }}</span>
      </div>
    </div>
    <div class="child-nodes">
      <template v-if="!isLastTask">
        <TreeNode
          v-for="taskId in nextTasks"
          :key="taskId"
          :task="getTaskOfId(taskId)"
          :isBranching="taskId !== nextTasks[0] /*first task is not branching*/"
          @select-task="selectTask"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import staticData from '@/game/data/static'

type direction = 'left' | 'right'

@Options({
  components: {},
  name: 'TreeNode'
})
export default class TreeNode extends Vue {
  @Prop() task!: Task

  @Prop({ default: 0 }) level!: number

  @Prop({ default: 'right' }) direction!: direction

  @Prop({ default: false }) isBranching!: boolean

  customDirection: direction | null = null

  setCustomDirection(value: direction) {
    this.customDirection = value
  }

  get directionClasses() {
    return [!this.isBranching ? 'straight' : '', this.direction, this.task.isFirstTask ? 'isFirstTask' : '']
  }

  get isLastTask() {
    return this.task.isLastTask
  }

  get nextTasks() {
    return this.task.nextTasks
  }

  getTaskOfId(id: string) {
    return staticData.tasks[this.task.questId][id]
  }

  selectTask(id: string) {
    this.$emit('select-task', id)
  }
}
</script>

<style lang="scss">
.branch-box {
  display: flex;
  flex-flow: column;
}
.child-nodes {
  display: flex;
  flex-flow: row nowrap;
}
.node-box {
  position: relative;

  width: 50px;
  height: 50px;

  &:not(.isFirstTask) {
    &:not(.straight) {
      border-top: 3px solid;
    }
    &.right {
      border-right: 3px solid;
    }
    &.left {
      border-left: 3px solid;
    }
  }
}
.current-node {
  position: absolute;
  top: calc(100% - 15px);
  z-index: 2;

  width: 30px;
  height: 30px;
  border: 2px solid green;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;

  transition: background 0.4s;

  &:hover {
    cursor: pointer;
    background-color: lightblue;
  }

  &.right {
    left: calc(100% - 15px);
  }
  &.left {
    left: -15px;
  }
}
</style>
