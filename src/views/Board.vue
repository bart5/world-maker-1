<template>
  <div class="board-wrapper" @mousedown="stopConnectingTiles">
    <div v-if="localBoardId" class="top-bar">
      <button @click="centerOnTiles">Center view</button>
      <button :disabled="disableZoom" @click="zoomIn">Zoom in</button>
      <button :disabled="disableZoom" @click="resetZoom">Reset zoom</button>
      <button :disabled="disableZoom" @click="zoomOut">Zoom out</button>
      |
      <div class="widget">
        <label>Mod:
          <input
            type="number"
            min="1" step="1" max="50"
            class="board-modulus"
            v-model="config.modulus"
            @input="onModulusChange"
          >
        </label>
      </div>
      <div class="widget">
        <label>Zoom lock:
          <input type="checkbox" class="board-zoom-lock" v-model="config.lockScale" @change="onZoomLockChange">
        </label>
      </div>
      <div class="widget">
        <label>Anchor view:
          <input type="checkbox" class="board-view-lock" v-model="config.lockView" @change="onViewLockChange">
        </label>
      </div>
    </div>
    <div
      v-if="localBoardId"
      class="board-frame"
      :class="{ 'dragging-board': draggingBoard }"
      ref="boardFrame"
      :style="boardFrameStyle"
      @mousedown="startBoardMove"
    >
      <div class="board-background" :style="backgroundStyle"></div>

      <div
        class="board"
        ref="board"
        :style="boardStyle"
        @mousemove="onMousemove"
      >
        <Curve
          v-if="connectingInProgress"
          class="connector-curve new-connector"
          :p1="getTileCoordinates(selectedInputSourceTile)"
          :p2="relativeMousePosition"
        />

        <template v-for="tile in tiles" :key="tile.id">
          <Curve
            v-if="!!tile.inputSource"
            class="connector-curve"
            :p1="getTileCoordinates(tile)"
            :p2="getTileCoordinates(getInputSourceTileOfTile(tile))"
          />
          <TileComponent
            :id="tile.id"
            :scale="boardScale"
            :modulus="config.modulus"
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
import { Prop, Watch } from 'vue-property-decorator';
import TileComponent from '@/views/Tile.vue'
import Curve from '@/views/Curve.vue'

@Options({
  components: {
    TileComponent,
    Curve,
  },
})
export default class Board extends Vue {
  @Prop() boardId!: string

  localBoardId = ''

  relativeMousePosition = {
    x: 0,
    y: 0,
  }

  boardWidth = 10000
  boardHeight = 10000
  boardScale = 1

  dragInProgress = false
  draggingBoard = false
  resizeInProgress = false

  get tiles(): Tile[] {
    return this.$store.getters.getBoardTiles(this.localBoardId)
  }

  get lastCamera() {
    return this.$store.getters.getBoardCamera(this.localBoardId)
  }

  get config(): BoardConfig {
    // {
    //   modulus: 1,
    //   lockScale: false,
    //   lockedScale: 1,
    //   lockView: false,
    //   lockedViewPosition: {},
    //   lockTiles: false,
    //   lastSessionCamera: null
    // }
    return this.$store.getters.getBoardConfig(this.localBoardId)
  }

  @Watch('boardId')
  handleBoardChange(newBoardId: string) {
    this.saveCamera()
    this.localBoardId = newBoardId
    this.setupBoard()
  }

  beforeUnmount() {
    this.saveCamera()
  }

  get boardStyle() {
    const width = this.boardWidth
    const height = this.boardHeight
    return {
      minWidth: width + 'px',
      minHeight: height + 'px',
      transform: `scale(${this.boardScale})`,
    }
  }

  get backgroundStyle() {
    const width = this.boardWidth
    const height = this.boardHeight
    return {
      minWidth: width + 'px',
      minHeight: height + 'px',
    }
  }

  get boardFrameStyle() {
    return {
      overflow: (this.dragInProgress || this.resizeInProgress) ? 'hidden' : 'auto',
    }
  }

  setBoardScroll(coords: Coords) {
    this.boardFrameElement.scrollTo(coords.x, coords.y)
  }

  centerOnBoardCenter() {
    const x = this.boardWidth * 0.5 - this.boardFrameElement.offsetWidth * 0.5
    const y = this.boardHeight * 0.5 - this.boardFrameElement.offsetHeight * 0.5
    this.setBoardScroll({ x, y })
  }

