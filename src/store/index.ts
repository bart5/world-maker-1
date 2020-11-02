import { ipc } from '@/game/data/ipcHandlersRenderer';
import { createStore } from 'vuex';

/* Shallow */
export const validateProjectDataKeys = (data: any) => {
  return Object.keys(data).every((k) => Object.keys(getNewProjectTemplate()).some((dk) => dk === k))
}

const getWorkspaceConfigurationDefaults = () => {
  const workspaceConfiguration: WorkspaceConfiguration = {
    modulus: 1,
    fitToTiles: false,
    lockScale: false,
    lockedScale: 1,
    lockView: false,
    lockedViewPosition: {},
    lockTiles: false,
    lastSessionCamera: null,
  }
  return workspaceConfiguration
}

const getWorkspaceDefaults = () => {
  const workspace: Workspace = {
    id: `workspace_${Date.now()}${Math.random()}`,
    name: 'New Workspace',
    order: 1,
    configuration: {
      ...getWorkspaceConfigurationDefaults()
    }
  }
  return workspace
}

const getNewProjectUiData = () => {
  const workspaceDefaults = getWorkspaceDefaults()
  const uiData: UiData = {
    workspaces: [{
      ...workspaceDefaults
    }],
    tiles: [],
    staticDataPath: '',
    assetsPath: '',
    activeWorkspaceId: workspaceDefaults.id,
  }
  return uiData
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getInstanceProp(
  valueType: 'int32' | 'string' | 'flt' | 'bool', name: string, values: Array<number | string | boolean>, isArray?: boolean
): InstanceProp {
  return getProp(valueType, name, values, isArray) as InstanceProp;
}
function getTypeDefProp(
  valueType: 'int32' | 'string' | 'flt' | 'bool', name: string, isArray?: boolean
): PropDefinition {
  return getProp(valueType, name, null, isArray);
}
function getProp(
  valueType: 'int32' | 'string' | 'flt' | 'bool', name: string, values?: Array<number | string | boolean> | null, isArray?: boolean
): InstanceProp | PropDefinition {
  return {
    valueType,
    name,
    ...(values || []),
    ...(isArray ? { isArray } : {})
  }
}

const getMockedTypesDefinitions = (): TypesDefinitions => {
  return {
    type1: {
      id: getTypeDefProp('int32', 'id'),
      meta_isBound: getTypeDefProp('bool', 'meta_isBound'),
      meta_typeId: getTypeDefProp('int32', 'meta_typeId'),
      prop1: getTypeDefProp('int32', 'prop1'),
      prop2: getTypeDefProp('int32', 'prop2')
    },
    type2: {
      id: getTypeDefProp('int32', 'id'),
      meta_isBound: getTypeDefProp('bool', 'meta_isBound'),
      meta_typeId: getTypeDefProp('int32', 'meta_typeId'),
      prop1: getTypeDefProp('int32', 'prop1'),
      prop2: getTypeDefProp('flt', 'prop2'),
      prop3: getTypeDefProp('string', 'prop3'),
      prop4: getTypeDefProp('bool', 'prop4'),
      prop5: getTypeDefProp('int32', 'prop5', true),
      prop6: getTypeDefProp('flt', 'prop6', true),
      prop7: getTypeDefProp('string', 'prop7', true),
      prop8: getTypeDefProp('bool', 'prop8', true),
    },
  }
}

function getMockedTypesInstances(typeName: string, typeId: number, types?: TypesDefinitions): TypesInstances {
  const id = Date.now().toString().substring(4)
  const assignValues = (prop: PropDefinition): InstanceProp => {
    const getValues = (valueType: ValueType, isArray?: boolean) => {
      const getValue = (vT: ValueType) => {
        if (vT === 'int32') {
          if (prop.name === 'id') {
            return id
          } else if (prop.name === 'meta_typeId') {
            return typeId
          }
          return Math.round(Math.random() * 100)
        } else if (vT === 'flt') {
          return (Math.random() * 100).toFixed(5)
        } else if (vT === 'string') {
          const pieces = ['qe', 'ra', 'lok', 'nu', 've', 'zis', 'foc', 'wam', 'kud', 'ryx', 'kor'];
          const getWord = () => {
            return new Array(Math.round(Math.random() * 5)).map((t) => {
              t = pieces[Math.round(Math.random() * pieces.length)]
              return t
            }).join()
          }

          const getSentence = () => {
            return (new Array(Math.round(Math.random() * 7)).map((w, i) => {
              w = (i === 0
                ? getWord().split('').map((l, li) => ((li === 0) ? l.toUpperCase() : l))
                : getWord()) + (Math.random() < 0.2 ? ',' : '')
              return w
            }).join(' ') + '.')
          }

          return getSentence()
        }
        return Boolean(Math.round(Math.random()))
      }

      const length = isArray ? (Math.round(Math.random() * 4)) : 1;

      return Array(length).map(() => getValue(valueType)) as ValueType[]
    }

    return {
      valueType: prop.valueType,
      name: prop.name,
      ...(prop.isArray ? { isArray: true } : {}),
      values: getValues(prop.valueType, prop.isArray),
    }
  }

  const props = types ? types[typeName] : getMockedTypesDefinitions()[typeName]
  const TypesInstances: TypesInstances = Object.keys(props).reduce((acc, k) => {
    return {
      ...acc,
      [props[k].name]: assignValues(props[k])
    }
  }, {} as TypesInstances)

  return TypesInstances
}

const getMockedStaticData = (): StaticData => {
  const getType = (typeName: string, typeId: number) => {
    const instance = getMockedTypesInstances(typeName, typeId)
    return {
      [(instance.id as InstanceProp).values[0] as number]: {
        ...instance
      }
    }
  }
  return {
    type1: {
      ...getType('type1', 0),
      ...getType('type1', 0),
      ...getType('type1', 0),
      ...getType('type1', 0)
    },
    type2: {
      ...getType('type2', 1),
      ...getType('type2', 1),
      ...getType('type2', 1),
      ...getType('type2', 1)
    },
  }
}

const getNewProjectTemplate = () => {
  const project: Project = {
    staticData: getMockedStaticData(),
    types: getMockedTypesDefinitions(),
    uiData: {
      ...getNewProjectUiData()
    }
  }
  return project
}

const initialState: ApplicationState = {
  applicationData: null,
  project: {} as Project,
  projectUiDataMutated: false,
  projectStaticDataMutated: false,
  projectEntityBindingsMutated: false,
  ui: {
    connectingInProgress: false,
    tileDeletionInProgress: false,
    workspaceDeletionInProgress: false,
    selectedInputSourceTile: '',
    projectDataIsLoaded: false,
    openingProjectInProgress: false,
    savingProjectInProgress: false,
    activeModal: null,
    lastProjectSaveTime: '',
    lastProjectLoadTime: '',
    frameData: null,
  }
}

const minTileSize = {
  width: 80,
  height: 100
}

const registerUiDataMutation = (state: ApplicationState) => {
  state.projectUiDataMutated = true
}
const registerStaticDataMutation = (state: ApplicationState) => {
  state.projectStaticDataMutated = true
}
// const registerEntityBindingsMutation = (state: ApplicationState) => {
//   state.projectEntityBindingsMutated = true
// }
const resetMutations = (state: ApplicationState) => {
  state.projectUiDataMutated = false
  state.projectStaticDataMutated = false
  state.projectEntityBindingsMutated = false
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
    workspaces: (state) => state.project.uiData.workspaces,
    activeWorkspaceId: (state) => state.project.uiData?.activeWorkspaceId,
    activeWorkspace: (state) => state.project.uiData?.workspaces.filter((ws) => ws.id === state.project.uiData.activeWorkspaceId)[0],
    allTilesOfWorkspace: (state) => (workspaceId: string) => state.project.uiData?.tiles.filter((tile) => {
      return tile.workspaceId === workspaceId
    }),
    activeWorkspaceTiles: (state, getters) => getters.allTilesOfWorkspace(getters.activeWorkspaceId),
    activeWorkspaceTileOfId: (state, getters) => (tileId: string) => {
      return getters.activeWorkspaceTiles.filter((tile: Tile) => tile.id === tileId)
    },
    tileOfId: (state) => (tileId: string) => state.project.uiData.tiles.filter((tile: Tile) => tile.id === tileId)?.[0],
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
    getLastSessionCamera: (state, getters) => () => {
      const activeWorkspaceConfig: WorkspaceConfiguration = getters.activeWorkspace.configuration
      return activeWorkspaceConfig.lastSessionCamera
    },
    activeModal: (state) => state.ui.activeModal,
    applicationData: (state) => state.applicationData,
    projectDataIsLoaded: (state) => state.ui.projectDataIsLoaded,
    isUnsavedData: (state) => {
      return state.projectEntityBindingsMutated
        || state.projectStaticDataMutated
        || state.projectUiDataMutated
    },
    lastProjectSaveTime: (state) => {
      return state.ui.lastProjectSaveTime
    },
    lastProjectLoadTime: (state) => {
      return state.ui.lastProjectLoadTime
    },
    projectTypes: (state) => {
      return state.project.types
    },
    getTypeDefinition: (state) => (typeName: string) => {
      return state.project.types[typeName]
    },
    getPropDefinition: (state) => (typeName: string, propName: string) => {
      return state.project.types[typeName][propName]
    },
    getTypeInstance: (state) => (payload: { typeName: string, instanceId: string }) => {
      return state.project.staticData[payload.typeName][payload.instanceId]
    },
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
      registerUiDataMutation(state)

      state.project.uiData.tiles.push({
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
        zIndex: state.project.uiData.tiles.length || 0,
        output: {
          allData: null,
          slectionData: null,
        }
      })
    },
    RESIZE_TILE(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      registerUiDataMutation(state)

      const tile = state.project.uiData.tiles.filter((t) => t.id === tileId)[0]
      tile.width = Math.max(newPosition.x - tile.x, minTileSize.width)
      tile.height = Math.max(newPosition.y - tile.y, minTileSize.height)
    },
    DRAG_TILE(state, { tileId, newPosition }: { tileId: string, newPosition: { x: number, y: number } }) {
      registerUiDataMutation(state)

      const tile = state.project.uiData.tiles.filter((t) => t.id === tileId)[0]
      tile.x = newPosition.x
      tile.y = newPosition.y
    },
    BRING_TILE_FORWARD(state, tileId) {
      registerUiDataMutation(state)

      const newFrontTile = state.project.uiData.tiles.filter((t) => t.id === tileId)[0]
      // Push other tiles behind
      // Notice that we only push behind the tiles that were in front
      state.project.uiData.tiles.forEach((t) => {
        if (t.zIndex > newFrontTile.zIndex) {
          t.zIndex -= 1
        }
      })
      newFrontTile.zIndex = state.project.uiData.tiles.length
    },
    CONNECT_TO_THIS_TILE(state, tileId) {
      registerUiDataMutation(state)

      state.ui.connectingInProgress = false
      const source = state.ui.selectedInputSourceTile
      state.ui.selectedInputSourceTile = ''

      state.project.uiData.tiles.filter((t) => t.id === tileId)[0].inputSource = source
    },
    DELETE_TILE_OUT_BOUND_CONNECTIONS(state, tileId) {
      registerUiDataMutation(state)

      state.project.uiData.tiles.forEach((t) => {
        if (t.inputSource === tileId) {
          t.inputSource = ''
        }
      })
    },
    DELETE_TILE_IN_BOUND_CONNECTIONS(state, tileId) {
      registerUiDataMutation(state)

      /* As of now tile can have just one inbound connection */
      state.project.uiData.tiles.filter((t) => t.id === tileId)[0].inputSource = ''
    },
    DELETE_TILE(state, tileId) {
      registerUiDataMutation(state)

      state.project.uiData.tiles = [
        ...state.project.uiData.tiles.filter((t) => t.id !== tileId)
      ]
    },
    CREATE_NEW_WORKSPACE(state, workspaceId: string) {
      registerUiDataMutation(state)

      const order = state.project.uiData.workspaces.length
        ? state.project.uiData.workspaces.sort((w1, w2) => w2.order - w1.order)[0].order + 1
        : 1

      state.project.uiData.workspaces.push({
        id: workspaceId,
        name: 'New Workspace' + (state.project.uiData.workspaces.length + 1),
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
      registerUiDataMutation(state)

      state.project.uiData.workspaces.splice(
        state.project.uiData.workspaces.findIndex((w) => w.id === workspaceId),
        1
      )
      state.project.uiData.tiles = state.project.uiData.tiles.filter((t) => t.workspaceId !== workspaceId)
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
    SET_WORKSPACE_CONFIG(state, { workspaceId, newConfig }) {
      registerUiDataMutation(state)

      const workspace = state.project.uiData.workspaces.find((w) => w.id === workspaceId)
      if (!workspace) return
      workspace.configuration = {
        ...workspace.configuration,
        ...newConfig
      }
    },
    SNAP_WORKSPACE_TILES_TO_MODULUS(state, { workspaceId, modulus }) {
      registerUiDataMutation(state)

      const workspace = state.project.uiData.workspaces.find((w) => w.id === workspaceId)
      if (!workspace) return
      const alignToModulus = (n: number, mod: number) => {
        return n - (n % mod)
      }
      state.project.uiData.tiles.forEach((t) => {
        if (t.workspaceId === workspaceId) {
          t.x = alignToModulus(t.x, modulus)
          t.y = alignToModulus(t.y, modulus)
          t.width = alignToModulus(t.width, modulus)
          t.height = alignToModulus(t.height, modulus)
        }
      })
    },
    ACTIVATE_WORKSPACE(state, workspaceId: string) {
      registerUiDataMutation(state)

      if (workspaceId) {
        state.project.uiData.activeWorkspaceId = workspaceId
      }
    },
    SET_CURRENT_WORKSPACE_CAMERA(state) {
      const camera = {
        x: state.ui.frameData?.board.scrollLeft || 0,
        y: state.ui.frameData?.board.scrollTop || 0,
        scale: Number(state.ui.frameData?.workspace?.style.transform.replace(/scale|\(|\)/g, '')) || 1
      }
      if (!state.project.uiData) return
      const activeWorkspace = state.project.uiData.workspaces.find(
        (w) => w.id === state.project.uiData.activeWorkspaceId
      ) as Workspace
      activeWorkspace.configuration.lastSessionCamera = camera
    },
    /* =========== PROJECT STATIC DATA MUTATIONS =========== */
    UPDATE_TYPE_PROPERTY(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
      registerStaticDataMutation(state)
      console.log('new type prop: ', payload.newProp)

      state.project.types[payload.typeName][payload.oldPropName] = {
        ...payload.newProp
      }
    },
    UPDATE_INSTANCE_PROPERTY(state, payload: { newProp: InstanceProp, typeName: string, instanceId: string }) {
      registerStaticDataMutation(state)
      console.log('new instance prop: ', payload.newProp)

      state.project.staticData[payload.typeName][payload.instanceId][payload.newProp.name] = {
        ...payload.newProp
      }
    },
    /* =========== PROJECT ENTITY BINDING MUTATIONS =========== */
    /* =========== APPLICATION DATA MUTATIONS =========== */
    SET_APPLICATION_DATA(state, data) {
      state.applicationData = data
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
    REFERENCE_FRAME_DATA(state, payload: { board: HTMLElement, workspace: HTMLElement }) {
      state.ui.frameData = payload
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
      const project = isNew
        ? { ...getNewProjectTemplate() }
        : (
          await state.dispatch('asyncFetchProject', path)
            .catch((e) => Error(`Failed fetching project. \n${e}`))
        )
      this.commit('LOAD_PROJECT_TO_UI', project)
      if (isNew) {
        await state.dispatch('asyncSaveProjectAs')
          .catch((e) => Error(`Failed saving project as. \n${e}`))
      } else {
        await state.dispatch('asyncUpdateApplicationData', { lastProjectPath: path })
          .catch((e) => Error(`Failed updating application data. \n${e}`))
      }
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
      return ipc.exchange('fetchProject', { data: path }).then((project: Project) => {
        if (!validateProjectDataKeys(project)) {
          console.warn('Fetched project data was invalid.')
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
          this.dispatch('saveCurrentWorkspaceCamera')
          const { project } = state.state
          return ipc.exchange('saveProject', { data: project }).then(() => {
            resetMutations(state.state)
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
      this.dispatch('saveCurrentWorkspaceCamera')
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
    referenceFrameData(state, payload: { board: HTMLElement, workspace: HTMLElement }) {
      this.commit('REFERENCE_FRAME_DATA', payload)
    },
    saveCurrentWorkspaceCamera() {
      this.commit('SET_CURRENT_WORKSPACE_CAMERA')
    },
    /** ==============================================================
     *  TYPES ACTIONS
     *  ==============================================================
     */
    updateTypeProperty(state, payload: { oldPropName: string, newProp: PropDefinition, typeName: string }) {
      this.commit('UPDATE_TYPE_PROPERTY', payload)
    },
    updateInstanceProperty(state, payload: { newProp: PropDefinition, typeName: string, instanceId: string }) {
      this.commit('UPDATE_INSTANCE_PROPERTY', payload)
    },
  },
  modules: {
  },
});
