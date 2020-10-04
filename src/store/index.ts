import { createStore } from 'vuex';
import quests from '@/game/data/dataManager'

export interface State {
  selectedTask: { questId: string; taskId: string } | null;
  staticData: StaticData,
  stateData: {},
}

const stateTemplate: State = {
  selectedTask: null,
  // staticData: {} as StaticData,
  staticData: quests,
  stateData: {},
}

export default createStore({
  state: stateTemplate,
  getters: {
    selectedTask: (state, getters) => {
      if (!state.selectedTask) return {}
      return getters.task(state.selectedTask)
    },
    task: (state) => (questId: string, taskId: string) => {
      return state.staticData.tasks[questId][taskId]
    },
    quest: (state) => (questId: string) => {
      return state.staticData.quests[questId]
    },
    allQuests: (state) => state.staticData.quests
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
