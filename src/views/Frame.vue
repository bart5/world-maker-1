<template>
  <div class="frame-wrapper">
    <div class="top-bar">
    </div>
    <div class="workspace-board">
      <div class="workspace-selector">
      </div>
        <div
          v-show="showWorkspace(workspace)"
          v-for="workspace in workspaces"
          :key="workspace.id"
          class="workspace"
          @click="onWorkspaceClick"
        >
          <TileComponent
            v-for="tile in allFreeTilesOfWorkspace(workspace.id)"
            :key="tile.id"
            :id="tile.id"
          />
          <TileBox
            v-for="box in allBoxesOfWorkspace(workspace.id)"
            :key="box.id"
            :id="box.id"
          >
            <TileComponent
              v-for="tile in workspaceTilesOfBox(workspace.id, box.id)"
              :key="tile.id"
              :id="tile.id"
            />
          </TileBox>
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

  allFreeTilesOfWorkspace(workspaceId: string): Tile[] {
    return this.$store.getters.allFreeTilesOfWorkspace(workspaceId)
  }

  allBoxedTilesOfWorkspace(workspaceId: string): Tile[] {
    return this.$store.getters.allBoxedTilesOfWorkspace(workspaceId)
  }

  allBoxesOfWorkspace(workspaceId: string): Tile[] {
    return this.$store.getters.allBoxesOfWorkspace(workspaceId)
  }

  workspaceTilesOfBox(workspaceId: string, boxId: string): { [boxId: string]: Tile[] } {
    return this.$store.getters.workspaceTilesOfBox(workspaceId, boxId)
  }

  activateWorkspace(workspaceId: string) {
    this.$store.dispatch('activateWorkspace', workspaceId)
  }

  createNewWorkspace() {
    this.$store.dispatch('createNewWorkspace')
  }

  setTileInput() {

  }

  onTileDrag() {

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
