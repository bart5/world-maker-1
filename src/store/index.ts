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
    }
  }
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
    activeWorkspaceId: (state) => state.ui.project.activeWorkspaceId,
    allTilesOfWorkspace: (state) => (workspaceId: string) => state.ui.project.tiles.filter(tile => {
      return tile.workspaceId === workspaceId
    }),
    // allBoxesOfWorkspace: (state) => (workspaceId: string) => state.ui.project.boxes.filter(box => {
    //   return box.workspaceId === workspaceId
    // }),
    activeWorkspaceTiles: (state, getters) => getters.allTilesOfWorkspace(getters.activeWorkspaceId),
    // activeWorkspaceBoxes: (state, getters) => getters.allBoxesOfWorkspace(getters.activeWorkspaceId),
    allBoxedTilesOfWorkspace: (state, getters) => (workspaceId: string) => {
      return getters.allTilesOfWorkspaceId(getters.activeWorkspaceId).filter((tile: Tile) => {
        return tile.boxId !== ''
      })
    },
    allFreeTilesOfWorkspace: (state, getters) => (workspaceId: string) => {
      return getters.allTilesOfWorkspaceId(getters.activeWorkspaceId).filter((tile: Tile) => {
        return tile.boxId === ''
      })
    },
    boxOfId: (state) => (boxId: string) => state.ui.project.boxes.filter(b => b.id === boxId)
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
    setNewTile(state, { workspaceId, boxId, tileId, position }) {
      state.ui.project.tiles.push({
        id: tileId,
        name: 'New Tile',
        boxId: boxId || '',
        workspaceId,
        inputTile: '',
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
      const id = `Tile_${Date.now()}${Math.random()}`

      const getTileInitialPosition = (): { x: number, y: number } => {
        /* get maximal x */
        /* get minimal y */
        /* insert past that x and on minimal y */
        // const workspace: Workspace = state.getters.getActiveWorkspace
        const tiles: Tile[] = state.getters.activeWorkspaceTiles
        const minYmaxX: { minY: number, maxX: number } = () => {
          const minTileY = tiles.sort((tA, tB) => tA.y - tB.y)
          const minBoxY = tiles.map(tile => state.getters.boxOfId(tile.boxId)).sort((bA, bB) => bA.y - bB.y)
          const maxTileX
          const maxBoxX
        }

      }

      const position

      this.commit('setNewTile', { workspaceId: state.getters.activeWorkspaceId, boxId, position })
    },
    createNewWorkspace(state) {

    }
  },
  modules: {
  },
});
