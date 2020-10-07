<template>
  <div class="frame-wrapper" @mousedown="stopConnectingTiles">
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
          ref="workspace"
          @mousemove="onMousemove"
        >
          <!-- @click="onWorkspaceClick" -->
          <Curve
            class="connector-curve new-connector"
            v-if="connectingInProgress"
            :p1="getTileCoordinates(selectedInputSourceTile)"
            :p2="relativeMousePosition"
          />

          <template v-for="tile in allTilesOfWorkspace(workspace.id)" :key="tile.id">
            <Curve
              v-if="!!tile.inputSource"
              class="connector-curve"
              :p1="getTileCoordinates(tile)"
              :p2="getTileCoordinates(getInputSourceTileOfTile(tile))"
            />
            <TileComponent :id="tile.id" @connecting="(e) => updateRelativeMousePosition(e)"/>
          </template>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import TileComponent from '@/views/Tile.vue'
import Curve from '@/views/Curve.vue'

@Options({
  components: {
    TileComponent,
    Curve
  },
})
export default class Frame extends Vue {
  relativeMousePosition = {
    x: 0,
    y: 0,
  }

  get workspaces(): Workspace[] {
    return this.$store.getters.workspaces
  }

  get workspaceElement() {
    return this.$refs.workspace as HTMLElement
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

  stopConnectingTiles() {
    if (this.$store.getters.connectingInProgress) {
      this.$store.dispatch('stopConnectingTiles')
    }
  }

  getWorkspaceConnections(workspaceId: string) {
    return this.$store.getters.getWorkspaceConnections(workspaceId)
  }

  getInputSourceTileOfTile(tile: Tile) {
    return this.$store.getters.getInputSourceTileOfTile(tile)
  }

  get selectedInputSourceTile() {
    return this.$store.getters.selectedInputSourceTile
  }

  getTileCoordinates(tile: Tile) {
    return { x: tile.x + 0.5 * tile.width, y: tile.y + 0.5 * tile.height }
  }

  get connectingInProgress() {
    return this.$store.getters.connectingInProgress
  }

  get watchMouseMove() {
    return this.connectingInProgress
  }

  onMousemove(e: MouseEvent) {
    if (!this.watchMouseMove) return
    this.updateRelativeMousePosition(e)
  }

  updateRelativeMousePosition(e: MouseEvent) {
    const workspaceRect = this.workspaceElement.getBoundingClientRect()
    this.relativeMousePosition = {
      x: e.clientX - workspaceRect.x,
      y: e.clientY - workspaceRect.y
    }
  }

  mounted() {
    this.createNewTile()
  }
}
</script>

<style lang="scss" scoped>
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
  display: flex;
  flex-flow: column;
}

.workspace-selector {
  height: 14px;
  border: 2px solid darkmagenta;
  width: 100%;
}

.workspace {
  position: relative;
  flex-grow: 1;
}

.connector-curve {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;

  &.new-connector {
    z-index: 9999;
  }
}
</style>
