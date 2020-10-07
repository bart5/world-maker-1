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
      :class="{ 'dragging-board': draggingBoard }"
      ref="board"
      :style="boardStyle"
      @mousedown="startBoardMove"
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
            :relativeMousePosition="relativeMousePosition"
            @connecting="(e) => updateRelativeMousePosition(e)"
            @start-drag="dragInProgress = true"
            @stop-drag="dragInProgress = false"
            @start-resize="resizeInProgress = true"
            @stop-resize="resizeInProgress = false"
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

  customMouseMovement = {
    x: 0,
    y: 0,
  }

  workspaceWidth = 5000

  workspaceHeight = 5000

  workspaceScale = 1

  dragInProgress = false

  resizeInProgress = false

  draggingBoard = false

  get workspaceStyle() {
    const width = this.workspaceWidth
    const height = this.workspaceHeight
    return {
      minWidth: width + 'px',
      minHeight: height + 'px',
      transform: `scale(${this.workspaceScale})`,
    }
  }

  get boardStyle() {
    return {
      overflow: (this.dragInProgress || this.resizeInProgress) ? 'hidden' : 'auto',
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

  startBoardMove(e: MouseEvent) {
    if (this.dragInProgress || this.resizeInProgress) return
    this.draggingBoard = true
    this.updateRelativeMousePosition(e)
    window.addEventListener('mouseup', this.stopBoardMove)
  }

  stopBoardMove() {
    window.removeEventListener('mousup', this.stopBoardMove)
    this.draggingBoard = false
  }

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
    return this.connectingInProgress || this.dragInProgress || this.resizeInProgress || this.draggingBoard
  }

  onMousemove(e: MouseEvent) {
    if (!this.watchMouseMove) return
    if (this.draggingBoard) {
      this.boardElement.scrollBy(
        e.movementX < 0 ? -0.95 * e.movementX : -0.9 * e.movementX,
        e.movementY < 0 ? -0.95 * e.movementY : -0.9 * e.movementY
      )
      return
    }
    this.updateRelativeMousePosition(e)
  }

  updateRelativeMousePosition(e: MouseEvent) {
    const workspaceRect = this.workspaceElement.getBoundingClientRect()
    const newPositionX = (e.clientX - workspaceRect.x) * (1 / this.workspaceScale)
    const newPositionY = (e.clientY - workspaceRect.y) * (1 / this.workspaceScale)
    this.relativeMousePosition = {
      x: newPositionX,
      y: newPositionY
    }
  }

  keyboardHandler(e: KeyboardEvent) {
    if (e.ctrlKey) {
      switch (e.key) {
        case '+':
          this.zoomIn()
          break;
        case '-':
          this.zoomOut()
          break;
        default:
          break;
      }
    }
  }

  mounted() {
    this.centerView()
    this.createNewTile()
    window.addEventListener('keydown', this.keyboardHandler)
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
  height: 100%;
  display: flex;
  position: relative;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;

  &.dragging-board:hover {
    cursor: all-scroll;
  }
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
  position: absolute;
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
