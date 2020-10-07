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
        order: 0,
      }],
      tiles: [],
      staticDataPath: '',
      assetsPath: '',
      activeWorkspaceId: '0',
    },
    connectingInProgress: false,
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
    // setTileName(state) {

    // },
    // setTileFilter(state) {

    // },
    ACTIVATE_WORKSPACE(state, workspaceId: string) {
      state.ui.project.activeWorkspaceId = workspaceId
    },
    CREATE_NEW_WORKSPACE(state, workspaceId: string) {
      const order = state.ui.project.workspaces.length

      state.ui.project.workspaces.push({
        id: workspaceId,
        name: 'New Workspace',
        order,
      })
    },
    RESIZE_TILE(state, { tileId, delta }: { tileId: string, delta: { x: number, y: number } }) {
      const tile = state.ui.project.tiles.filter((t) => t.id === tileId)[0]
      tile.width = Math.max(tile.width + delta.x, minTileSize.width)
      tile.height = Math.max(tile.height + delta.y, minTileSize.height)
    },
    DRAG_TILE(state, { tileId, delta }: { tileId: string, delta: { x: number, y: number } }) {
      const tile = state.ui.project.tiles.filter((t) => t.id === tileId)[0]
      tile.x += delta.x
      tile.y = Math.max(tile.y + delta.y, 0)
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

    createNewTile(state) {
      const tileId = `tile_${Date.now()}${Math.random()}`
      const spaceX = 30
      const spaceY = 30

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

        return { x: minX + spaceX, y: spaceY }
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
    resizeTile(state, { tileId, delta }: { tileId: string, delta: { x: number, y: number } }) {
      this.commit('RESIZE_TILE', { tileId, delta })
    },
    dragTile(state, { tileId, delta }: { tileId: string, delta: { x: number, y: number } }) {
      this.commit('DRAG_TILE', { tileId, delta })
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
    }
  },
  modules: {
  },
});
