<template>
  <div class="frame-wrapper" @mousedown="stopConnectingTiles">
    <div class="top-bar">
      <button @click="createNewTile">Create new tile</button>
      <button @click="centerView">Center view</button>
      <button @click="zoomIn">Zoom in</button>
      <button @click="resetZoom">Reset zoom</button>
      <button @click="zoomOut">Zoom out</button>
    </div>
    <div class="workspace-selector"></div>
    <div
      class="workspace-board"
      ref="board"
      :style="boardStyle"
    >
      <div
        class="workspace"
        ref="workspace"
        :style="workspaceStyle"
        @mousemove="onMousemove"
      >
        <Curve
          class="connector-curve new-connector"
          v-if="connectingInProgress"
          :p1="getTileCoordinates(selectedInputSourceTile)"
          :p2="relativeMousePosition"
        />

        <template v-for="tile in allTilesOfActiveWorkspace" :key="tile.id">
          <Curve
            v-if="!!tile.inputSource"
            class="connector-curve"
            :p1="getTileCoordinates(tile)"
            :p2="getTileCoordinates(getInputSourceTileOfTile(tile))"
          />
          <TileComponent
            :id="tile.id"
            :scale="workspaceScale"
            @connecting="(e) => updateRelativeMousePosition(e)"
            @start-drag="preventScroll = true"
            @stop-drag="preventScroll = false"
            @start-resize="preventScroll = true"
            @stop-resize="preventScroll = false"
          />
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

  workspaceWidth = 5000

  workspaceHeight = 5000

  workspaceScale = 1

  preventScroll = false

  get workspaceStyle() {
    const width = this.workspaceWidth
    const height = this.workspaceHeight
    return {
      minWidth: width + 'px',
      minHeight: height + 'px',
      transform: `scale(${this.workspaceScale})`,
      overflow: this.preventScroll ? 'hidden' : 'auto',
    }
  }

  get boardStyle() {
    return {
      overflow: this.preventScroll ? 'hidden' : 'auto',
    }
  }

  centerView() {
    const x = this.workspaceWidth * 0.5 - this.boardElement.offsetWidth * 0.5
    const y = this.workspaceHeight * 0.5 - this.boardElement.offsetHeight * 0.5
    this.boardElement.scrollTo(x, y)
  }

  // centerOnTiles() {
  //   this.allTilesOfActiveWorkspace.
  // }

  zoomOut() {
    this.workspaceScale -= 0.05
  }

  zoomIn() {
    this.workspaceScale += 0.05
  }

  resetZoom() {
    this.workspaceScale = 1
  }

  centerCoordinates(coords: { x: number, y: number }) {
    return {
      x: coords.x + (this.workspaceWidth * 0.5),
      y: coords.y + (this.workspaceHeight * 0.5),
    }
  }

  // get workspaceWidth() {

  // }

  // get workspaceHeight() {

  // }

  get workspaces(): Workspace[] {
    return this.$store.getters.workspaces
  }

  get workspaceElement() {
    return this.$refs.workspace as HTMLElement
  }

  get boardElement() {
    return this.$refs.board as HTMLElement
  }

  get activeWorkspaceId() {
    return this.$store.getters.getActiveWorkspaceId
  }

  showWorkspace(workspaceId: string) {
    return this.$store.getters.activeWorkspaceId === workspaceId
  }

  get allTilesOfActiveWorkspace(): Tile[] {
    return this.$store.getters.allTilesOfWorkspace(this.activeWorkspaceId)
  }

  activateWorkspace(workspaceId: string) {
    this.$store.dispatch('activateWorkspace', workspaceId)
  }

  createNewWorkspace() {
    this.$store.dispatch('createNewWorkspace')
  }

  createNewTile() {
    if (this.allTilesOfActiveWorkspace.length) {
      this.$store.dispatch('createNewTile')
      return
    }
    this.$store.dispatch('createNewTile', this.centerCoordinates({ x: 0, y: 0 }))
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
    this.centerView()
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
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
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
  overflow: auto;
  position: relative;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

::-webkit-scrollbar {
  display: none;
}

.workspace-selector {
  height: 14px;
  border: 2px solid darkmagenta;
  width: 100%;
}

.workspace {
  --background: #4d4848;
  --grid: #575151;
  --grid-dark: #383535;
  position: relative;
  flex-grow: 1;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background:
    repeating-linear-gradient(
      to left,
      var(--grid-dark) 0px,
      var(--grid-dark) 2px,
      transparent 2px,
      transparent 200px,
    ),
    repeating-linear-gradient(
      to bottom,
      var(--grid-dark) 0px,
      var(--grid-dark) 2px,
      transparent 2px,
      transparent 200px,
    ),
    repeating-linear-gradient(
      to left,
      var(--grid) 0px,
      var(--grid) 2px,
      transparent 2px,
      transparent 20px,
    ),
    repeating-linear-gradient(
      to bottom,
      var(--grid) 0px,
      var(--grid) 2px,
      transparent 2px,
      transparent 20px,
    ),
    repeating-linear-gradient(
      to bottom,
      var(--background) 0px,
      var(--background) 1px,
    ),
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
