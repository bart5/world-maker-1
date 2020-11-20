<template>
  <div class="workspace-wrapper">
    <div class="top-bar">
      <button :disabled="!activeWorkspace" @click="createNewTile">Create new tile</button>
      <button :class="{ 'active': deleteModeIsOn }" @click="onDeleteMode">Delete Mode</button>
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
export default class TypesWS extends Vue {
  deleteModeIsOn = false

  get activeWorkspace(): Workspace {
    return this.$store.getters.activeWorkspace
  }

  get boardId() {
    return this.activeWorkspace.activeBoardId
  }

  createNewTile(id: string) {
    this.$store.dispatch('createNewTile', { boardId: this.boardId, id })
  }

  // This is supposed to run only when new project is loaded
  // for the very first time.
  mounted() {
    console.log('active workspace: ', this.activeWorkspace)
    console.log('board id: ', this.boardId)
    const tiles = this.$store.getters.getBoardTiles(this.boardId)
    const types: TypeWrapper[] = this.$store.getters.types
    if (tiles.length === 0) {
      types.forEach((tw) => this.createNewTile(tw.id))
    }
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