  centerOnTiles() {
    if (this.config.lockView) return

    if (!this.tiles?.length) {
      this.centerOnBoardCenter()
      return
    }

    let maxX = 0
    let minX = 0
    let maxY = 0
    let minY = 0
    this.tiles.forEach((t, i) => {
      if (i === 0) {
        maxX = t.x + t.width
        minX = t.x
        maxY = t.y + t.height
        minY = t.y
      } else {
        maxX = Math.max(maxX, t.x + t.width)
        minX = Math.min(minX, t.x)
        maxY = Math.max(maxY, t.y + t.height)
        minY = Math.min(minY, t.y)
      }
    })
    const centerX = 0.5 * (minX + maxX)
    const centerY = 0.5 * (minY + maxY)
    if (this.boardScale >= 1) {
      this.boardFrameElement.scrollTo(
        /* Ah, yes, famous (1 + this.boardScale / 100) adjustment formula. Of course. */
        centerX - this.boardFrameElement.clientWidth * 0.5 * (1 + this.boardScale / 100),
        centerY - this.boardFrameElement.clientHeight * 0.5,
      )
    } else {
      this.boardFrameElement.scrollBy(
        this.boardElement.getBoundingClientRect().x,
        this.boardElement.getBoundingClientRect().y,
      )
      this.boardFrameElement.scrollBy(
        /* Align to center of the viewport */
        centerX * this.boardScale - window.innerWidth * 0.5,
        centerY * this.boardScale - window.innerHeight * 0.5,
      )
    }
  }

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
    if (this.disableZoom) return
    this.boardScale -= 0.05
  }

  zoomIn() {
    if (this.disableZoom) return
    this.boardScale += 0.05
  }

  resetZoom() {
    if (this.disableZoom) return
    this.boardScale = 1
    console.log(this)
  }

  get boardElement() {
    return this.$refs.board as HTMLElement
  }

  get boardFrameElement() {
    return this.$refs.boardFrame as HTMLElement
  }

  onModulusChange() {
    const newModulus = this.config.modulus
    this.snapTilesToModulus(newModulus)
    this.centerOnTiles()
    this.setconfig({ modulus: newModulus })
  }

  onZoomLockChange() {
    const newValue = this.config.lockScale
    this.setconfig({ lockScale: newValue, lockedScale: this.boardScale })
  }

  onViewLockChange() {
    const newValue = this.config.lockView
    const currentViewPosition = {
      x: this.boardFrameElement.scrollLeft,
      y: this.boardFrameElement.scrollTop
    }
    this.setconfig({ lockView: newValue, lockedViewPosition: currentViewPosition })
  }

  get disableZoom() {
    return this.config.lockScale
  }

  get disableViewChange() {
    return this.config.lockView
  }

  snapTilesToModulus(modulus: number) {
    // this.$store.dispatch('snapWorkspaceTilesToModulus', { workspaceId: this.activeWorkspaceId, modulus })
    this.$store.dispatch('snapBoardTilesToModulus', { boardId: this.localBoardId, modulus })
  }

  setconfig(newConfig: Partial<BoardConfig>) {
    // this.$store.dispatch('setconfig', { workspaceId: this.activeWorkspaceId, newConfig })
    this.$store.dispatch('setBoardConfig', { boardId: this.localBoardId, newConfig })
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
      if (this.config.lockView) return
      this.boardFrameElement.scrollBy(
        e.movementX < 0 ? -0.95 * e.movementX : -0.9 * e.movementX,
        e.movementY < 0 ? -0.95 * e.movementY : -0.9 * e.movementY
      )
      return
    }
    this.updateRelativeMousePosition(e)
  }

  updateRelativeMousePosition(e: MouseEvent) {
    const boardRect = this.boardElement.getBoundingClientRect()
    const newPositionX = (e.clientX - boardRect.x) * (1 / this.boardScale)
    const newPositionY = (e.clientY - boardRect.y) * (1 / this.boardScale)
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

  saveCamera() {
    // this.$store.dispatch('saveCurrentWorkspaceCamera')
    this.$store.dispatch('saveBoardCamera', { boardId: this.localBoardId, camera: this.camera })
  }

  get camera(): Camera {
    return {
      x: this.boardFrameElement.scrollLeft || 0,
      y: this.boardFrameElement.scrollTop || 0,
      scale: this.boardScale
    }
  }

  loadCamera() {
    if (!this.lastCamera) {
      if (this.tiles.length) {
        this.centerOnTiles()
      } else {
        this.centerOnBoardCenter()
      }
      this.boardScale = 1
      this.saveCamera()
    } else {
      this.setBoardScroll({ x: this.lastCamera.x, y: this.lastCamera.y })
      this.boardScale = this.lastCamera.scale
    }
  }

  setupBoard() {
    this.$store.dispatch('referenceBoardData', {
      boardFrame: this.boardFrameElement,
      board: this.boardElement
    })
    this.loadCamera()
  }

  mounted() {
    window.addEventListener('keydown', this.keyboardHandler)
    this.localBoardId = this.boardId
    // this.$store.dispatch('referenceFrameData', {
    //   board: this.boardFrameElement,
    //   workspace: this.boardElement
    // })
    // this.centerOnBoardCenter()
    // this.loadCamera()
  }
}
</script>

<style lang="scss" scoped>
.board-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-flow: column;
  overflow: hidden;

  .board-frame {
    height: 100%;
    width: 100%;
    display: flex;
    position: relative;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;

    &.dragging-board:hover {
      cursor: all-scroll;
    }
  }

  .status-bar {
    // display: none;
    position: absolute;
    left: 0;
    bottom: 0;
    height: 16px;
    background: red;
    opacity: 0.7;
    pointer-events: none;
  }
}

::-webkit-scrollbar {
  display: none;
}

.board {
  position: absolute;
  flex-grow: 1;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.board-background {
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

    .board-modulus {
      width: 42px;
    }
  }
}
</style>
