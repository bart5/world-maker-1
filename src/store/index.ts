import { createStore } from 'vuex';
import staticData from '@/game/data/static'

export interface State {
  selectedTask: { questId: string; taskId: string } | null;
}

const stateTemplate: State = {
  selectedTask: null,
}

export default createStore({
  state: stateTemplate,
  getters: {
    selectedTask: (state) => {
      console.log('gettin value')
      // return state.selectedTask
      if (!state.selectedTask) return {}
      return staticData.tasks[state.selectedTask?.questId][state.selectedTask.taskId]
    }
  },
  mutations: {
    setSelectedTask(state, { questId, taskId }) {
      state.selectedTask = { questId, taskId }
    }
  },
  actions: {
    selectTask(state, taskId: string) {
      this.commit('setSelectedTask', taskId)
    }
  },
  modules: {
  },
});
