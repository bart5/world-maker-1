import { ipcMain } from 'electron'
import fs from 'fs'

/* TODO: Figure out later better placemed */
const stateDataSubpath = '/src/game/data/stateData.json'
const staticDataSubpath = '/src/game/data/staticData.json'
const cwd = process.cwd()

const stateDataPath = cwd + stateDataSubpath
const staticDataPath = cwd + staticDataSubpath

function reportError(event: Electron.IpcMainEvent, message: string, operationType = 'generic') {
  event.reply(`${operationType}-error`, message)
}

function returnValue(event: Electron.IpcMainEvent, value: any, operationType = 'generic') {
  event.reply(`${operationType}-reply`, value)
}

function operationWrapper(event: Electron.IpcMainEvent, operationType: string, handler: Promise<any>) {
  handler
    .catch((reason) => {
      reportError(event, reason, operationType)
    })
    .then((data) => {
      returnValue(event, data, operationType)
    })
}

function loadFile(path: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(new Error(`Error loading file from path: ${path}, \n ${err}`))
      }
      console.log(`Success loading data from file: ${path}`)
      const parsed = JSON.parse(data.toString())
      resolve(parsed)
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

export const emitters = {
  onConfiguration() {
    ipcMain.emit('showCurrentProjectConfiguration')
  },
  onClose() {
    ipcMain.emit('closeApplication')
  },
  onSave() {
    ipcMain.emit('saveProject')
  },
  onSaveAs() {
    ipcMain.emit('saveProjectAs')
  },
  onOpenProject() {
    ipcMain.emit('openExistingProject')
  },
  onStartNewProject() {
    ipcMain.emit('startNewProject')
  },
}

export default function setupCommunicaton() {
  console.log('setting up ipc communication')

  ipcMain.on('loadStateData', (event) => {
    operationWrapper(event, 'loadStateData', loadFile(stateDataPath))
  })

  ipcMain.on('saveStateData', (event, data: {}) => {
    operationWrapper(event, 'saveStateData', saveFile(stateDataPath, data))
  })

  ipcMain.on('loadStaticData', (event) => {
    operationWrapper(event, 'loadStaticData', loadFile(staticDataPath))
  })

  ipcMain.on('saveStaticData', (event, data: {}) => {
    operationWrapper(event, 'saveStaticData', saveFile(staticDataPath, data))
  })
}
