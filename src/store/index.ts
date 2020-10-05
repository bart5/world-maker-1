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
      const tileId = `Tile_${Date.now()}${Math.random()}`

      const getTileInitialPosition = (): { x: number, y: number } => {
        /* get minimal y */
        /* get maximal x */
        /* insert tile not lower than minimal y and not closer than maximal x */
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

      this.commit('setNewTile', { workspaceId: state.getters.activeWorkspaceId, tileId, boxId, position })
    },
    createNewWorkspace(state) {

    }
  },
  modules: {
  },
});
