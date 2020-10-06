<template>
  <div class="frame-wrapper">
    <div class="top-bar">
      <button @click="createNewTile">Create new tile</button>
    </div>
    <div class="workspace-board">
      <div class="workspace-selector">
      </div>
        <div
          v-show="showWorkspace(workspace.id)"
          v-for="workspace in workspaces"
          :key="workspace.id"
          class="workspace"
        >
          <!-- @click="onWorkspaceClick" -->
          <TileComponent
            v-for="tile in allTilesOfWorkspace(workspace.id)"
            :key="tile.id"
            :id="tile.id"
          />
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import TileComponent from '@/views/Tile.vue'

@Options({
  components: {
    TileComponent
  },
})
export default class Frame extends Vue {
  get workspaces(): Workspace[] {
    return this.$store.getters.workspaces
  }

  showWorkspace(workspaceId: string) {
    return this.$store.getters.activeWorkspaceId === workspaceId
  }

  allTilesOfWorkspace(workspaceId: string): Tile[] {
    return this.$store.getters.allTilesOfWorkspace(workspaceId)
  }

  activateWorkspace(workspaceId: string) {
    this.$store.dispatch('activateWorkspace', workspaceId)
  }

  createNewWorkspace() {
    this.$store.dispatch('createNewWorkspace')
  }

  createNewTile() {
    this.$store.dispatch('createNewTile')
  }

  mounted() {
    this.createNewTile()
  }
}
</script>

<style lang="scss">
.frame-wrapper {
  width: 100%;
  height: 100%;
  max-height: 100%;
  border: 3px solid purple;
  display: flex;
  flex-flow: column nowrap;
}

.top-bar {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  height: 24px;
  background-color: darkgray;
}

.workspace-board {
  border: 2px dashed;
  height: 100%;
}

.workspace-selector {
  height: 14px;
  border: 2px solid darkmagenta;
  width: 100%;
}

.workspace {
  position: relative;
}
</style>
