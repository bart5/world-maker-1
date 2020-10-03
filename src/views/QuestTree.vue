<template>
  <h2>QuestTree</h2>
  <div class="treeLevel">
    <!-- <div
      v-for="task in task.nextTasks"
      :key="task.id"
      class="taskNode"
    ></div> -->
  </div>
  <div
    class="treeNode"
    :class="{}"
  >
  </div>
  <div class="branch-box">
    <div class="node-box"></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  components: {
  },
})
export default class QuestTree extends Vue {
}
</script>

<style lang="scss">
.branch-box {
  display: flex;
}

.node-box {
  width: 30px;
  height: 30px;
}
</style>
