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
        tiles: [],
        boxes: [],
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
    setNewTile(state, { workspaceId, boxId, x, y }) {
      const id = `Tile_${Date.now()}${Math.random()}`

      state.ui.project.tiles.push({
        id,
        name: 'New Tile',
        boxId: boxId || [],
        inputTile:
        filter:
        hideConnectors:
      })
    }
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

    createNewTile(state, { boxId }: { boxId?: string }) {
      const id = `Tile_${Date.now()}${Math.random()}`

      const getTileInitialPosition = (): { x: number, y: number } => {

      }

      const position

      this.commit('setNewTile', { boxId, position })
    },
    createNewWorkspace(state) {

    }
  },
  modules: {
  },
});
