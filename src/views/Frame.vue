<template>
  <div class="frame-wrapper" @mousedown="stopConnectingTiles">
    <div class="top-bar">
      <button @click="createNewTile">Create new tile</button>
      <button @click="centerOnTiles">Center view</button>
      <button @click="zoomIn">Zoom in</button>
      <button @click="resetZoom">Reset zoom</button>
      <button @click="zoomOut">Zoom out</button>
      <button :class="{ 'active': tileDeletionInProgress }" @click="onDeleteMode">Delete Mode</button>
    </div>
    <div class="workspace-selector">
      <div
        v-for="workspace in workspaces"
        :key="workspace.id"
        class="workspace-tab"
        :class="{ 'active': workspace.id === activeWorkspaceId }"
        @click="activateWorkspace(workspace.id)"
      >{{ workspace.name }}</div>
      <button
        class="workspace-tab workspace-placeholder-tab"
        @click="createNewWorkspace"
      >+</button>
    </div>
    <div class="board-wrapper">
      <div
        class="workspace-board"
        :class="{ 'dragging-board': draggingBoard }"
        ref="board"
        :style="boardStyle"
        @mousedown="startBoardMove"
      >
        <div class="workspace-background" :style="backgroundStyle"></div>
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

      <div class="status-bar">Status bar</div>
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

  workspaceWidth = 10000

  workspaceHeight = 10000

  workspaceScale = 1

  dragInProgress = false

  resizeInProgress = false

  draggingBoard = false

  tileDeletionInProgress = false

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

  onDeleteMode() {
    if (this.tileDeletionInProgress) {
      this.tileDeletionInProgress = false
      this.$store.dispatch('stopTileDeletion')
    } else {
      this.tileDeletionInProgress = true
      this.$store.dispatch('startTileDeletion')
    }
  }

  startTileDeletion() {
    this.$store.dispatch('startTileDeletion')
  }

  centerOnWorkspaceCenter() {
    const x = this.workspaceWidth * 0.5 - this.boardElement.offsetWidth * 0.5
    const y = this.workspaceHeight * 0.5 - this.boardElement.offsetHeight * 0.5
    this.boardElement.scrollTo(x, y)
  }

  centerOnTiles() {
    if (!this.allTilesOfActiveWorkspace.length) {
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
        /* Align to center of the viewport */
        (centerX - (window.innerWidth * 0.5)) + this.workspaceWidth * (1 - this.workspaceScale),
        (centerY - (window.innerHeight * 0.5)) + this.workspaceHeight * (1 - this.workspaceScale),
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
    this.createNewTile()
    this.centerOnTiles()
    window.addEventListener('keydown', this.keyboardHandler)
  }
}
</script>

<style lang="scss" scoped>
.frame-wrapper {
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
}

.board-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  border: 2px solid;
}

.status-bar {
  display: none;
  position: absolute;
  left: 0;
  bottom: 0;
  height: 16px;
  background: red;
  opacity: 0.7;
  pointer-events: none;
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
  background-color: darkgray;
  height: 24px;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  padding: 0 4px 0 0;

  .workspace-tab {
    background: white;
    border: 1px solid;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    border-bottom: none;
    text-align: center;
    min-width: 30px;
    padding: 0 5px 0 5px;
    margin: 6px 2px 0 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: gray;
    user-select: none;

    &:first-of-type {
      margin-left: 0;
    }

    &.active {
      margin: 2px 2px 0 0;
      background-color: gray;
      background-color: lightgray;
    }

    &:hover {
      cursor: pointer;
    }
  }

  .workspace-placeholder-tab {
    padding: 0 5px;
    font-weight: bold;
    background-color: gray;
  }
}

.workspace {
  position: absolute;
  flex-grow: 1;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.workspace-background {
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
