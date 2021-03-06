<template>
  <div class="frame-wrapper" @mousedown="stopConnectingTiles">
    <div class="top-bar">
      <button :disabled="!activeWorkspace" @click="createNewTile">Create new tile</button>
      <button :disabled="!activeWorkspace" @click="centerOnTiles">Center view</button>
      <button :disabled="!activeWorkspace || disableZoom" @click="zoomIn">Zoom in</button>
      <button :disabled="!activeWorkspace || disableZoom" @click="resetZoom">Reset zoom</button>
      <button :disabled="!activeWorkspace || disableZoom" @click="zoomOut">Zoom out</button>
      <button :disabled="!projectDataIsLoaded" :class="{ 'active': deleteModeIsOn }" @click="onDeleteMode">Delete Mode</button>
      |
      <div class="widget">
        <label>Mod:
          <input
            :disabled="!projectDataIsLoaded"
            type="number"
            min="1"
            step="1"
            max="50"
            class="workspace-modulus"
            v-model="workspaceConfig.modulus"
            @input="onModulusChange"
          >
        </label>
      </div>
      <div class="widget">
        <label>Zoom lock:
          <input :disabled="!projectDataIsLoaded" type="checkbox" class="workspace-zoom-lock" v-model="workspaceConfig.lockScale" @change="onZoomLockChange">
        </label>
      </div>
      <div class="widget">
        <label>Anchor view:
          <input :disabled="!projectDataIsLoaded" type="checkbox" class="workspace-view-lock" v-model="workspaceConfig.lockView" @change="onViewLockChange">
        </label>
      </div>
    </div>
    <div class="workspace-selector">
      <template v-if="projectDataIsLoaded">
        <div
          v-for="workspace in workspaces"
          :key="workspace.id"
          :ref="`tab_${workspace.id}`"
          class="workspace-tab"
          :class="{
            'active': workspace.id === activeWorkspaceId,
            'inDeleteMode': deleteModeIsOn,
            'isDragged': getTabIsDragged(workspace.id),
          }"
          :style="getTabIsDragged(workspace.id) ? dragTabStyle : { order: workspace.order * 10 }"
        >
          <div
            @dblclick="startRenamingWorkspace(workspace)"
            @mousedown="(e) => onWorkspaceTabMousedown(e, workspace.id)"
          >
            <input
              v-if="workspaceToRename === workspace.id"
              ref="workspaceNameInput"
              type="text"
              v-model="newWorkspaceName"
              @blur="stopRenamingWorkspace"
              @keydown="(e) => e.key === 'Enter' && renameWorkspace(workspace.id)"
            >
            <span v-else>{{ workspace.name }}</span>
          </div>
          <button
            v-if="deleteModeIsOn"
            class="delete-workspace"
            @click="(e) => tryDeleteWorkspace(e, workspace)"
          >x</button>
        </div>
      </template>

      <div
        v-if="tabDragInProgress"
        class="workspace-tab invisible-tab"
        :style="{ order: (draggedTabWorkspace.order - 1) * 10 + 1 }"
      >
        <span>{{ draggedTabWorkspace.name }}</span>
      </div>

      <button
        :disabled="!projectDataIsLoaded"
        class="workspace-tab add-new-tab-tab"
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

    <div class="repaint-trigger" ref="repaintTrigger"></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator';
import TileComponent from '@/components/Tile.vue'
import Curve from '@/components/Curve.vue'
import Sidebar from '@/components/Sidebar.vue'

@Options({
  components: {
    TileComponent,
    Curve,
    Sidebar
  },
})
export default class FrameOld extends Vue {
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

  deleteModeIsOn = false

  workspaceToRename = ''

  newWorkspaceName = ''

  tabDragInProgress = false

  draggedTabPosition = 0

  draggedTabWorkspaceId = ''

  get isUnsavedData() {
    return this.$store.getters.isUnsavedData
  }

