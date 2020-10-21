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
  initListener: (eventType: menuSignal | operationResponseType, handler: (data?: any) => void) => void;
  getExchangeListeners: () => Record<operationResponseType, (reply?: IpcReply) => void>;
  getSignalListeners: (vm: Vue) => Record<menuSignal, () => void>;
  initListeners: (vm: Vue) => void
}

export const ipc: Ipc = {
  vm: {} as Vue,
  exchangeTimeout: 1000 * 30,
  exchangesInProgress: {},
  exchange(opType, payload) {
    const { data, noTimeout } = payload || {}
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
    window.ipcRenderer.on(eventType, (event, data?: any) => handler(data))
  },
  getExchangeListeners() {
    return {
      reply(reply) {
        ipc.resolveExchange(reply as IpcReply)
      },
      error(reply) {
        ipc.rejectExchange(reply as IpcReply)
      },
    }
  },
  getSignalListeners(vm: Vue) {
    return {
      startNewProject() {
        vm.$store.dispatch('asyncOpenNewProject')
      },
      openExistingProject() {
        vm.$store.dispatch('openModal', 'projectSelector')
      },
      saveProject() {
        vm.$store.dispatch('asyncSaveProject', true)
      },
      saveProjectAs() {
        vm.$store.dispatch('asyncSaveProjectAs').catch((r) => {
          console.info('Could not save the project: ', r)
        })
      },
      showApplicationConfiguration() {
        vm.$store.dispatch('openModal', 'configuration')
      },
      closeApplication() {
        vm.$store.dispatch('asyncSaveProject').then(() => {
          window.close()
        })
      },
      showTypesEditor() {
        vm.$store.dispatch('openModal', 'typesManager')
      },
    }
  },
  initListeners(vm: Vue) {
    console.info('Initializing IPC listeners.')
    const listeners = { ...this.getExchangeListeners(), ...this.getSignalListeners(vm) };
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
