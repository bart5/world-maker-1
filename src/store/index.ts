import { createStore } from 'vuex';
import initialState from './state';
import UI from './UI'
import typesAndInstances from './types&instances'

export default createStore({
  state: initialState,
  getters: {
    ...(UI as any).getters,
    ...(typesAndInstances as any).getters,
  },
  mutations: {
    ...(UI as any).mutations,
    ...(typesAndInstances as any).mutations,
  },
  actions: {
    ...(UI as any).actions,
    ...(typesAndInstances as any).actions,
  },
});