  get lastProjectSaveTime() {
    return this.$store.getters.lastProjectSaveTime
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

  onDeleteMode() {
    if (this.deleteModeIsOn) {
      this.deleteModeIsOn = false
      this.$store.dispatch('stopTileDeletion')
      this.$store.dispatch('startWorkspaceDeletion')
    } else {
      this.deleteModeIsOn = true
      this.$store.dispatch('startTileDeletion')
      this.$store.dispatch('startWorkspaceDeletion')
    }
  }

  startTileDeletion() {
    this.$store.dispatch('startTileDeletion')
  }

  startWorkspaceDeletion() {
    this.$store.dispatch('startWorkspaceDeletion')
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

  get workspaces(): Workspace[] {
    return this.$store.getters.workspaces
  }

  get workspaceElement() {
    return this.$refs.workspace as HTMLElement
  }

  get boardElement() {
    return this.$refs.board as HTMLElement
  }

  getWorkspaceNameInputElement() {
    return this.$refs.workspaceNameInput as HTMLInputElement
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

  // get workspaceConfig(): WorkspaceConfiguration {
  get workspaceConfig() {
    if (this.activeWorkspace) {
      // return {
      //   ...this.activeWorkspace.configuration
      // }
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
    this.setWorkspaceConfig({ modulus: newModulus })
    this.snapTilesToModulus(newModulus)
    this.centerOnTiles()
  }

  onZoomLockChange() {
    const newValue = this.workspaceConfig.lockScale
    this.setWorkspaceConfig({ lockScale: newValue, lockedScale: this.workspaceScale })
  }

  onViewLockChange() {
    const newValue = this.workspaceConfig.lockView
    const currentViewPosition = {
      x: this.boardElement.scrollLeft,
      y: this.boardElement.scrollTop
    }
    this.setWorkspaceConfig({ lockView: newValue, lockedViewPosition: currentViewPosition })
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

  // setWorkspaceConfig(newConfig: Partial<WorkspaceConfiguration>) {
  setWorkspaceConfig(newConfig: any) {
    this.$store.dispatch('setWorkspaceConfig', { workspaceId: this.activeWorkspaceId, newConfig })
  }

  get allTilesOfActiveWorkspace(): Tile[] {
    return this.$store.getters.allTilesOfWorkspace(this.activeWorkspaceId)
  }

  activateWorkspace(workspaceId: string) {
    this.saveCurrentWorkspaceCamera()
    this.$store.dispatch('activateWorkspace', workspaceId)
    this.loadWorkspaceCamera()
  }

  createNewWorkspace() {
    this.$store.dispatch('createNewWorkspace')
  }

  tryDeleteWorkspace(e: MouseEvent, workspace: Workspace) {
    const decision = window.confirm(`You are about to permanently delete workspace ${workspace.name}.`)
    if (decision) {
      this.deleteWorkspace(workspace.id)
    }
  }

  deleteWorkspace(workspaceId: string) {
    this.$store.dispatch('deleteWorkspace', workspaceId)
  }

  async startRenamingWorkspace(workspace: Workspace) {
    this.workspaceToRename = workspace.id
    this.newWorkspaceName = workspace.name
    window.setTimeout(() => {
      this.getWorkspaceNameInputElement().focus()
    })
  }

  stopRenamingWorkspace() {
    this.newWorkspaceName = ''
    this.workspaceToRename = ''
  }

  renameWorkspace(workspaceId: string) {
    this.$store.dispatch('renameWorkspace', { workspaceId, newName: this.newWorkspaceName })
    this.stopRenamingWorkspace()
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

  onWorkspaceTabMousedown(e: MouseEvent, workspaceId: string) {
    const tab = this.$refs[`tab_${workspaceId}`] as HTMLLIElement
    const tabRect = tab.getBoundingClientRect()
    const grabOffset = e.clientX - tabRect.x
    const start = e.clientX
    const threshold = 10

    const activateWorkspace = () => {
      window.removeEventListener('mousemove', maybeStartDrag)
      window.removeEventListener('mouseup', activateWorkspace)
      this.activateWorkspace(workspaceId)
    }

    const maybeStartDrag = (ev: MouseEvent) => {
      if (threshold < Math.abs(start - ev.clientX)) {
        window.removeEventListener('mousemove', maybeStartDrag)
        window.removeEventListener('mouseup', activateWorkspace)

        const onTabDrag = this.getOnTabDrag(e, grabOffset, tab)
        window.addEventListener('mousemove', onTabDrag)

        this.tabDragInProgress = true
        this.draggedTabWorkspaceId = workspaceId

        const stopDrag = () => {
          this.tabDragInProgress = false
          this.draggedTabWorkspaceId = ''
          this.draggedTabPosition = 0
          window.removeEventListener('mousemove', onTabDrag)
          window.removeEventListener('mouseup', stopDrag)
        }
        window.addEventListener('mouseup', stopDrag)
      }
    }

    window.addEventListener('mousemove', maybeStartDrag)
    window.addEventListener('mouseup', activateWorkspace)
  }

  getPreviousTabWorkspace(workspace: Workspace): Workspace | undefined {
    return this.workspaces.filter((w) => w.order < workspace.order).sort((w1, w2) => w2.order - w1.order)[0]
  }

  getNextTabWorkspace(workspace: Workspace): Workspace | undefined {
    return this.workspaces.filter((w) => w.order > workspace.order).sort((w1, w2) => w1.order - w2.order)[0]
  }

  get draggedTabWorkspace() {
    return this.workspaces.filter((w) => w.id === this.draggedTabWorkspaceId)[0]
  }

  get tabOnTheLeftFromDragged() {
    const workspace = this.draggedTabWorkspace
    if (!workspace) return null
    const workspaceOnTheLeft = this.getPreviousTabWorkspace(workspace)
    if (workspaceOnTheLeft) {
      const tabRect = (this.$refs[`tab_${workspaceOnTheLeft.id}`] as HTMLLIElement).getBoundingClientRect()
      return {
        tabRect,
        workspace: workspaceOnTheLeft
      }
    }
    return null
  }

  get tabOnTheRightFromDragged() {
    const workspace = this.draggedTabWorkspace
    if (!workspace) return null
    const workspaceOnTheRight = this.getNextTabWorkspace(workspace)
    if (workspaceOnTheRight) {
      const tabRect = (this.$refs[`tab_${workspaceOnTheRight.id}`] as HTMLLIElement).getBoundingClientRect()
      return {
        tabRect,
        workspace: workspaceOnTheRight
      }
    }
    return null
  }

  getOnTabDrag(initiatingEvent: MouseEvent, grabOffset: number, tab: HTMLLIElement) {
    const adjustTabs = (e: MouseEvent) => {
      const draggedTabRect = tab.getBoundingClientRect()
      this.draggedTabPosition = e.clientX - grabOffset

      window.setTimeout(() => {
        if (this.tabOnTheLeftFromDragged && draggedTabRect.x < (this.tabOnTheLeftFromDragged.tabRect.x + this.tabOnTheLeftFromDragged.tabRect.width * 0.5)) {
          this.swapWorkspacesOrder(this.draggedTabWorkspace, this.tabOnTheLeftFromDragged.workspace)
        } else if (this.tabOnTheRightFromDragged && draggedTabRect.x + draggedTabRect.width > (this.tabOnTheRightFromDragged.tabRect.x + this.tabOnTheRightFromDragged.tabRect.width * 0.5)) {
          this.swapWorkspacesOrder(this.tabOnTheRightFromDragged.workspace, this.draggedTabWorkspace)
        }
      })
    }

    adjustTabs(initiatingEvent)

    return (e: MouseEvent) => {
      adjustTabs(e)
    }
  }

  get dragTabStyle() {
    return {
      left: this.draggedTabPosition + 'px'
    }
  }

  getTabIsDragged(workspaceId: string) {
    return this.tabDragInProgress && workspaceId === this.draggedTabWorkspaceId
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

  activatePreviousTabWorkspace() {
    if (!this.activeWorkspace) return
    const workspace = this.getPreviousTabWorkspace(this.activeWorkspace)
    if (workspace) {
      this.activateWorkspace(workspace.id)
    }
  }

  activateNextTabWorkspace() {
    if (!this.activeWorkspace) return
    const workspace = this.getNextTabWorkspace(this.activeWorkspace)
    if (workspace) {
      this.activateWorkspace(workspace.id)
    }
  }

  keyboardHandler(e: KeyboardEvent) {
    if (!this.projectDataIsLoaded) return

    if (e.ctrlKey) {
      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          this.activateNthOrderWorkspace(Number(e.key))
          break;
        case 'PageUp':
          this.activatePreviousTabWorkspace()
          break;
        case 'PageDown':
          this.activateNextTabWorkspace()
          break;
        case '+':
          this.zoomIn()
          break;
        case '-':
          this.zoomOut()
          break;
        case 's':
          this.$store.dispatch('asyncSaveProject', true)
          break;
        case 't':
          this.$store.dispatch('openModal', 'Sidebar')
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
    /* Allow scale style to take effect */
    window.setTimeout(() => {
      this.activateWorkspace(this.activeWorkspaceId)
    })
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

.board-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  border: 2px solid;
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;

  .workspace-board {
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

.workspace-selector {
  background-color: darkgray;
  max-height: 24px;
  min-height: 24px;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  padding: 0 4px 0 0;
  position: relative;

  .workspace-tab {
    position: relative;
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

    &.inDeleteMode {
      background-color: rgba(255,0,0,0.35);
    }

    &.isDragged {
      position: absolute;
      bottom: 0;
      margin-top: 0;
      padding-bottom: 6px;
      z-index: 1000;
    }

    &.invisible-tab {
      visibility: hidden;
    }

    & button.delete-workspace {
      border-radius: 50%;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .add-new-tab-tab {
    order: 99999;
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

.repaint-trigger {
  width: 0;
  height: 0;
  position: fixed;
  display: none;
}
</style>
