import { Vue } from 'vue-class-component'

/**
 * This file manages staticData in context of WorldMaker.
 * It loads game data from staticData and saves it there
 * when it's edited, added or deleted.
 */

function closeCurrentProject() {
  /*  */
}

function onApplicationLoad() {
  /*  */
}

function loadApplicationData() {
  /*  */
}

function loadProjectConfig() {
  /*  */
}

function loadProjectData() {
  /*  */
}

function saveProjectConfig() {
  /*  */
}

function saveProjectSpecData() {
  /*  */
}

function saveProjectStaticData() {
  /*  */
}

(window as any).ipcTest = () => {
  window.ipcRenderer.send('ipcTest')
}

export const initializeDataManager = (vm: Vue) => {
  console.log('Setting IPC listeners')
  // vm.$store.dispatch('setStaticData')

  window.ipcRenderer.on('ipcTest-reply', (event, data: any, opType: string) => {
    console.log(`Response to ${opType}, received data: ${data}`)
  })

  window.ipcRenderer.on('loadStaticData-reply', (event, data: StaticData) => {
    console.log('on loadStaticData-reply, received data:, ', data)
    vm.$store.dispatch('setStaticData', data)
  })

  window.ipcRenderer.on('saveStaticData-reply', (event, arg) => {
    console.log('on saveStaticData-reply, result:, ', arg)
  })

  window.ipcRenderer.on('startNewProject', () => {
    vm.$store.dispatch('setStaticData')
  })

  window.ipcRenderer.on('openExistingProject', () => {
    vm.$store.dispatch('setStaticData')
  })

  window.ipcRenderer.on('saveProject', () => {
    vm.$store.dispatch('setStaticData')
  })

  window.ipcRenderer.on('saveProjectAs', () => {
    vm.$store.dispatch('setStaticData')
  })

  window.ipcRenderer.on('showCurrentProjectConfiguration', () => {
    console.log('received show modal signal')
    vm.$store.dispatch('openConfigurationModal')
  })

  window.ipcRenderer.on('closeApplication', () => {
    vm.$store.dispatch('setStaticData')
  })
}

const quests: {
  [questId: string]: Quest;
} = {
  '1': {
    id: '1',
    name: 'Test quest 1',
    firstTask: '1',
    active: true,
    done: false,
    failed: false,
    obsolete: false,
  }
}

const tasks: {
  [Key in keyof typeof quests]: {
    [taskId: string]: Task;
  }
} = {
  '1': {
    '1': {
      id: '1',
      name: 'Test task 1',
      questId: '1',
      successConditions: [],
      onSuccess: [],
      failureConditions: [],
      onFailure: [],
      active: true,
      done: false,
      failed: false,
      isFirstTask: true,
      isLastTask: false,
      formerTasks: null,
      nextTasks: ['2', '3'],
    },
    '2': {
      id: '2',
      name: 'Test task 2',
      questId: '1',
      successConditions: [],
      onSuccess: [],
      failureConditions: [],
      onFailure: [],
      active: false,
      done: false,
      failed: false,
      isFirstTask: false,
      isLastTask: true,
      formerTasks: ['1'],
      nextTasks: null,
    },
    '3': {
      id: '3',
      name: 'Test task 3',
      questId: '1',
      successConditions: [],
      onSuccess: [],
      failureConditions: [],
      onFailure: [],
      active: false,
      done: false,
      failed: false,
      isFirstTask: false,
      isLastTask: true,
      formerTasks: ['1'],
      nextTasks: null,
    }
  }
}

export default {
  quests,
  tasks
}
