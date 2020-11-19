<template>
  <div class="board-wrapper">
    <div
      class="board"
      :class="{ 'dragging-board': draggingBoard }"
      ref="board"
      :style="boardStyle"
      @mousedown="startBoardMove"
    >
      <div class="board-background" :style="backgroundStyle"></div>

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
            :modulus="workspaceConfig.modulus"
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

    <Sidebar v-if="projectDataIsLoaded"/>

    <div v-if="isUnsavedData" class="status-bar">UNSAVED CHANGES</div>

  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator';
import TileComponent from '@/views/Tile.vue'
import Curve from '@/views/Curve.vue'
import Sidebar from '@/views/Sidebar.vue'

@Options({
  components: {
    TileComponent,
    Curve,
    Sidebar
  },
})
export default class Frame extends Vue {
  relativeMousePosition = {
    x: 0,
    y: 0,
  }

  workspaceWidth = 10000
  workspaceHeight = 10000
  workspaceScale = 1

  dragInProgress = false
  draggingBoard = false
  resizeInProgress = false

  tabDragInProgress = false
  draggedTabPosition = 0
  draggedTabWorkspaceId = ''

  deleteModeIsOn = false

  get isUnsavedData() {
    return this.$store.getters.isUnsavedData
  }

  @Watch('lastProjectLoadTime')
  handleProjectLoad() {
    this.setupFrame()
  }

  get lastProjectLoadTime() {
    return this.$store.getters.lastProjectLoadTime
  }

  get projectDataIsLoaded() {
    return this.$store.getters.projectDataIsLoaded
  }

  get workspaceStyle() {
    const width = this.workspaceWidth
    const height = this.workspaceHeight
    return {
      minWidth: width + 'px',
      minHeight: height + 'px',
      transform: `scale(${this.workspaceScale})`,
    }
  }

  get backgroundStyle() {
    const width = this.workspaceWidth
    const height = this.workspaceHeight
    return {
      minWidth: width + 'px',
      minHeight: height + 'px',
    }
  }

  get boardStyle() {
    return {
      overflow: (this.dragInProgress || this.resizeInProgress) ? 'hidden' : 'auto',
    }
  }

  setBoardScroll(coords: Coords) {
    this.boardElement.scrollTo(coords.x, coords.y)
  }

  centerOnWorkspaceCenter() {
    const x = this.workspaceWidth * 0.5 - this.boardElement.offsetWidth * 0.5
    const y = this.workspaceHeight * 0.5 - this.boardElement.offsetHeight * 0.5
    this.setBoardScroll({ x, y })
  }

