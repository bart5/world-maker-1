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
      boxes: [],
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
    allBoxesOfWorkspace: (state, getters) => (workspaceId: string) => {
      const allTilesOfWorkspace = getters.allTilesOfWorkspace(workspaceId)
      return state.ui.project.boxes.filter(box => {
        return allTilesOfWorkspace.some((tile: Tile) => tile.boxId === box.id)
      })
    },
    activeWorkspaceTiles: (state, getters) => getters.allTilesOfWorkspace(getters.activeWorkspaceId),
    allBoxedTilesOfWorkspace: (state, getters) => (workspaceId: string): Tile[] => {
      return getters.allTilesOfWorkspaceId(getters.activeWorkspaceId).filter((tile: Tile) => {
        return tile.boxId !== ''
      })
    },
    allFreeTilesOfWorkspace: (state, getters) => (workspaceId: string) => {
      return getters.allTilesOfWorkspaceId(getters.activeWorkspaceId).filter((tile: Tile) => {
        return tile.boxId === ''
      })
    },
    workspaceTilesByBox: (state, getters) => (workspaceId: string) => {
      return getters.allBoxedTilesOfWorkspace(workspaceId).reduce((acc: { [k:string]: Tile[] }, tile: Tile) => {
        const boxId = tile.boxId
        if (acc.boxId) {
          acc[boxId].push(tile)
        } else {
          acc[boxId] = [tile]
        }
        return acc
      }, {} as { [k:string]: Tile[] })
    },
    workspaceTilesOfBox: (state, getters) => (worskapceId: string, boxId: string) => {
      return getters.workspaceTilesByBox(worskapceId)[boxId]
    },
    boxOfId: (state) => (boxId: string) => state.ui.project.boxes.filter(b => b.id === boxId),
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
    CREATE_NEW_TILE(state, { workspaceId, boxId, tileId, position }) {
      state.ui.project.tiles.push({
        id: tileId,
        name: 'New Tile',
        boxId: boxId || '',
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

    createNewTile(state, { boxId }: { workspaceId: string, boxId?: string }) {
      const tileId = `tile_${Date.now()}${Math.random()}`

      const getTileInitialPosition = (): { x: number, y: number } => {
        /* get minimal y */
        /* get maximal x */
        /* insert tile not lower than min y and not closer than max x */
        const tiles: Tile[] = state.getters.activeWorkspaceTiles
        const boxes: TileBox[] = tiles.map(tile => state.getters.boxOfId(tile.boxId))
        const minXminY: { minX: number, minY: number } = (() => {
          const maxTileX = tiles.sort((tA, tB) => (tB.x + tB.width) - (tA.x + tA.width))[0].x
          const maxBoxX = boxes.sort((bA, bB) => (bB.x + bB.width) - (bA.x + bA.width))[0].x
          const minTileY = tiles.sort((tA, tB) => tA.y - tB.y)[0].y
          const minBoxY = boxes.sort((bA, bB) => bA.y - bB.y)[0].y
          return {
            /* minimal allowed X */
            minX: Math.min(maxTileX, maxBoxX),
            /* minimal allowed Y */
            minY: Math.min(minTileY, minBoxY)
          }
        })()

        const spaceX = 50

        return {
          x: minXminY.minX + spaceX,
          y: minXminY.minY
        }
      }

      const position = getTileInitialPosition()

      this.commit('CREATE_NEW_TILE', { workspaceId: state.getters.activeWorkspaceId, tileId, boxId, position })
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
