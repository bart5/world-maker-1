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
    providerTileToConnect: null,
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
    allTilesOfWorkspace: (state) => (workspaceId: string) => state.ui.project.tiles.filter(tile => {
      return tile.workspaceId === workspaceId
    }),
    activeWorkspaceTiles: (state, getters) => getters.allTilesOfWorkspace(getters.activeWorkspaceId),
    activeWorkspaceTileById: (state, getters) => (tileId: string) => {
      return getters.activeWorkspaceTiles.filter((tile: Tile) => tile.id === tileId)
    },
    tileById: (state) => (tileId: string) => state.ui.project.tiles.filter((tile: Tile) => tile.id === tileId),
    providerTileToConnect: (state, getters) => getters.tileById(state.ui.providerTileToConnect),
    connectingInProgress: (state) => state.ui.connectingInProgress,
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
        providerTile: null,
        filter: '',
        hideConnectors: false,
        width: 120,
        height: 180,
        x: position.x,
        y: position.y,
      })
    },
    setTileName(state) {

    },
    setTileFilter(state) {

    },
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
      const tile = state.ui.project.tiles.filter((tile) => tile.id === tileId)[0]
      tile.width = Math.max(tile.width + delta.x, minTileSize.width)
      tile.height = Math.max(tile.height + delta.y, minTileSize.height)
    },
    DRAG_TILE(state, { tileId, delta }: { tileId: string, delta: { x: number, y: number } }) {
      const tile = state.ui.project.tiles.filter((tile) => tile.id === tileId)[0]
      tile.x = tile.x + delta.x
      tile.y = Math.min(tile.y + delta.y, 0)
    },
    START_CONNECTING_TILES(state, tileId) {
      state.ui.connectingInProgress = true
      state.ui.providerTileToConnect = tileId
    },
    STOP_CONNECTING_TILES(state) {
      state.ui.connectingInProgress = false
      state.ui.providerTileToConnect = null
    },
    CONNECT_TO_THIS_TILE(state, { provider, receiver }: { provider: Tile, receiver: Tile }) {
      state.ui.connectingInProgress = false
      state.ui.providerTileToConnect = null
      receiver.providerTile = provider
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

    createNewTile(state, { workspaceId }: { workspaceId: string }) {
      const tileId = `tile_${Date.now()}${Math.random()}`

      const getTileInitialPosition = (): { x: number, y: number } => {
        /* Tile will be inserter not lower than min y and not closer to left than max x */
        const tiles: Tile[] = state.getters.activeWorkspaceTiles
        const minXminY: { minX: number, minY: number } = (() => {
          const maxTileX = tiles.sort((tA, tB) => (tB.x + tB.width) - (tA.x + tA.width))[0].x
          const minTileY = tiles.sort((tA, tB) => tA.y - tB.y)[0].y
          /* minimal allowed X and minimal allowed Y */
          return { minX: maxTileX, minY: minTileY }
        })()

        const spaceX = 50

        return {
          x: minXminY.minX + spaceX,
          y: minXminY.minY
        }
      }

      const position = getTileInitialPosition()

      this.commit('CREATE_NEW_TILE', { workspaceId: state.getters.activeWorkspaceId, tileId, position })
    },
    createNewWorkspace(state) {
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
    stopConnectingTiles(state) {
      this.commit('STOP_CONNECTING_TILES')
    },
    connectToThisTile(state, tileId) {
      const provider = state.getters.providerTileToConnect
      const receiver = state.getters.tileById(tileId)
      this.commit('CONNECT_TO_THIS_TILE', { provider, receiver })
    },
  },
  modules: {
  },
});
