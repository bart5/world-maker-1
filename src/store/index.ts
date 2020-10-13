import { createStore } from 'vuex';

export interface State {
  selectedTask: { questId: string; taskId: string } | null;
  staticData: StaticData;
  stateData: {};
  loadingStaticData: boolean;
  ui: UIState
}

const initialState: State = {
  selectedTask: null,
  staticData: {} as StaticData,
  stateData: {},
  loadingStaticData: false,
  ui: {
    project: {
      id: '0',
      name: 'New project',
      workspaces: [{
        id: '0',
        name: 'New Workspace',
        order: 1,
      }],
      tiles: [],
      staticDataPath: '',
      assetsPath: '',
      activeWorkspaceId: '0',
    },
    connectingInProgress: false,
    tileDeletionInProgress: false,
    workspaceDeletionInProgress: false,
    selectedInputSourceTile: '',
  }
}

const minTileSize = {
  width: 80,
  height: 100
}

export default createStore({
  state: initialState,
  getters: {
    selectedTask: (state, getters) => {
      if (!state.selectedTask) return {}
      const { questId, taskId } = state.selectedTask
      return getters.task(questId, taskId)
    },
    task: (state) => (questId: string, taskId: string) => {
      return state.staticData.tasks[questId][taskId]
    },
    quest: (state) => (questId: string) => {
      return state.staticData.quests[questId]
    },
    allQuests: (state) => state.staticData.quests,
    loadingStaticData: (state) => state.loadingStaticData,
    staticData: (state) => state.staticData,
    workspaces: (state) => state.ui.project.workspaces,
    activeWorkspaceId: (state) => state.ui.project.activeWorkspaceId,
    activeWorkspace: (state) => state.ui.project.workspaces.filter((ws) => ws.id === state.ui.project.activeWorkspaceId)[0],
    allTilesOfWorkspace: (state) => (workspaceId: string) => state.ui.project.tiles.filter((tile) => {
      return tile.workspaceId === workspaceId
    }),
    activeWorkspaceTiles: (state, getters) => getters.allTilesOfWorkspace(getters.activeWorkspaceId),
    activeWorkspaceTileOfId: (state, getters) => (tileId: string) => {
      return getters.activeWorkspaceTiles.filter((tile: Tile) => tile.id === tileId)
    },
    tileOfId: (state) => (tileId: string) => state.ui.project.tiles.filter((tile: Tile) => tile.id === tileId)?.[0],
    selectedInputSourceTileId: (state) => state.ui.selectedInputSourceTile,
    selectedInputSourceTile: (state, getters) => getters.tileOfId(state.ui.selectedInputSourceTile),
    connectingInProgress: (state) => state.ui.connectingInProgress,
    getWorkspaceConnections: (state, getters) => (workspaceId: string) => {
      return (getters.allTilesOfWorkspace(workspaceId) as Tile[]).map((t) => {
        return t.inputSource ? [t.id, t.inputSource] : null
      }).filter(Boolean) as Array<tileId[]>
    },
    getInputSourceTileOfTile: (state, getters) => (tile: Tile) => getters.tileOfId(tile.inputSource),
    tileDeletionInProgress: (state) => state.ui.tileDeletionInProgress,
    workspaceDeletionInProgress: (state) => state.ui.workspaceDeletionInProgress,
  },
  mutations: {
    setSelectedTask(state, { questId, taskId }) {
      state.selectedTask = { questId, taskId }
    },
    setStaticData(state, data: StaticData) {
      state.staticData = data;
    },
    setLoadingStaticData(state, flag: boolean) {
      state.loadingStaticData = flag
    },
    CREATE_NEW_TILE(state, { workspaceId, tileId, position }) {
      state.ui.project.tiles.push({
        id: tileId,
        name: 'New Tile',
        workspaceId,
        inputSource: '',
        filter: '',
        hideConnectors: false,
        width: 120,
        height: 180,
        x: position.x,
        y: position.y,
        zIndex: state.ui.project.tiles.length || 0,
        output: {
          allData: null,
          slectionData: null,
        }
      })
    },
    // setTileFilter(state) {

    // },
    ACTIVATE_WORKSPACE(state, workspaceId: string) {
      if (workspaceId) {
        state.ui.project.activeWorkspaceId = workspaceId
      }
    },
    CREATE_NEW_WORKSPACE(state, workspaceId: string) {
      const order = state.ui.project.workspaces.length
        ? state.ui.project.workspaces.sort((w1, w2) => w2.order - w1.order)[0].order + 1
        : 1

      state.ui.project.workspaces.push({
        id: workspaceId,
        name: 'New Workspace' + (state.ui.project.workspaces.length + 1),
        order,
      })
    },
    RESIZE_TILE(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      const tile = state.ui.project.tiles.filter((t) => t.id === tileId)[0]
      tile.width = Math.max(newPosition.x - tile.x, minTileSize.width)
      tile.height = Math.max(newPosition.y - tile.y, minTileSize.height)
    },
    DRAG_TILE(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      const tile = state.ui.project.tiles.filter((t) => t.id === tileId)[0]
      tile.x = newPosition.x
      tile.y = newPosition.y
    },
    START_CONNECTING_TILES(state, tileId) {
      state.ui.connectingInProgress = true
      state.ui.selectedInputSourceTile = tileId
    },
    STOP_CONNECTING_TILES(state) {
      state.ui.connectingInProgress = false
      state.ui.selectedInputSourceTile = ''
    },
    CONNECT_TO_THIS_TILE(state, tileId) {
      state.ui.connectingInProgress = false
      const source = state.ui.selectedInputSourceTile
      state.ui.selectedInputSourceTile = ''

      state.ui.project.tiles.filter((t) => t.id === tileId)[0].inputSource = source
    },
    BRING_TILE_FORWARD(state, tileId) {
      const newFrontTile = state.ui.project.tiles.filter((t) => t.id === tileId)[0]
      // Push other tiles behind
      // Notice that we only push behind the tiles that were in front
      state.ui.project.tiles.forEach((t) => {
        if (t.zIndex > newFrontTile.zIndex) {
          t.zIndex -= 1
        }
      })
      newFrontTile.zIndex = state.ui.project.tiles.length
    },
    START_TILE_DELETION(state) {
      state.ui.tileDeletionInProgress = true
    },
    STOP_TILE_DELETION(state) {
      state.ui.tileDeletionInProgress = false
    },
    START_WORKSPACE_DELETION(state) {
      state.ui.workspaceDeletionInProgress = true
    },
    STOP_WORKSPACE_DELETION(state) {
      state.ui.workspaceDeletionInProgress = false
    },
    DELETE_TILE_OUT_BOUND_CONNECTIONS(state, tileId) {
      state.ui.project.tiles.forEach((t) => {
        if (t.inputSource === tileId) {
          t.inputSource = ''
        }
      })
    },
    DELETE_TILE_IN_BOUND_CONNECTIONS(state, tileId) {
      /* As of now tile can have just one inbound connection */
      state.ui.project.tiles.filter((t) => t.id === tileId)[0].inputSource = ''
    },
    DELETE_TILE(state, tileId) {
      state.ui.project.tiles = [
        ...state.ui.project.tiles.filter((t) => t.id !== tileId)
      ]
    },
    DELETE_WORKSPACE(state, workspaceId) {
      state.ui.project.workspaces.splice(
        state.ui.project.workspaces.findIndex((w) => w.id === workspaceId),
        1
      )
      state.ui.project.tiles = state.ui.project.tiles.filter((t) => t.workspaceId !== workspaceId)
    },
    RENAME_WORKSPACE(state, { workspaceId, newName }) {
      const workspace = state.ui.project.workspaces.filter((w) => w.id === workspaceId)[0]
      workspace.name = newName
    },
    SWAP_WORKSPACES_ORDER(state, { workspaceToMoveLeft, workspaceToMoveRight }) {
      const leftPosition = workspaceToMoveRight.order
      const rightPosition = workspaceToMoveLeft.order
      workspaceToMoveLeft.order = leftPosition
      workspaceToMoveRight.order = rightPosition
    },
  },
  actions: {
    selectTask(state, taskId: string) {
      this.commit('setSelectedTask', taskId)
    },
    loadStaticData(state) {
      if (state.getters.loadingStaticData) {
        console.warn('Already loading static data')
        return
      }
      window.ipcRenderer.send('loadStaticData')
      this.commit('setLoadingStaticData', true)
    },
    setStaticData(state, data: StaticData) {
      this.commit('setStaticData', data)
      this.commit('setLoadingStaticData', false)
    },
    saveStaticData(state, data: StaticData) {
      window.ipcRenderer.send('saveStaticData', data)
    },

    createNewTile(state, positionShift?: { x: number, y: number }) {
      const tileId = `tile_${Date.now()}${Math.random()}`
      const spaceX = positionShift?.x || 20
      const spaceY = positionShift?.y || 0

      const getTileInitialPosition = (): { x: number, y: number } => {
        /*
          Tile will be inserter not lower than min y and not closer to left than max x
        */
        const tiles: Tile[] = state.getters.activeWorkspaceTiles
        const minX: number = (() => {
          if (tiles.length === 0) {
            return 0
          }
          const maxTileX = tiles.map((t) => t.x + t.width)
          const maxTileXSorted = maxTileX.sort((tA, tB) => tB - tA)
          return maxTileXSorted[0]
        })()

        const averageTileY = tiles.reduce((acc, tile) => acc + (tile.y / tiles.length), 0)

        return { x: minX + spaceX, y: averageTileY + spaceY }
      }

      const position = getTileInitialPosition()

      this.commit('CREATE_NEW_TILE', { workspaceId: state.getters.activeWorkspaceId, tileId, position })
    },
    createNewWorkspace() {
      const workspaceId = `workspace_${Date.now()}${Math.random()}`
      this.commit('CREATE_NEW_WORKSPACE', workspaceId)
    },
    activateWorkspace(state, workspaceId: string) {
      this.commit('ACTIVATE_WORKSPACE', workspaceId)
    },
    resizeTile(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      this.commit('RESIZE_TILE', { tileId, newPosition })
    },
    dragTile(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      this.commit('DRAG_TILE', { tileId, newPosition })
    },
    startConnectingTiles(state, tileId) {
      this.commit('START_CONNECTING_TILES', tileId)
    },
    stopConnectingTiles() {
      this.commit('STOP_CONNECTING_TILES')
    },
    connectToThisTile(state, tileId) {
      const inputSource = state.getters.selectedInputSourceTile
      console.log('trying connect: ', tileId, ' to: ', inputSource)
      if (inputSource.id === tileId) {
        this.commit('STOP_CONNECTING_TILES')
        return
      }
      this.commit('CONNECT_TO_THIS_TILE', tileId)
    },
    bringTileForward(state, tileId) {
      this.commit('BRING_TILE_FORWARD', tileId)
    },
    startTileDeletion() {
      this.commit('START_TILE_DELETION')
    },
    stopTileDeletion() {
      this.commit('STOP_TILE_DELETION')
    },
    deleteTile(state, tileId) {
      this.commit('DELETE_TILE_OUT_BOUND_CONNECTIONS', tileId)
      this.commit('DELETE_TILE', tileId)
    },
    startWorkspaceDeletion() {
      this.commit('START_WORKSPACE_DELETION')
    },
    stopWorkspaceDeletion() {
      this.commit('START_WORKSPACE_DELETION')
    },
    deleteWorkspace(state, workspaceId) {
      this.commit('DELETE_WORKSPACE', workspaceId)
    },
    renameWorkspace(state, { workspaceId, newName }) {
      this.commit('RENAME_WORKSPACE', { workspaceId, newName })
    },
    swapWorkspacesOrder(state, { workspaceToMoveLeft, workspaceToMoveRight }) {
      this.commit('SWAP_WORKSPACES_ORDER', { workspaceToMoveLeft, workspaceToMoveRight })
    },
  },
  modules: {
  },
});
