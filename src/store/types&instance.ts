import { ipc } from '@/game/data/ipcHandlersRenderer';
import { createStore } from 'vuex';
import * as utils from './utils';
import initialState from './state';

const minTileSize = {
  width: 80,
  height: 100
}

const registerUiDataMutation = (state: ApplicationState) => {
  state.projectUiDataMutated = true
}
const resetMutations = (state: ApplicationState) => {
  state.projectUiDataMutated = false
  state.projectInstancesMutated = false
  state.projectEntityBindingsMutated = false
}

const identity = (payload: any) => payload
const UI = identity as unknown as typeof createStore

export default UI({
  state: initialState,
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
});
