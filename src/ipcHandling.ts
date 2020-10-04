import { ipcMain, dialog } from "electron"
import fs from 'fs'

/* TODO: Figure out later better placemed */
const stateDataSubpath = '/src/game/data/stateData.json'
const staticDataSubpath = '/src/game/data/staticData.json'
const cwd = process.cwd()

const stateDataPath = cwd + stateDataSubpath
const staticDataPath = cwd + staticDataSubpath

function reportError(event: Electron.IpcMainEvent, message: string, operationType: string = 'generic') {
  event.reply(`${operationType}-error`, message )
}

function returnValue(event: Electron.IpcMainEvent, value: any, operationType: string = 'generic') {
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

function loadFile(path: string, event: Electron.IpcMainEvent, callback?: (...args: any[]) => void) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(`Error loading file from path: ${path}, \n ${err}`)
        throw err
      }
      console.log(`Success loading data from file: ${path}`)
      const parsed = JSON.parse(data.toString())
      resolve(parsed)
    });
  })
}

function saveFile(path: string, data: {}, event: Electron.IpcMainEvent, callback?: (...args: any[]) => void) {
  const strigified = JSON.stringify(data)
  return new Promise((resolve, reject) => {
    fs.writeFile(path, strigified, (err) => {
      if (err) {
        reject(`Error saving data for file file in path: ${path}, \n ${err}`)
        throw err
      }
      console.log(`Success saving data to file: ${path}`)
      resolve(`Data saved to ${path}`)
    });
  })
}

export function setupCommunicaton() {
  console.log('setting up ipc communication')

  ipcMain.on('ipc-test', (event, arg: any) => {
    console.log(`received arguments: ${arg}`)
    event.reply('ipc-test-reply', 'pong')
  })

  ipcMain.on('loadStateData', (event) => {
    operationWrapper(event, 'loadStateData', loadFile(stateDataPath, event))
  })

  ipcMain.on('saveStateData', (event, data: {}) => {
    operationWrapper(event, 'saveStateData', saveFile(stateDataPath, data, event))
  })

  ipcMain.on('loadStaticData', (event) => {
    operationWrapper(event, 'loadStaticData', loadFile(staticDataPath, event))
  })

  ipcMain.on('saveStaticData', (event, data: {}) => {
    operationWrapper(event, 'saveStaticData', saveFile(staticDataPath, data, event))
  })
}
