import { ipc } from '@/game/data/ipcHandlersRenderer';
import { createStore } from 'vuex';
import * as utils from './utils';
import { getEmptyBoard, builtInBoards } from './builtInData';
import getNewProject from './newProjectData';
import initialState from './state';

const minTileSize = {
  width: 80,
  height: 100
}

const registerUiDataMutation = (state: ApplicationState) => {
  state.projectUiDataMutated = true
}

const identity = (payload: any) => payload
const UI = identity as unknown as typeof createStore

export default UI({
  state: initialState,
  getters: {
    workspaces: (state) => state.project.uiData.workspaces,
    activeWorkspaceId: (state) => state.project.uiData?.activeWorkspaceId,
    activeWorkspace: (state) => state.project.uiData?.workspaces.filter((ws) => ws.id === state.project.uiData.activeWorkspaceId)[0],
    // allTilesOfWorkspace: (state) => (workspaceId: string) => state.project.uiData?.tiles.filter((tile) => {
    //   return tile.workspaceId === workspaceId
    // }),
    getAllBoards: (state) => state.project.uiData.boards,
    getBoardTiles: (state) => (boardId: string) => state.project.uiData.boards[boardId].tiles,
    getBoardConfig: (state) => (boardId: string) => state.project.uiData.boards[boardId].config,
    // activeWorkspaceTiles: (state, getters) => getters.allTilesOfWorkspace(getters.activeWorkspaceId),
    // activeWorkspaceTileOfId: (state, getters) => (tileId: string) => {
    //   return getters.activeWorkspaceTiles.filter((tile: Tile) => tile.id === tileId)
    // },
    // tileOfId: (state) => (tileId: string) => state.project.uiData.boards[boardId].tiles.filter((tile: Tile) => tile.id === tileId)?.[0],
    selectedInputSourceTileId: (state) => state.ui.selectedInputSourceTile,
    selectedInputSourceTile: (state, getters) => getters.tileOfId(state.ui.selectedInputSourceTile),
    connectingInProgress: (state) => state.ui.connectingInProgress,
    getWorkspaceConnections: (state, getters) => (workspaceId: string) => {
      return (getters.allTilesOfWorkspace(workspaceId) as Tile[]).map((t) => {
        return t.inputSource ? [t.id, t.inputSource] : null
      }).filter(Boolean) as Array<tileId[]>
    },
    getInputSourceTilesOfTile: (state, getters) => (p: { boardId: string, tile: Tile}) => {
      const { boardId, tile } = p
      let sourcesIds: string[]
      if (tile.type === 'type') {
        const referencedTypes: TypeWrapper[] = getters.getFilteredTypes({ isReferencedByType: tile.id })
        sourcesIds = referencedTypes.map((tw) => tw.id)
      } else {
        // If we will only be interested in certain kind of instances we can narrow it down
        // e.g. passing type or specific prop that is referencing
        const referencedInstances: Instance[] = getters.getFilteredInstances({ isReferencedByInstance: tile.id })
        sourcesIds = referencedInstances.map((i) => i.id[0])
      }
      return getters.getBoardTiles(boardId).filter((t: Tile) => sourcesIds.some((id) => id === t.id))
    },
    tileDeletionInProgress: (state) => state.ui.tileDeletionInProgress,
    workspaceDeletionInProgress: (state) => state.ui.workspaceDeletionInProgress,
    // getLastSessionCamera: (state, getters) => () => {
    //   const activeWorkspaceConfig: WorkspaceConfiguration = getters.activeWorkspace.configuration
    //   return activeWorkspaceConfig.lastSessionCamera
    // },
    getBoardCamera: (state) => (boardId: string) => state.project.uiData.boards[boardId].camera,
    activeModal: (state) => state.ui.activeModal,
    applicationData: (state) => state.applicationData,
    projectDataIsLoaded: (state) => state.ui.projectDataIsLoaded,
    isUnsavedData: (state, getters) => {
      const staticDataChanged = getters.lastTransactionIdInUI !== state.ui.lastSavedTransactionId
      return staticDataChanged || state.projectUiDataMutated
    },
    lastProjectSaveTime: (state) => {
      return state.ui.lastProjectSaveTime
    },
    lastProjectLoadTime: (state) => {
      return state.ui.lastProjectLoadTime
    },
    activeWidgetKey: (state) => {
      return state.ui.activeWidgetKey
    },
    lastTransactionIdInUI: (state) => {
      return state.project.recentChanges?.last()?.id || ''
    },
    openingProjectInProgress: (state) => {
      return state.ui.openingProjectInProgress
    },
    savingProjectInProgress: (state) => {
      return state.ui.savingProjectInProgress
    },
  },
  mutations: {
    /* =========== PROJECT UI DATA MUTATIONS =========== */
    CREATE_NEW_TILE(state, { boardId, type, tileId, position }) {
      registerUiDataMutation(state)

      const tiles = state.project.uiData.boards[boardId].tiles

      tiles.push({
        id: tileId,
        type,
        inputSource: '',
        width: 120,
        height: 180,
        x: position.x,
        y: position.y,
        zIndex: tiles.length || 0,
      })
    },
    RESIZE_TILE(state, { boardId, tileId, newPosition }: { boardId: string, tileId: string, newPosition: { x: number, y: number } }) {
      registerUiDataMutation(state)

      const tile = state.project.uiData.boards[boardId].tiles.filter((t) => t.id === tileId)[0]
      tile.width = Math.max(newPosition.x - tile.x, minTileSize.width)
      tile.height = Math.max(newPosition.y - tile.y, minTileSize.height)
    },
    SET_TILE_WIDTH(state, p: { boardId: string, tileId: string, width: number }) {
      const { boardId, tileId, width } = p
      registerUiDataMutation(state)

      const tile = state.project.uiData.boards[boardId].tiles.filter((t) => t.id === tileId)[0]
      tile.width = width
    },
    SET_TILE_HEIGHT(state, p: { boardId: string, tileId: string, height: number }) {
      const { boardId, tileId, height } = p
      registerUiDataMutation(state)

      const tile = state.project.uiData.boards[boardId].tiles.filter((t) => t.id === tileId)[0]
      tile.height = height
    },
    // DRAG_TILE(state, { boardId, tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
    DRAG_TILE(state, { boardId, tileId, newPosition }) {
      registerUiDataMutation(state)

      const tile = state.project.uiData.boards[boardId].tiles.filter((t) => t.id === tileId)[0]
      tile.x = newPosition.x
      tile.y = newPosition.y
    },
    BRING_TILE_FORWARD(state, p: { boardId: string, tileId: string }) {
      const { boardId, tileId } = p
      registerUiDataMutation(state)

      const newFrontTile = state.project.uiData.boards[boardId].tiles.filter((t) => t.id === tileId)[0]
      // Push other tiles behind
      // Notice that we only push behind the tiles that were in front
      state.project.uiData.boards[boardId].tiles.forEach((t) => {
        if (t.zIndex > newFrontTile.zIndex) {
          t.zIndex -= 1
        }
      })
      newFrontTile.zIndex = state.project.uiData.boards[boardId].tiles.length
    },
    CONNECT_TO_THIS_TILE(state, p: { boardId: string, tileId: string }) {
      const { boardId, tileId } = p
      registerUiDataMutation(state)

      state.ui.connectingInProgress = false
      const source = state.ui.selectedInputSourceTile
      state.ui.selectedInputSourceTile = ''

      state.project.uiData.boards[boardId].tiles.filter((t) => t.id === tileId)[0].inputSource = source
    },
    DELETE_TILE_OUT_BOUND_CONNECTIONS(state, p: { boardId: string, tileId: string }) {
      const { boardId, tileId } = p
      registerUiDataMutation(state)

      state.project.uiData.boards[boardId].tiles.forEach((t) => {
        if (t.inputSource === tileId) {
          t.inputSource = ''
        }
      })
    },
    DELETE_TILE_IN_BOUND_CONNECTIONS(state, p: { boardId: string, tileId: string }) {
      const { boardId, tileId } = p
      registerUiDataMutation(state)

      /* As of now tile can have just one inbound connection */
      state.project.uiData.boards[boardId].tiles.filter((t) => t.id === tileId)[0].inputSource = ''
    },
    DELETE_TILE(state, p: { boardId: string, tileId: string }) {
      const { boardId, tileId } = p
      registerUiDataMutation(state)

      state.project.uiData.boards[boardId].tiles = [
        ...state.project.uiData.boards[boardId].tiles.filter((t) => t.id !== tileId)
      ]
    },
    CREATE_NEW_WORKSPACE(state, p: { workspaceId: string, type: WorkspaceType }) {
      const { workspaceId, type } = p
      registerUiDataMutation(state)

      const order = state.project.uiData.workspaces.length
        ? state.project.uiData.workspaces.sort((w1, w2) => w2.order - w1.order)[0].order + 1
        : 1

      state.project.uiData.workspaces.push({
        id: workspaceId,
        type,
        name: 'New Workspace' + (state.project.uiData.workspaces.length + 1),
        order,
        activeBoardId: '',
      })
    },
    DELETE_WORKSPACE(state, workspaceId) {
      registerUiDataMutation(state)

      state.project.uiData.workspaces.splice(
        state.project.uiData.workspaces.findIndex((w) => w.id === workspaceId),
        1
      )
    },
    RENAME_WORKSPACE(state, { workspaceId, newName }) {
      registerUiDataMutation(state)

      const workspace = state.project.uiData.workspaces.filter((w) => w.id === workspaceId)[0]
      workspace.name = newName
    },
    SWAP_WORKSPACES_ORDER(state, { workspaceToMoveLeft, workspaceToMoveRight }) {
      registerUiDataMutation(state)

      const leftPosition = workspaceToMoveRight.order
      const rightPosition = workspaceToMoveLeft.order
      workspaceToMoveLeft.order = leftPosition
      workspaceToMoveRight.order = rightPosition
    },
    SET_BOARD_CONFIG(state, { boardId, newConfig }) {
      registerUiDataMutation(state)

      const board: Board = state.project.uiData.boards[boardId]
      if (!board) return
      board.config = {
        ...board.config,
        ...newConfig
      }
    },
    // SET_WORKSPACE_CONFIG(state, { workspaceId, newConfig }) {
    //   registerUiDataMutation(state)

    //   const workspace = state.project.uiData.workspaces.find((w) => w.id === workspaceId)
    //   if (!workspace) return
    //   workspace.configuration = {
    //     ...workspace.configuration,
    //     ...newConfig
    //   }
    // },
    // SNAP_WORKSPACE_TILES_TO_MODULUS(state, { workspaceId, modulus }) {
    //   registerUiDataMutation(state)

    //   const workspace = state.project.uiData.workspaces.find((w) => w.id === workspaceId)
    //   if (!workspace) return
    //   const alignToModulus = (n: number, mod: number) => {
    //     return n - (n % mod)
    //   }
    //   state.project.uiData.boards[boardId].tiles.forEach((t) => {
    //     if (t.workspaceId === workspaceId) {
    //       t.x = alignToModulus(t.x, modulus)
    //       t.y = alignToModulus(t.y, modulus)
    //       t.width = alignToModulus(t.width, modulus)
    //       t.height = alignToModulus(t.height, modulus)
    //     }
    //   })
    // },
    SNAP_BOARD_TILES_TO_MODULUS(state, { boardId, modulus }) {
      registerUiDataMutation(state)

      const workspace = state.project.uiData.workspaces.find((w) => w.id === boardId)
      if (!workspace) return
      const alignToModulus = (n: number, mod: number) => {
        return n - (n % mod)
      }
      state.project.uiData.boards[boardId].tiles.forEach((t) => {
        t.x = alignToModulus(t.x, modulus)
        t.y = alignToModulus(t.y, modulus)
        t.width = alignToModulus(t.width, modulus)
        t.height = alignToModulus(t.height, modulus)
      })
    },
    ACTIVATE_WORKSPACE(state, workspaceId: string) {
      if (workspaceId !== state.project.uiData.activeWorkspaceId) {
        registerUiDataMutation(state)
      }

      if (workspaceId) {
        state.project.uiData.activeWorkspaceId = workspaceId
      }
    },
    CREATE_BOARD(state, id: string) {
      registerUiDataMutation(state)
      console.log('creating board of id: ', id)
      state.project.uiData.boards[id] = {
        ...getEmptyBoard(id)
      }
    },
    DELETE_BOARD(state, id: string) {
      registerUiDataMutation(state)
      delete state.project.uiData.boards[id]
    },
    SET_ACTIVE_BOARD_ID(state, p: { workspaceId: string, boardId: string}) {
      const { workspaceId, boardId } = p
      registerUiDataMutation(state)
      const workspace = state.project.uiData.workspaces.find((ws) => ws.id === workspaceId)
      if (workspace) {
        console.log('setting active board id of workspace to: ', boardId)
        workspace.activeBoardId = boardId
      }
    },
    // SET_CURRENT_BOARD_CAMERA(state) {
    //   const camera = {
    //     x: state.ui.currentBoardData?.boardFrame.scrollLeft || 0,
    //     y: state.ui.currentBoardData?.boardFrame.scrollTop || 0,
    //     scale: Number(state.ui.currentBoardData?.board?.style.transform.replace(/scale|\(|\)/g, '')) || 1
    //   }
    //   if (!state.project.uiData) return
    //   const activeWorkspace = state.project.uiData.workspaces.find(
    //     (w) => w.id === state.project.uiData.activeWorkspaceId
    //   ) as Workspace
    //   activeWorkspace.configuration.lastSessionCamera = camera
    // },
    SAVE_BOARD_CAMERA(state, p: { boardId: string, camera: Camera }) {
      const { boardId, camera } = p
      state.project.uiData.boards[boardId].camera = camera
    },
    /* =========== UI STATE MUTATIONS =========== */
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
    SET_PROJECT_DATA_LOADED(state, value) {
      state.ui.projectDataIsLoaded = value
    },
    START_OPENING_PROJECT(state) {
      state.ui.openingProjectInProgress = true
    },
    STOP_OPENING_PROJECT(state) {
      state.ui.openingProjectInProgress = false
    },
    START_SAVING_PROJECT(state) {
      state.ui.lastProjectSaveTime = String(Date.now())
      state.ui.savingProjectInProgress = true
    },
    STOP_SAVING_PROJECT(state) {
      state.ui.savingProjectInProgress = false
    },
    LOAD_PROJECT_TO_UI(state, project: Project) {
      state.project = project
      window.setTimeout(() => {
        state.ui.lastProjectLoadTime = String(Date.now())
      })
    },
    LOAD_PROJECT_NON_UI_DATA(state, project: Project) {
      state.project.types = project.types
      state.project.instances = project.instances
      state.project.recentChanges = project.recentChanges
      window.setTimeout(() => {
        state.ui.lastProjectLoadTime = String(Date.now())
      })
    },
    // REFERENCE_FRAME_DATA(state, payload: { board: HTMLElement, workspace: HTMLElement }) {
    //   state.ui.currentBoardData = payload
    // },
    REFERENCE_CURRENT_BOARD_DATA(state, payload: { boardFrame: HTMLElement, board: HTMLElement }) {
      state.ui.currentBoardData = payload
    },
    SET_WIDGET_KEY(state, p: { widgetKey: number }) {
      state.ui.activeWidgetKey = p.widgetKey
    },
    SET_LAST_SAVED_TRANSACTION_ID(state) {
      state.ui.lastSavedTransactionId = state.project.recentChanges?.last()?.id || ''
    },
    /* =========== APPLICATION DATA MUTATIONS =========== */
    SET_APPLICATION_DATA(state, data) {
      state.applicationData = data
    },
    RESET_MUTATIONS(state) {
      state.projectUiDataMutated = false
    }
  },
  actions: {
    loadInstances(state) {
      if (state.getters.loadingInstances) {
        console.warn('Already loading static data')
        return
      }
      window.ipcRenderer.send('loadInstances')
      this.commit('setLoadingInstances', true)
    },
    setInstances(state, data: Instances) {
      this.commit('setInstances', data)
      this.commit('setLoadingInstances', false)
    },
    saveInstances(state, data: Instances) {
      window.ipcRenderer.send('saveInstances', data)
    },
    // Id is either tId or iId
    createNewTile(state, p: { boardId: string, type: TileType, id: string }) {
      const { boardId, type, id } = p
      const boardConfig: BoardConfig = state.getters.getBoardConfig(boardId)
      const modulus = boardConfig.modulus
      const boardWidth = boardConfig.width
      const boardHeight = boardConfig.height
      const minDistance = 20

      let spaceX: number
      let spaceY: number

      if (state.getters.getBoardTiles(boardId).length) {
        spaceX = (modulus < minDistance)
          ? minDistance + (minDistance % modulus)
          : modulus
        spaceY = 0
      } else {
        spaceX = boardWidth / 2
        spaceY = boardHeight / 2
      }

      const tileId = id

      const getTileInitialPosition = (): { x: number, y: number } => {
        /*
          Tile will be inserter not lower than min y and not closer to left than max x
        */
        const tiles: Tile[] = state.getters.getBoardTiles(boardId)
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

      this.commit('CREATE_NEW_TILE', { boardId, type, tileId, position })
    },
    createNewWorkspace(state, type: WorkspaceType) {
      const workspaceId = utils.getUniqueId()
      this.commit('CREATE_NEW_WORKSPACE', { type, workspaceId })
    },
    activateWorkspace(state, workspaceId: string) {
      this.commit('ACTIVATE_WORKSPACE', workspaceId)
    },
    resizeTile(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      this.commit('RESIZE_TILE', { tileId, newPosition })
    },
    setTileWidth(state, p: { boardId: string, tileId: string, width: number }) {
      this.commit('SET_TILE_WIDTH', p)
    },
    setTileHeight(state, p: { boardId: string, tileId: string, height: number }) {
      this.commit('SET_TILE_HEIGHT', p)
    },
    dragTile(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      const boardId = (state.getters.activeWorkspace as Workspace).activeBoardId
      this.commit('DRAG_TILE', { boardId, tileId, newPosition })
    },
    startConnectingTiles(state, tileId) {
      this.commit('START_CONNECTING_TILES', tileId)
    },
    stopConnectingTiles() {
      this.commit('STOP_CONNECTING_TILES')
    },
    connectToThisTile(state, tileId) {
      const inputSource = state.getters.selectedInputSourceTile
      if (inputSource.id === tileId) {
        this.commit('STOP_CONNECTING_TILES')
        return
      }
      this.commit('CONNECT_TO_THIS_TILE', tileId)
    },
    bringTileForward(state, tileId) {
      const boardId = (state.getters.activeWorkspace as Workspace).activeBoardId
      this.commit('BRING_TILE_FORWARD', { boardId, tileId })
    },
    startTileDeletion() {
      this.commit('START_TILE_DELETION')
    },
    stopTileDeletion() {
      this.commit('STOP_TILE_DELETION')
    },
    deleteTile(state, p: { boardId: string, tileId: string }) {
      // This should not be needed really
      // this.commit('DELETE_TILE_OUT_BOUND_CONNECTIONS', tileId)
      this.commit('DELETE_TILE', p)
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
    async asyncOpenProjectFromPath(state, path: string) {
      this.commit('START_OPENING_PROJECT')
      await this.dispatch('asyncLoadProject', { path })
      this.commit('STOP_OPENING_PROJECT')
      this.commit('SET_PROJECT_DATA_LOADED', true)
    },
    async asyncOpenNewProject() {
      this.commit('START_OPENING_PROJECT')
      await this.dispatch('asyncLoadProject', { isNew: true })
      this.commit('STOP_OPENING_PROJECT')
      this.commit('SET_PROJECT_DATA_LOADED', true)
    },
    async asyncLoadProject(state, { path, isNew }) {
      await state.dispatch('asyncSaveProject')
        .catch((e) => Error(`Failed saving project. \n${e}`))
      const project: Project = isNew
        ? { ...getNewProject() }
        : (
          await state.dispatch('asyncFetchProject', path)
            .catch((e) => Error(`Failed fetching project. \n${e}`))
        )
      console.log('new project: ', project)
      console.log('about to load new project to ui')
      this.commit('LOAD_PROJECT_TO_UI', project)
      this.commit('SET_LAST_SAVED_TRANSACTION_ID')
      if (isNew) {
        await state.dispatch('asyncSaveProjectAs')
          .catch((e) => Error(`Failed saving project as. \n${e}`))
      } else {
        await state.dispatch('asyncUpdateApplicationData', { lastProjectPath: path })
          .catch((e) => Error(`Failed updating application data. \n${e}`))
      }
    },
    async asyncRealoadTypesAndSDFromLastSave(state) {
      const path = state.getters.applicationData.lastProjectPath

      const project = await state.dispatch('asyncFetchProject', path)
        .catch((e) => Error(`Failed fetching project. \n${e}`))

      this.commit('LOAD_PROJECT_NON_UI_DATA', project)
      this.commit('SET_LAST_SAVED_TRANSACTION_ID')
    },
    asyncLoadApplicationData() {
      return ipc.exchange('loadApplicationData').then((data: ApplicationData) => {
        this.commit('SET_APPLICATION_DATA', data)
      })
    },
    asyncUpdateApplicationData(state, applicationData: Partial<ApplicationData>) {
      const newApplicationData: ApplicationData = {
        ...state.getters.applicationData,
        ...applicationData
      }

      return ipc.exchange('updateApplicationData', { data: newApplicationData }).then(() => {
        this.commit('SET_APPLICATION_DATA', newApplicationData)
      }).catch((e) => {
        /* Only design time really, no idea what to do in that case with a running app */
        throw Error(`Caught error while updating application data.\nError: ${e}`)
      })
    },
    asyncFetchProject(state, path: string) {
      console.log('fetching project')
      return ipc.exchange('fetchProject', { data: path }).then((project: Project) => {
        if (!utils.validateProjectDataKeys(project)) {
          /* Will add later some notifications queue and small popup window for them */
          // this.commit('STOP_OPENING_PROJECT')
          // state.dispatch('openPopup', { type: 'error', message: 'Project data is ivalid' })
          return Promise.reject()
        }
        return project
      })
    },
    asyncSaveProject(state, noConfirm: boolean) {
      if (Object.keys(state.state.project).length === 0) return Promise.resolve()
      this.commit('START_SAVING_PROJECT')
      if (state.getters.isUnsavedData) {
        const decision = noConfirm || window.confirm('You have unsaved changes, do you want to save them?')
        if (decision) {
          // this.dispatch('saveCurrentWorkspaceCamera')
          const { project } = state.state
          return ipc.exchange('saveProject', { data: project }).then(() => {
            this.commit('RESET_MUTATIONS')
            this.commit('SET_LAST_SAVED_TRANSACTION_ID')
          }).finally(() => {
            this.commit('STOP_SAVING_PROJECT')
          })
        }
      }
      this.commit('STOP_SAVING_PROJECT')
      return Promise.resolve()
    },
    asyncBackupProject(state) {
      if (Object.keys(state.state.project).length === 0) return Promise.resolve()
      this.commit('START_PROJECT_BACKUP')
      const { project } = state.state
      const path = state.getters.applicationData.lastProjectPath
      const opPayload = { data: { path, data: project, isBackup: true } }
      return ipc.exchange('backupProject', opPayload).finally(() => {
        this.commit('END_PROJECT_BACKUP')
      })
    },
    asyncSaveProjectAs(state) {
      if (Object.keys(state.state.project).length === 0) return Promise.resolve()
      this.commit('START_SAVING_PROJECT')
      // this.dispatch('saveCurrentWorkspaceCamera')
      const projectData = state.state.project
      return ipc.exchange('saveProjectAs', { data: projectData }).then((path) => {
        return this.dispatch('asyncUpdateApplicationData', { lastProjectPath: path }).then(() => {
          this.commit('STOP_SAVING_PROJECT')
        })
      })
    },
    asyncBeforeApplicationClose() {
      return this.dispatch('asyncSaveProject')
    },
    asyncTestPath(state, path: string) {
      return ipc.exchange('testPath', { data: { path } })
    },
    openSelectDirectoryDialog() {
      return ipc.exchange('selectDirectoryDialog')
    },
    openSelectFileDialog() {
      return ipc.exchange('selectFileDialog')
    },
    referencecurrentBoardData(state, payload: { boardFrame: HTMLElement, board: HTMLElement }) {
      this.commit('REFERENCE_CURRENT_BOARD_DATA', payload)
    },
    saveBoardCamera(state, p: { boardId: string, camera: Camera }) {
      this.commit('SAVE_BOARD_CAMERA', p)
    },
    setWidgetKey(state, p: { widgetKey: number }) {
      this.commit('SET_WIDGET_KEY', p)
    },
    createBoard(state, id: string) {
      this.commit('CREATE_BOARD', id)
    },
    deleteBoard(state, id: string) {
      if (Object.keys(builtInBoards).some((bib) => bib === id)) return
      this.commit('DELETE_BOARD', id)
    },
    setActiveBoardId(state, p: { workspaceId: string, boardId: string}) {
      this.commit('SET_ACTIVE_BOARD_ID', p)
    }
  },
  modules: {
  },
});
