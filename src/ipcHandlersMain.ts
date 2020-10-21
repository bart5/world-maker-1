import { ipcMain, WebContents, app, dialog, BrowserWindow, shell } from 'electron'
import fs from 'fs'

const appDataDirectory = app.getPath('appData') + '/World-Maker'
const appDataFile = 'applicationData.json'
const defaultProjectsDirectory = appDataDirectory + '/projects'

let applicationData = {} as ApplicationData

const getDefaultProjectsDirectory = () => {
  return applicationData.defaultLocalPath || defaultProjectsDirectory
}

const rememberCurrentApplicationData = (newApplicationData: ApplicationData) => {
  applicationData = newApplicationData
}

/* It assumes that path leads to a file */
function getFileNameFromPath(path: string) {
  return path.replace(/^.*\/+/, '')
}

/* It assumes that path leads to a file */
function getDirectoryFromPath(path: string) {
  return path.replace(`/${getFileNameFromPath(path)}`, '')
}

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
        resolve('')
      } else {
        console.log(`Success loading data from file: ${path}`)
        const parsed = JSON.parse(data.toString())
        resolve(parsed)
      }
    });
  })
}

const getError = (message: string, error?: Error | NodeJS.ErrnoException | null) => {
  message = message || 'Caught error.'
  const content = message + (error ? `\n${error}` : '')
  return Error(content)
}

/*
  It will create directories if they are not existent.
  Overwriting happens in 3 steps: 1) create temp 2) delete old 3) rename temp.
  Backuping never overwrites.
*/
function saveFile(directory: string, fileName: string, data: any = {}, isBackup?: boolean) {
  if (directory === '/') {
    return Promise.reject(getError('Invalid directory - cannot save to directory "/".'))
  }
  const dir = directory
  const fName = fileName.replace('/', '')
  const path = `${dir}/${fName}`
  return new Promise((resolve, reject) => {
    /* Save file as .temp */
    const saveData = () => {
      if (isBackup) {
        const backupPath = path + `-${Date.now()}`
        fs.writeFile(backupPath, JSON.stringify(data), (err) => {
          if (err) return reject(getError(`Error saving data for file in path: ${backupPath}`, err))
          console.info(`Success saving data to file: ${backupPath}.temp`)
          return resolve({ path: backupPath })
        })
      } else {
        fs.writeFile(`${path}.temp`, JSON.stringify(data), (err) => {
          if (err) return reject(getError(`Error saving data for file in path: ${path}`, err))
          console.info(`Success saving data to file: ${path}.temp`)

          /* Check for existance of old version */
          return fs.readdir(dir, (err1, files) => {
            if (err1) return reject(getError(`Error trying to read the directory: ${dir}`, err))
            console.info(`Success reading directory: ${dir}`)

            const oldVersion = files.filter((file) => file === fName)[0]
            /* Delete old version if exists */
            if (oldVersion) {
              deleteFile(path).catch((e) => {
                return reject(getError(`Could not delete old version of the file in path: ${path}.\n${e}`, e))
              })
              console.info(`Success deleting file: ${path}`)
            }

            /* Remove .temp appendix from the new file */
            return fs.rename(`${path}.temp`, path, (err2) => {
              if (err2) return reject(getError(`Could not rename file: ${path}.temp`, err2))
              console.info(`Success renaming file to: ${path}`)

              return resolve({ path })
            })
          })
        })
      }
    }

    return fs.readdir(dir, (err) => {
      if (err) {
        console.info(`Directory ${dir} does not exist. Will try to create it.`)

        fs.mkdir(appDataDirectory, { recursive: true }, (err1) => {
          if (err1) return reject(getError(`Failed recursively creating new directory: ${appDataDirectory}`, err1))
          return saveData()
        })
      } else {
        saveData()
      }
    })
  })
}

function deleteFile(path: string) {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject(new Error(`Error deleting file in path: ${path}, \n ${err}`))
      }
      console.info(`Success deleting file in path: ${path}`)
      resolve(`File ${path} removed.`)
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
  onOpenProjectDirectory() {
    shell.openPath(applicationData.lastProjectPath)
  },
  onSave() {
    contents.send('saveProject')
  },
  onSaveAs() {
    contents.send('saveProjectAs')
  },
  onConfiguration() {
    contents.send('showApplicationConfiguration')
  },
  onClose() {
    contents.send('closeApplication')
  },
  onShowTypesEditor() {
    contents.send('showTypesEditor')
  },
})

