/**
 * This file manages staticData in context of WorldMaker.
 * It loads game data from staticData and saves it there
 * when it's edited, added or deleted.
 */

window.ipcRenderer.on('ipc-test-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})
window.ipcRenderer.on('loadStaticData-reply', (event, arg) => {
  console.log('on loadStaticData-reply, received data:, ', arg)
})
window.ipcRenderer.on('saveStaticData-reply', (event, arg) => {
  console.log('on saveStaticData-reply, result:, ', arg)
})

console.log('sending test message')
window.ipcRenderer.send('ipc-test', 'ping')

const loadStatic = () => window.ipcRenderer.send('loadStaticData')
const saveStatic = () => window.ipcRenderer.send('saveStaticData', quests)

console.log(loadStatic)
console.log(saveStatic)

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
