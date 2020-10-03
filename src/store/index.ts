import { createStore } from 'vuex';

export interface State {
  selectedTask: taskId | null;
}

const stateTemplate: State = {
  selectedTask: null,
}

export default createStore({
  state: stateTemplate,
  getters: {
    selectedTask: (state) => state.selectedTask
  },
  mutations: {
    selectTask(state, taskId: string) {
      state.selectedTask = taskId
    }
  },
  actions: {
  },
  modules: {
  },
});
