<template>
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
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({})
export default class TabSelector extends Vue {
  deleteModeIsOn = false

  workspaceToRename = ''

  newWorkspaceName = ''

  tabDragInProgress = false

  draggedTabPosition = 0

  draggedTabWorkspaceId = ''

  get workspaces(): Workspace[] {
    return this.$store.getters.workspaces
  }

  getWorkspaceNameInputElement() {
    return this.$refs.workspaceNameInput as HTMLInputElement
  }

  get activeWorkspaceId(): string {
    return this.$store.getters.activeWorkspaceId
  }

  get activeWorkspace(): Workspace | undefined {
    return this.$store.getters.activeWorkspace
  }

  activateWorkspace(workspaceId: string) {
    this.$store.dispatch('activateWorkspace', workspaceId)
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
          break
        case 'PageUp':
          this.activatePreviousTabWorkspace()
          break
        case 'PageDown':
          this.activateNextTabWorkspace()
          break
        default:
          break
      }
    }
  }

  activateNthOrderWorkspace(n: number) {
    this.activateWorkspace(
      this.workspaces.sort((w1, w2) => w1.order - w2.order)[n - 1]?.id || ''
    )
  }

  mounted() {
    window.addEventListener('keydown', this.keyboardHandler)
  }
}
</script>

<style lang="scss" scoped>
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
</style>
