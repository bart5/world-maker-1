import { Vue } from 'vue-class-component'

(window as any).ipcTest = () => {
  window.ipcRenderer.send('ipcTest')
}

export const ipc = {
  exchangeTimeout: 1000 * 30,
  exchangesInProgress: {} as {[k: string]: {
    resolve: (value: unknown) => void,
    reject: (reason?: any) => void
  }},
  exchange(opType: string, payload?: any) {
    const exchangeId = `${opType}_sent:${Date.now()}_hash:${Math.random()}`
    window.ipcRenderer.send(opType, { payload, exchangeId })
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        delete this.exchangesInProgress.exchangeId
        reject()
      }, this.exchangeTimeout)
      this.exchangesInProgress.exchangeId = {
        resolve,
        reject
      }
    })
  },
  resolveExchange(reply: IpcReply) {
    const { opType, data, exchangeId } = reply
    const exchange = this.exchangesInProgress[exchangeId]
    if (exchange) {
      exchange.resolve(data)
    } else {
      console.warn(`Received reply to unregistered exchange for operation: ${opType}, reply data: ${data}`)
    }
  },
  rejectExchange(reply: IpcReply) {
    const { opType, data, exchangeId } = reply
    const exchange = this.exchangesInProgress[exchangeId]
    if (exchange) {
      exchange.reject(data)
    } else {
      console.warn(`Received error to unregistered exchange for operation: ${opType}, error data: ${data}`)
    }
  },

}

export const initIpcListeners = (vm: Vue) => {
  window.ipcRenderer.on('reply', (event, reply: IpcReply) => ipc.resolveExchange(reply))
  window.ipcRenderer.on('error', (event, reply: IpcReply) => ipc.rejectExchange(reply))

  window.ipcRenderer.on('showCurrentProjectConfiguration', () => {
    console.log('received show modal signal')
    vm.$store.dispatch('openConfigurationModal')
  })

  window.ipcRenderer.on('startNewProject', () => {
    vm.$store.dispatch('startNewProject')
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