  centerOnTiles() {
    if (this.workspaceConfig.lockView) return

    if (!this.allTilesOfActiveWorkspace?.length) {
      this.centerOnWorkspaceCenter()
      return
    }

    let maxX = 0
    let minX = 0
    let maxY = 0
    let minY = 0
    this.allTilesOfActiveWorkspace.forEach((t, i) => {
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
    if (this.workspaceScale >= 1) {
      this.boardElement.scrollTo(
        /* Ah, yes, famous (1 + this.workspaceScale / 100) adjustment formula. Of course. */
        centerX - this.boardElement.clientWidth * 0.5 * (1 + this.workspaceScale / 100),
        centerY - this.boardElement.clientHeight * 0.5,
      )
    } else {
      this.boardElement.scrollBy(
        this.workspaceElement.getBoundingClientRect().x,
        this.workspaceElement.getBoundingClientRect().y,
      )
      this.boardElement.scrollBy(
        /* Align to center of the viewport */
        centerX * this.workspaceScale - window.innerWidth * 0.5,
        centerY * this.workspaceScale - window.innerHeight * 0.5,
      )
    }
  }

  startBoardMove(e: MouseEvent) {
    if (!this.projectDataIsLoaded) return
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
    this.workspaceScale -= 0.05
  }

  zoomIn() {
    if (this.disableZoom) return
    this.workspaceScale += 0.05
  }

  resetZoom() {
    if (this.disableZoom) return
    this.workspaceScale = 1
    console.log(this)
  }

  get workspaceElement() {
    return this.$refs.workspace as HTMLElement
  }

  get boardElement() {
    return this.$refs.board as HTMLElement
  }

  get repaintTriggerElement() {
    return this.$refs.repaintTrigger as HTMLElement
  }

  get activeWorkspaceId(): string {
    return this.$store.getters.activeWorkspaceId
  }

  get activeWorkspace(): Workspace | undefined {
    return this.$store.getters.activeWorkspace
  }

  get workspaceConfig(): WorkspaceConfiguration {
    if (this.activeWorkspace) {
      return {
        ...this.activeWorkspace.configuration
      }
    }
    return {
      modulus: 1,
      fitToTiles: false,
      lockScale: false,
      lockedScale: 1,
      lockView: false,
      lockedViewPosition: {},
      lockTiles: false,
      lastSessionCamera: null
    }
  }

  onModulusChange() {
    const newModulus = this.workspaceConfig.modulus
    this.snapTilesToModulus(newModulus)
    this.centerOnTiles()
    // this.setWorkspaceConfig({ modulus: newModulus })
  }

  onZoomLockChange() {
    const newValue = this.workspaceConfig.lockScale
    // this.setWorkspaceConfig({ lockScale: newValue, lockedScale: this.workspaceScale })
  }

  onViewLockChange() {
    const newValue = this.workspaceConfig.lockView
    const currentViewPosition = {
      x: this.boardElement.scrollLeft,
      y: this.boardElement.scrollTop
    }
    // this.setWorkspaceConfig({ lockView: newValue, lockedViewPosition: currentViewPosition })
  }

  fitViewToTiles() {
    this.workspaceConfig.lockScale = true
    this.workspaceConfig.lockView = true
  }

  get disableZoom() {
    return this.workspaceConfig.lockScale
  }

  get disableViewChange() {
    return this.workspaceConfig.lockView
  }

  snapTilesToModulus(modulus: number) {
    this.$store.dispatch('snapWorkspaceTilesToModulus', { workspaceId: this.activeWorkspaceId, modulus })
  }

  setWorkspaceConfig(newConfig: Partial<WorkspaceConfiguration>) {
    this.$store.dispatch('setWorkspaceConfig', { workspaceId: this.activeWorkspaceId, newConfig })
  }

  get allTilesOfActiveWorkspace(): Tile[] {
    return this.$store.getters.allTilesOfWorkspace(this.activeWorkspaceId)
  }

  createNewTile() {
    if (this.allTilesOfActiveWorkspace.length) {
      const minDistance = 20
      this.$store.dispatch('createNewTile', {
        x: this.workspaceConfig.modulus < minDistance
          ? minDistance + (minDistance % this.workspaceConfig.modulus)
          : this.workspaceConfig.modulus,
        y: 0
      })
      return
    }
    this.$store.dispatch('createNewTile', {
      x: this.workspaceWidth * 0.5,
      y: this.workspaceHeight * 0.5
    })
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
      if (this.workspaceConfig.lockView) return
      this.boardElement.scrollBy(
        e.movementX < 0 ? -0.95 * e.movementX : -0.9 * e.movementX,
        e.movementY < 0 ? -0.95 * e.movementY : -0.9 * e.movementY
      )
      return
    }
    this.updateRelativeMousePosition(e)
  }

  swapWorkspacesOrder(workspaceToMoveLeft: Workspace, workspaceToMoveRight: Workspace) {
    this.$store.dispatch('swapWorkspacesOrder', { workspaceToMoveLeft, workspaceToMoveRight })
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

  activateNthOrderWorkspace(n: number) {
    this.activateWorkspace(
      this.workspaces.sort((w1, w2) => w1.order - w2.order)[n - 1]?.id || ''
    )
  }

  saveCurrentWorkspaceCamera() {
    this.$store.dispatch('saveCurrentWorkspaceCamera')
  }

  loadWorkspaceCamera() {
    const camera = this.getLastSessionCamera()
    if (!camera) {
      this.centerOnTiles()
      this.workspaceScale = 1
      this.saveCurrentWorkspaceCamera()
    } else {
      this.setBoardScroll({ x: camera.x, y: camera.y })
      this.workspaceScale = camera.scale
    }
  }

  getLastSessionCamera(workspaceId?: string) {
    return this.$store.getters.getLastSessionCamera(workspaceId)
  }

  setupFrame() {
    this.loadWorkspaceCamera()
  }

  mounted() {
    window.addEventListener('keydown', this.keyboardHandler)
    this.$store.dispatch('referenceFrameData', {
      board: this.boardElement,
      workspace: this.workspaceElement
    })
    this.centerOnWorkspaceCenter()
  }
}
</script>

<style lang="scss" scoped>
.board-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  border: 2px solid;
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;

  .board {
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

.workspace {
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
</style>
