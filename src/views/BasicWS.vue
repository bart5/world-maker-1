<template>
  <div class="workspace-wrapper">
    <div class="top-bar">
      <button :disabled="!activeWorkspace" @click="createNewTile">Create new tile</button>
      <button :disabled="!projectDataIsLoaded" :class="{ 'active': deleteModeIsOn }" @click="onDeleteMode">Delete Mode</button>
    </div>
    <Board :boardId="boardId" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Board from '@/views/Board.vue';

@Options({
  components: {
    Board
  },
})
export default class BasicWS extends Vue {
  get activeWorkspace(): Workspace {
    return this.$store.getters.activeWorkspace
  }

  get boardId() {
    return this.activeWorkspace.selectedInstance
  }
}
</script>

<style lang="scss" scoped>
.workspace-wrapper {
  width: 100%;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-flow: column nowrap;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.top-bar {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  height: 24px;
  background-color: darkgray;

  .widget {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: black;

    .workspace-modulus {
      width: 42px;
    }
  }
}
</style>
