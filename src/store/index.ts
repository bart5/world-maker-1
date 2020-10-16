import { ipc } from '@/game/data/ipcHandlersRenderer';
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

const newProjectDefaultConfig: ProjectConfig = {
  name: 'New Awesome Project',
  id: '',
  localSavePath: '',
  remoteSavePath: '',
  allowAutosave: true,
  autosaveInterval: 5,
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
  config: {
    ...newProjectDefaultConfig
  },
  defaultConfig: {
    ...newProjectDefaultConfig
  }
}

const initialState: ApplicationState = {
  applicationData: null,
  projectData: null,
  project: {
    ...newProjectDefaults
  },
  projectConfigurationMutated: false,
  projectStaticDataMutated: false,
  projectStaticEntityBindings: false,
  ui: {
    connectingInProgress: false,
    tileDeletionInProgress: false,
    workspaceDeletionInProgress: false,
    selectedInputSourceTile: '',
    activeModal: null,
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
    activeModalType: (state) => state.ui.activeModal,
    projectConfig: (state) => state.project.config,
    defaultProjectConfig: (state) => state.project.defaultConfig,
    applicationData: (state) => state.applicationData,
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
    /* =========== PROJECT CONFIGURATION MUTATIONS =========== */
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
    CONNECT_TO_THIS_TILE(state, tileId) {
      state.ui.connectingInProgress = false
      const source = state.ui.selectedInputSourceTile
      state.ui.selectedInputSourceTile = ''

      state.project.tiles.filter((t) => t.id === tileId)[0].inputSource = source
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
    /* =========== PROJECT STATIC DATA MUTATIONS =========== */
    /* =========== PROJECT ENTITY BINDINGS MUTATIONS =========== */
    /* =========== UI STATE MUTATIONS =========== */
    ACTIVATE_WORKSPACE(state, workspaceId: string) {
      if (workspaceId) {
        state.project.activeWorkspaceId = workspaceId
      }
    },
    START_CONNECTING_TILES(state, tileId) {
      state.ui.connectingInProgress = true
      state.ui.selectedInputSourceTile = tileId
    },
    STOP_CONNECTING_TILES(state) {
      state.ui.connectingInProgress = false
      state.ui.selectedInputSourceTile = ''
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
    OPEN_MODAL(state, modalType: modalTypes) {
      state.ui.activeModal = modalType
    },
    CLOSE_MODAL(state) {
      state.ui.activeModal = null
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
    openModal(state, modalType: modalTypes) {
      this.commit('OPEN_MODAL', modalType)
    },
    closeModal() {
      this.commit('CLOSE_MODAL')
    },
    asyncLoadApplicationData() {
      return ipc.exchange('loadApplicationData').then((data: ApplicationData) => {
        this.commit('SET_APPLICATION_DATA', data)
      })
    },
    asyncSaveApplicationData() {
      /* Need to pass some actual data, huh? */
      return ipc.exchange('saveApplicationData')
    },
    setApplicationData(state, data: ApplicationData) {
      this.commit('SET_APPLICATION_DATA', data)
    },
    asyncBeforeProjectOpen(state) {
      if (state.getters.isUnsavedData) {
        return state.dispatch('saveProjectData')
      }
      return Promise.resolve()
    },
    /*
      Opening project known to Application Data.
    */
    async asyncOpenKnownProjectFromId(state, projectId: string) {
      this.commit('START_OPENING_PROJECT')
      await state.dispatch('asyncBeforeProjectOpen')
      const projectConfig = await state.getters.projectConfigFromId(projectId)
      const data = await state.dispatch('loadProjectData', projectConfig)
      await state.dispatch('loadProjectToUI', data)
      this.commit('STOP_OPENING_PROJECT')
    },
    /*
      Open existing project now known to Application Data.
    */
    async asyncOpenUknownProjectFromPath(state, path: string) {
      this.commit('START_OPENING_PROJECT')
      await state.dispatch('asyncBeforeProjectOpen')
      const data = await state.dispatch('loadProjectData', path)
      await state.dispatch('loadProjectToUI', data)
      const projectConfig = state.getters.defaultProjectConfig
      await state.dispatch('asyncUpdateLoadedProjectPaths', { oldProjectConfig: null, newProjectConfig: projectConfig })
      this.commit('STOP_OPENING_PROJECT')
    },
    /*
      Opening completely new project and assigning to it provided config.
    */
    async asyncOpenNewProjectWithConfig(state, projectConfig: ProjectConfig) {
      this.commit('START_OPENING_PROJECT')
      await state.dispatch('asyncBeforeProjectOpen')
      const data = state.getters.newProjectData
      await state.dispatch('loadProjectToUI', data)
      await state.dispatch('asyncUpdateLoadedProjectPaths', { oldProjectConfig: null, newProjectConfig: projectConfig })
      this.commit('STOP_OPENING_PROJECT')
    },
    asyncUpdateLoadedProjectPaths(state, { oldProjectConfig, newProjectConfig }) {
      return ipc.exchange('updateProjectPaths', { oldProjectConfig, newProjectConfig }).then(() => {
        state.dispatch('asyncUpdateApplicationData', newProjectConfig)
      })
    },
    asyncUpdateApplicationData(state, projectConfig) {
      return ipc.exchange('updateApplicationData', projectConfig).then(() => {
        this.commit('UPDATE_APPLICATION_DATA', projectConfig)
      })
    },
    loadProjectData() {
      /* Ask for locations to StaticData and EntityBindings */
    },
    loadProjectToUI(state, data) {
      /* load project based on provided data */
      /* Check if current project has unsaved data */
    },
    saveProjectData(state, isAutosave) {
      /* Encode to JSON and send */
      /* Indicate if it's autosave */
    },
    beforeApplicationClose() {
      /* Check for unsaved data */
      /* Ask if user want's to save changes */
    },
    asyncTestPath(state, path: string) {
      return ipc.exchange('testPath', path)
    },
  },
  modules: {
  },
});