export default function setupCommunicaton(getWindow: () => BrowserWindow | null) {
  console.info('Setting up IPC communication.')

  const handlers: {[key in opType]: (data?: any) => Promise<any> } = {
    testPath(path) {
      const testFile = `testFile${Date.now()}.test`
      return saveFile(path, testFile, '').then(() => deleteFile(`${path}/${testFile}`))
    },
    loadApplicationData() {
      return (loadFile(`${appDataDirectory}/${appDataFile}`) as Promise<ApplicationData | ''>).then((data) => {
        if (typeof data === 'string' && data === '') {
          const initialApplicationData: ApplicationData = {
            allowAutosave: true,
            autosaveInterval: 5,
            allowBackup: true,
            backupInterval: 60,
            lastProjectPath: '',
            defaultLocalPath: defaultProjectsDirectory,
          }

          return new Promise((resolve) => {
            /* Check for projects directory and potentially create it */
            fs.readdir(defaultProjectsDirectory, (e) => {
              if (e) {
                fs.mkdir(defaultProjectsDirectory, { recursive: true }, (e1) => {
                  if (e1) getError('Could not create default projects directory,', e1)
                })
              }
              resolve()
            })
          }).then(() => {
            return saveFile(appDataDirectory, appDataFile, initialApplicationData).then(() => {
              rememberCurrentApplicationData(initialApplicationData)
              return initialApplicationData
            })
          })
        }
        /* Validating if lastProjectPath is still valid */
        return new Promise((resolve) => {
          const fileName = getFileNameFromPath(data.lastProjectPath).replace('.json', '')
          const directory = getDirectoryFromPath(data.lastProjectPath)
          fs.readdir(directory, (e, files) => {
            if (e || !files.some((fName) => fName.replace('.json', '') === fileName)) {
              data.lastProjectPath = ''
              return resolve(false)
            }
            return resolve(true)
          })
        }).then((newData) => {
          if (newData) {
            return saveFile(appDataDirectory, appDataFile, data).then(() => {
              rememberCurrentApplicationData(data)
              return data
            })
          }
          return Promise.resolve(data)
        })
      })
    },
    updateApplicationData(payload: ApplicationData) {
      return new Promise((resolve) => {
        /* Check for projects directory and potentially create it */
        fs.readdir(payload.defaultLocalPath, (e) => {
          if (e) {
            fs.mkdir(payload.defaultLocalPath, { recursive: true }, (e1) => {
              if (e1) getError('Could not create default projects directory,', e1)
            })
          }
          resolve()
        })
      }).then(() => {
        return saveFile(appDataDirectory, appDataFile, payload).then(() => {
          rememberCurrentApplicationData(payload)
        })
      })
    },
    fetchProject(path: string) {
      return loadFile(path)
    },
    saveProject(payload: Project) {
      const path = applicationData.lastProjectPath
      const fileName = getFileNameFromPath(path)
      const directory = getDirectoryFromPath(path)
      return saveFile(directory, fileName, payload)
    },
    backupProject(payload: { path: string, data: Project }) {
      const { path, data } = payload
      const fileName = getFileNameFromPath(path)
      const directory = getDirectoryFromPath(path)
      return saveFile(directory, fileName, data, true)
    },
    selectDirectoryDialog(payload: { buttonLabel: string, defaultPath: string }) {
      const win = getWindow()
      if (!win) return Promise.reject(getError('No browser window found.'))

      return dialog.showOpenDialog(win, {
        defaultPath: payload.defaultPath || getDefaultProjectsDirectory(),
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: payload.buttonLabel || 'Select directory'
      }).then((data: { canceled: boolean, filePaths: string[] }) => {
        const { canceled, filePaths } = data
        return { canceled, directory: filePaths[0] }
      })
    },
    selectFileDialog(payload: { buttonLabel: string, defaultPath: string }) {
      const win = getWindow()
      if (!win) return Promise.reject(getError('No browser window found.'))

      return dialog.showOpenDialog(win, {
        defaultPath: getDefaultProjectsDirectory(),
        filters: [
          { name: 'JSON', extensions: ['json'] },
        ],
        properties: ['openFile'],
        buttonLabel: payload.buttonLabel || 'Select project file'
      }).then((data: { canceled: boolean, filePaths: string[] }) => {
        const { canceled, filePaths } = data
        return { canceled, path: filePaths[0] }
      })
    },
    saveProjectAs(project: Project) {
      const win = getWindow()
      if (!win) return Promise.reject(getError('No browser window found.'))

      return dialog.showSaveDialog(win, {
        title: 'Save project',
        defaultPath: getDefaultProjectsDirectory() + '/project.json',
        filters: [
          { name: 'JSON', extensions: ['json'] },
        ],
        properties: ['createDirectory'],
        buttonLabel: 'Save project as'
      }).then((data: { canceled: boolean, filePath?: string }) => {
        const { canceled, filePath } = data
        if (canceled || !filePath) return Promise.reject(getError('File selection canceled.'))

        const fileName = getFileNameFromPath(filePath).replace('.json', '') + '.json'
        const directory = getDirectoryFromPath(filePath)
        return saveFile(directory, fileName, project).then(() => {
          return `${directory}/${fileName}`
        })
      })
    }
  }

  const setupListeners = () => {
    (Object.keys(handlers) as Array<keyof typeof handlers>).forEach((operationType) => {
      ipcMain.on(operationType, (event, request: IpcRequest) => {
        console.log(`On: ${operationType}`)
        console.log(`Received request: ${JSON.stringify(request)}`)
        operationWrapper(event, request.opType, request.exchangeId, handlers[operationType](JSON.parse(request.payload || '{}')))
      })
    })
  }

  setupListeners()
}
