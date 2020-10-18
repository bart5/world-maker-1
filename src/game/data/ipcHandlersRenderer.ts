import { Vue } from 'vue-class-component'

(window as any).ipcTest = () => {
  window.ipcRenderer.send('ipcTest')
}

interface Ipc {
  vm: Vue;
  exchangeTimeout: number;
  exchangesInProgress: {[k: string]: {
    resolve: (value: unknown) => void,
    reject: (reason?: any) => void
  }};
  exchange: (opType: opType, payload?: { data?: any, noTimeout?: boolean }) => Promise<any>;
  send: (opType: opType, request: IpcRequest) => void;
  resolveExchange: (reply: IpcReply) => void;
  rejectExchange: (reply: IpcReply) => void;
  initListener: (eventType: menuSignal | operationResponseType, handler: (reply?: IpcReply) => void) => void;
  getListeners: (vm: Vue) => Record<menuSignal | operationResponseType, (reply?: IpcReply) => void>;
  initListeners: (vm: Vue) => void
}

export const ipc: Ipc = {
  vm: {} as Vue,
  exchangeTimeout: 1000 * 30,
  exchangesInProgress: {},
  exchange(opType, payload) {
    const { data, noTimeout } = payload || {}
    console.log('will send request with data: ', data)
    const exchangeId = `${opType}_sent:${Date.now()}_hash:${Math.random()}`
    this.send(opType, { opType, payload: JSON.stringify(data), exchangeId })
    return new Promise((resolve, reject) => {
      if (!noTimeout) {
        window.setTimeout(() => {
          if (this.exchangesInProgress.exchangeId) {
            delete this.exchangesInProgress.exchangeId
            reject()
          }
        }, this.exchangeTimeout)
      }
      this.exchangesInProgress = {
        ...this.exchangesInProgress,
        [exchangeId]: {
          resolve,
          reject
        }
      }
    })
  },
  send(opType, request) {
    window.ipcRenderer.send(opType, request)
  },
  resolveExchange(reply: IpcReply) {
    const { opType, data, exchangeId } = reply
    const exchange = this.exchangesInProgress[exchangeId]
    if (exchange) {
      exchange.resolve(data)
    } else {
      console.warn(`Received reply to unregistered exchange for operation: ${opType}.\nReply data: ${data}`)
    }
  },
  rejectExchange(reply: IpcReply) {
    const { opType, data, exchangeId } = reply
    const exchange = this.exchangesInProgress[exchangeId]
    if (exchange) {
      console.warn(`Exchange failed with following information from main process:\n${data}`)
      exchange.reject(data)
    } else {
      console.warn(`Received error to unregistered exchange for operation: ${opType}.\nError data: ${data}`)
    }
  },
  initListener(eventType, handler) {
    window.ipcRenderer.on(eventType, (event, reply?: IpcReply) => handler(reply))
  },
  getListeners(vm: Vue) {
    return {
      reply(reply) {
        console.log(`Received reply: ${JSON.stringify(reply)}`)
        ipc.resolveExchange(reply as IpcReply)
      },
      error(reply) {
        ipc.rejectExchange(reply as IpcReply)
      },
      startNewProject() {
        vm.$store.dispatch('startNewProjectConfiguration')
      },
      openExistingProject() {
        vm.$store.dispatch('openModal', 'projectSelector')
      },
      saveProject() {
        vm.$store.dispatch('saveProject')
      },
      async saveProjectAs() {
        const newPath = await vm.$store.dispatch('saveProjectAs').catch((r) => {
          console.info('Did not save project: ', r)
        })
        const projectConfig = { ...vm.$store.getters.newProjectConfig }
        projectConfig.localSavePath = newPath
        vm.$store.dispatch('asyncUpdateApplicationData', { projectConfig })
      },
      showCurrentProjectConfiguration() {
        vm.$store.dispatch('openModal', 'configuration')
      },
      closeApplication() {
        /*  */
      },
    }
  },
  initListeners(vm: Vue) {
    console.info('Initializing IPC listeners.')
    const listeners = this.getListeners(vm);
    (Object.keys(listeners) as Array<menuSignal | operationResponseType>).forEach((k) => {
      return this.initListener(k, listeners[k])
    })
  }
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
