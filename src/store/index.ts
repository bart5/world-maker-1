import { createStore } from 'vuex';

const workspaceConfigurationDefaults: WorkspaceConfiguration = {
  modulus: 1,
  fitToTiles: false,
  lockScale: false,
  lockedScale: 1,
  lockView: false,
  lockedViewPosition: {},
  lockTiles: false,
  lastSessionCamera: null,
}

const workspaceDefaults: Workspace = {
  id: '0',
  name: 'New Workspace',
  order: 1,
  configuration: {
    ...workspaceConfigurationDefaults
  }
}

const newProjectDefaults: Project = {
  id: '0',
  name: 'New project',
  workspaces: [{
    ...workspaceDefaults
  }],
  tiles: [],
  staticDataPath: '',
  assetsPath: '',
  activeWorkspaceId: '0',
}

const initialState: ApplicationState = {
  applicationData: null,
  projectData: null,
  project: {
    ...newProjectDefaults
  },
  ui: {
    connectingInProgress: false,
    tileDeletionInProgress: false,
    workspaceDeletionInProgress: false,
    selectedInputSourceTile: '',
    showConfigurationModal: false,
  }
}

const minTileSize = {
  width: 80,
  height: 100
}

export default createStore({
  state: initialState,
  getters: {
    // selectedTask: (state, getters) => {
    //   if (!state.selectedTask) return {}
    //   const { questId, taskId } = state.selectedTask
    //   return getters.task(questId, taskId)
    // },
    // task: (state) => (questId: string, taskId: string) => {
    //   return state.staticData.tasks[questId][taskId]
    // },
    // quest: (state) => (questId: string) => {
    //   return state.staticData.quests[questId]
    // },
    // allQuests: (state) => state.staticData.quests,
    // loadingStaticData: (state) => state.loadingStaticData,
    // staticData: (state) => state.staticData,
    workspaces: (state) => state.project.workspaces,
    activeWorkspaceId: (state) => state.project.activeWorkspaceId,
    activeWorkspace: (state) => state.project.workspaces.filter((ws) => ws.id === state.project.activeWorkspaceId)[0],
    allTilesOfWorkspace: (state) => (workspaceId: string) => state.project.tiles.filter((tile) => {
      return tile.workspaceId === workspaceId
    }),
    activeWorkspaceTiles: (state, getters) => getters.allTilesOfWorkspace(getters.activeWorkspaceId),
    activeWorkspaceTileOfId: (state, getters) => (tileId: string) => {
      return getters.activeWorkspaceTiles.filter((tile: Tile) => tile.id === tileId)
    },
    tileOfId: (state) => (tileId: string) => state.project.tiles.filter((tile: Tile) => tile.id === tileId)?.[0],
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
    getLastSessionCamera: (state, getters) => (workspaceId?: string) => {
      let workspaceConfig: WorkspaceConfiguration
      if (workspaceId) {
        workspaceConfig = (state.project.workspaces.find((w) => w.id === workspaceId) as Workspace).configuration
      } else {
        workspaceConfig = getters.activeWorkspace.configuration
      }
      return workspaceConfig.lastSessionCamera
    },
    showConfigurationModal: (state) => state.ui.showConfigurationModal
  },
  mutations: {
    // setSelectedTask(state, { questId, taskId }) {
    //   state.selectedTask = { questId, taskId }
    // },
    // setStaticData(state, data: StaticData) {
    //   state.staticData = data;
    // },
    // setLoadingStaticData(state, flag: boolean) {
    //   state.loadingStaticData = flag
    // },
    CREATE_NEW_TILE(state, { workspaceId, tileId, position }) {
      state.project.tiles.push({
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
        zIndex: state.project.tiles.length || 0,
        output: {
          allData: null,
          slectionData: null,
        }
      })
    },
    ACTIVATE_WORKSPACE(state, workspaceId: string) {
      if (workspaceId) {
        state.project.activeWorkspaceId = workspaceId
      }
    },
    CREATE_NEW_WORKSPACE(state, workspaceId: string) {
      const order = state.project.workspaces.length
        ? state.project.workspaces.sort((w1, w2) => w2.order - w1.order)[0].order + 1
        : 1

      state.project.workspaces.push({
        id: workspaceId,
        name: 'New Workspace' + (state.project.workspaces.length + 1),
        order,
        configuration: {
          modulus: 1,
          fitToTiles: false,
          lockScale: false,
          lockedScale: 1,
          lockView: false,
          lockedViewPosition: {},
          lockTiles: false,
          lastSessionCamera: null,
        },
      })
    },
    RESIZE_TILE(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      const tile = state.project.tiles.filter((t) => t.id === tileId)[0]
      tile.width = Math.max(newPosition.x - tile.x, minTileSize.width)
      tile.height = Math.max(newPosition.y - tile.y, minTileSize.height)
    },
    DRAG_TILE(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      const tile = state.project.tiles.filter((t) => t.id === tileId)[0]
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

      state.project.tiles.filter((t) => t.id === tileId)[0].inputSource = source
    },
    BRING_TILE_FORWARD(state, tileId) {
      const newFrontTile = state.project.tiles.filter((t) => t.id === tileId)[0]
      // Push other tiles behind
      // Notice that we only push behind the tiles that were in front
      state.project.tiles.forEach((t) => {
        if (t.zIndex > newFrontTile.zIndex) {
          t.zIndex -= 1
        }
      })
      newFrontTile.zIndex = state.project.tiles.length
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
      state.project.tiles.forEach((t) => {
        if (t.inputSource === tileId) {
          t.inputSource = ''
        }
      })
    },
    DELETE_TILE_IN_BOUND_CONNECTIONS(state, tileId) {
      /* As of now tile can have just one inbound connection */
      state.project.tiles.filter((t) => t.id === tileId)[0].inputSource = ''
    },
    DELETE_TILE(state, tileId) {
      state.project.tiles = [
        ...state.project.tiles.filter((t) => t.id !== tileId)
      ]
    },
    DELETE_WORKSPACE(state, workspaceId) {
      state.project.workspaces.splice(
        state.project.workspaces.findIndex((w) => w.id === workspaceId),
        1
      )
      state.project.tiles = state.project.tiles.filter((t) => t.workspaceId !== workspaceId)
    },
    RENAME_WORKSPACE(state, { workspaceId, newName }) {
      const workspace = state.project.workspaces.filter((w) => w.id === workspaceId)[0]
      workspace.name = newName
    },
    SWAP_WORKSPACES_ORDER(state, { workspaceToMoveLeft, workspaceToMoveRight }) {
      const leftPosition = workspaceToMoveRight.order
      const rightPosition = workspaceToMoveLeft.order
      workspaceToMoveLeft.order = leftPosition
      workspaceToMoveRight.order = rightPosition
    },
    SET_WORKSPACE_CONFIG(state, { workspaceId, newConfig }) {
      const workspace = state.project.workspaces.find((w) => w.id === workspaceId)
      if (!workspace) return
      workspace.configuration = {
        ...workspace.configuration,
        ...newConfig
      }
    },
    SNAP_WORKSPACE_TILES_TO_MODULUS(state, { workspaceId, modulus }) {
      const workspace = state.project.workspaces.find((w) => w.id === workspaceId)
      if (!workspace) return
      const alignToModulus = (n: number, mod: number) => {
        return n - (n % mod)
      }
      state.project.tiles.forEach((t) => {
        if (t.workspaceId === workspaceId) {
          t.x = alignToModulus(t.x, modulus)
          t.y = alignToModulus(t.y, modulus)
          t.width = alignToModulus(t.width, modulus)
          t.height = alignToModulus(t.height, modulus)
        }
      })
    },
    OPEN_CONFIGURATION_MODAL(state) {
      state.ui.showConfigurationModal = true
    },
    CLOSE_CONFIGURATION_MODAL(state) {
      state.ui.showConfigurationModal = false
    },
    SET_APPLICATION_DATA(state, data) {
      state.applicationData = data
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
    setWorkspaceConfig(state, { workspaceId, newConfig }) {
      this.commit('SET_WORKSPACE_CONFIG', { workspaceId, newConfig })
    },
    snapWorkspaceTilesToModulus(state, { workspaceId, modulus }) {
      this.commit('SNAP_WORKSPACE_TILES_TO_MODULUS', { workspaceId, modulus })
    },
    openConfigurationModal() {
      this.commit('OPEN_CONFIGURATION_MODAL')
    },
    closeConfigurationModal() {
      this.commit('CLOSE_CONFIGURATION_MODAL')
    },
    loadApplicationData() {
      this.commit('START_LOADING_APPLICATION_DATA')
      this.commit('STOP_LOADING_APPLICATION_DATA')
      window.ipcRenderer.send('loadApplicationData')
    },
    saveApplicationData() {
      window.ipcRenderer.send('saveApplicationData')
    },
    setApplicationData(state, data: ApplicationData) {
      this.commit('SET_APPLICATION_DATA', data)
    },
    openProjectsSelectionModal() {
      /* Shows selection of known project and allows open new manually from location of choice */
    },
    closeProjectsSelectionModal() {
      /* Shows selection of known project and allows open new manually from location of choice */
    },
    loadProjectFromLocation() {
      /* Ask for locations to StaticData and AssetMappings */
    },
    startNewProject() {
      /*  */
    },
    loadProjectToUI(state, { projectData }) {
      /* load project based on provided data */
      /* Check if current project has unsaved data */
    },
    saveProjectData(state, isAutosave ) {
      /* Encode to JSON and send */
      /* Indicate if it's autosave */
    },
    saveApplicationData() {
      /* Save whenever it changes */
      /* It changes when project is created  */
    },
    beforeApplicationClose() {
      /* Check for unsaved data */
      /* Ask if user want's to save changes */
    }
  },
  modules: {
  },
});
