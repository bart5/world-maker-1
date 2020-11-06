import { createStore } from 'vuex';
import initialState from './state';
import UI from './UI'
import typesAndInstances from './types&instance'

export default createStore({
  state: initialState,
  getters: {
    ...(UI as any).getters,
    ...(typesAndInstances as any).getters,
  },
  mutations: {
    ...(UI as any).mutations,
    ...(typesAndInstances as any).mutations,
    /* =========== APPLICATION DATA MUTATIONS =========== */
    SET_APPLICATION_DATA(state, data) {
      state.applicationData = data
    },
  },
  actions: {
    ...(UI as any).actions,
    ...(typesAndInstances as any).actions,
  },
  modules: {
  },
});
