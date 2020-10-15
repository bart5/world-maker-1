import { ipcMain, WebContents, app } from 'electron'
import fs from 'fs'

/* TODO: Figure out later better placemed */
// const stateDataSubpath = '/src/game/data/stateData.json'
// const staticDataSubpath = '/src/game/data/staticData.json'
// const cwd = process.cwd()

// const stateDataPath = cwd + stateDataSubpath
// const staticDataPath = cwd + staticDataSubpath

const appDataPath = app.getPath('appData') + '/applicationData.json'

function reportError(event: Electron.IpcMainEvent, response: IpcReply) {
  event.reply('error', response)
}

function returnValue(event: Electron.IpcMainEvent, response: IpcReply) {
  event.reply('reply', response)
}

function operationWrapper(event: Electron.IpcMainEvent, opType: opType, exchangeId: string, handler: Promise<any>) {
  const getResponse = (data: any): IpcReply => ({
    opType,
    exchangeId,
    data
  })
  handler
    .then((data) => {
      returnValue(event, getResponse(data))
    })
    .catch((reason) => {
      reportError(event, getResponse(reason))
    })
}

function loadFile(path: string) {
  return new Promise((resolve) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        console.warn(`No file was found under: ${path}`)
        resolve({})
      } else {
        console.log(`Success loading data from file: ${path}`)
        const parsed = JSON.parse(data.toString())
        resolve(parsed)
      }
    });
  })
}

function saveFile(path: string, data: {}) {
  const strigified = JSON.stringify(data)
  return new Promise((resolve, reject) => {
    fs.writeFile(path, strigified, (err) => {
      if (err) {
        reject(new Error(`Error saving data for file file in path: ${path}, \n ${err}`))
      }
      console.log(`Success saving data to file: ${path}`)
      resolve(`Data saved to ${path}`)
    });
  })
}

export const emittersFactory = (contents: WebContents) => ({
  onStartNewProject() {
    contents.send('startNewProject')
  },
  onOpenProject() {
    contents.send('openExistingProject')
  },
  onSave() {
    contents.send('saveProject')
  },
  onSaveAs() {
    contents.send('saveProjectAs')
  },
  onConfiguration() {
    contents.send('showCurrentProjectConfiguration')
  },
  onClose() {
    contents.send('closeApplication')
  },
})

export default function setupCommunicaton() {
  console.info('Setting up IPC communication.')

  const handlers: {[key in opType]: (data?: any) => Promise<any> } = {
    loadApplicationData() {
      return loadFile(appDataPath)
    },
    saveApplicationData(data) {
      return saveFile(appDataPath, data)
    }
  }

  const setupListeners = () => {
    (Object.keys(handlers) as Array<keyof typeof handlers>).forEach((operationType) => {
      ipcMain.on(operationType, (event, payload: IpcRequest) => {
        console.log(`On: ${operationType}`)
        console.log(`Received payload: ${JSON.stringify(payload)}`)
        operationWrapper(event, payload.opType, payload.exchangeId, handlers[operationType](payload))
      })
    })
  }

  setupListeners()
}
