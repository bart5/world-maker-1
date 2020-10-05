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
            v-for="tile in getUnboxedTiles(workspace)"
            :key="tile.id"
            :id="tile.id"
          />
          <TileBox
            v-for="boxId in workspace"
            :key="boxId"
            :id="boxId"
          >
            <TileComponent
              v-for="tile in getTilesFromTheBox(workspace.id, boxId)"
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

  showWorkspace(workspaceId: string) {
    return this.$store.getters.activeWorkspaceId === workspaceId
  }

  getWorkspaceTiles(workspace: Workspace): Tile[] {
    return workspace.tiles.map(tileId => this.getWorkspaceTile(workspace.id, tileId))
  }

  getUnboxedTiles(workspace: Workspace): Tile[] {
    return this.getWorkspaceTiles(workspace).filter(t => t.boxId === '')
  }

  getTilesFromTheBox(workspaceId: string, boxId: string): Tile[] {
    return this.getWorkspaceBox(workspaceId, boxId).tiles.map(tileId => {
      return this.getWorkspaceTile(workspaceId, tileId)
    })
  }

  getWorkspaceBox(workspaceId: string, boxId: string): TileBox {
    return this.$store.getters.getWorkspaceBox({ workspaceId, boxId })
  }

  getBoxedTiles(workspace: Workspace): Tile[] {
    return this.getWorkspaceTiles(workspace).filter(t => t.boxId !== '')
  }

  getWorkspaceTile(workspaceId: string, tileId: string): Tile {
    return this.$store.getters.getTile({ workspaceId, tileId })
  }

  createTile() {

  }

  activeWorkspace() {

  }

  selectWorkspace() {

  }

  createWorkspace() {

  }

  onWorkspaceClick(event: MouseEvent) {

  }

  get workspaceTiles() {

  }

  get workspaces(): Array<Workspace> {
  }

  calcNewTilePosition() {

  }

  getInitialTilePosition() {

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
