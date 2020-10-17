import { ipcMain, WebContents, app, dialog, BrowserWindow } from 'electron'
import fs from 'fs'

const appDataDirectory = app.getPath('appData') + '/World-Maker'
const appDataFile = 'applicationData.json'
const defaultProjectsDirectory = appDataDirectory + '/projects'

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

function saveFile(directory: string, fileName: string, data: any = {}) {
  const dir = directory === '/' ? directory : directory.replace(/$\//, '')
  const fName = fileName.replace('/', '')
  const path = `${dir}/${fName}`
  return new Promise((resolve, reject) => {
    /* Save file as .temp */
    const saveData = () => fs.writeFile(`${path}.temp`, JSON.stringify(data), (err) => {
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

          return resolve(`Successfully saved file ${fileName} in ${directory}`)
        })
      })
    })

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

export default function setupCommunicaton(getWindow: () => BrowserWindow | null) {
  console.info('Setting up IPC communication.')

  const handlers: {[key in opType]: (data?: any) => Promise<any> } = {
    testPath(path) {
      const testFile = 'testFile.test'
      return saveFile(path, testFile, '').then(() => deleteFile(`${path}/${testFile}`))
    },
    loadApplicationData() {
      return loadFile(`${appDataDirectory}/${appDataFile}`).then((data) => {
        if (typeof data === 'string' && data === '') {
          const initialApplicationData: ApplicationData = {
            projects: {},
            lastProjectId: '',
            defaultLocalPath: defaultProjectsDirectory
          }

          return saveFile(appDataDirectory, appDataFile, initialApplicationData).then(() => {
            return initialApplicationData
          })
        }
        return data
      })
    },
    updateApplicationData(payload) {
      return saveFile(appDataDirectory, appDataFile, payload)
    },
    updateProjectPaths(payload: { oldConfig: ProjectConfig, newConfig: ProjectConfig, removeOld: boolean }) {
      const newPath = payload.newConfig.localSaveDirectory
      const oldPath = payload.oldConfig.localSaveDirectory
      return new Promise((resolve, reject) => {
        (loadFile(oldPath) as Promise<Project>).then((project) => {
          const fileName = payload.newConfig.name.replace(' ', '-') + '.json'
          saveFile(newPath, fileName, project).then(() => {
            if (payload.removeOld) {
              deleteFile(oldPath).catch((e) => {
                reject(Error(`Failed to delete project from old location.\n${e}`))
              }).then(() => {
                resolve('Successfully updated project location.')
              })
            }
          }).catch((e) => {
            reject(Error(`Failed to save project to new location.\n${e}`))
          }).then(() => {
            resolve('Successfully updated project location.')
          })
        }).catch((e) => {
          reject(Error(`Failed to load project from old location.\n${e}`))
        })
      })
    },
    fetchProject(payload: { config?: ProjectConfig, fullPath?: string }) {
      const { config, fullPath } = payload
      if (config) {
        const fileName = config.name.replace(' ', '-') + '.json'
        const directory = config.localSaveDirectory
        return loadFile(directory + fileName)
      }
      if (fullPath) {
        return loadFile(fullPath)
      }
      return Promise.reject(Error('Wrong parameters provided for fetchProject operation.'))
    },
    saveProject(payload: { config: ProjectConfig, data: Project, autosave?: boolean }) {
      const directory = payload.config.localSaveDirectory
      const fileName = payload.config.name.replace(' ', '-') + '.json'
      return saveFile(directory, fileName, payload.data)
    },
    selectDirectoryDialog(payload: { buttonLabel: string, defaultPath: string }) {
      const win = getWindow()
      if (!win) return Promise.reject(getError('No browser window found'))

      return dialog.showOpenDialog(win, {
        defaultPath: payload.defaultPath || defaultProjectsDirectory,
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: payload.buttonLabel || 'Select directory'
      }).then((data: { canceled: boolean, filePaths: string[] }) => {
        const { canceled, filePaths } = data
        return { canceled, directory: filePaths[0] }
      })
    },
    selectFileDialog(payload: { buttonLabel: string, defaultPath: string }) {
      const win = getWindow()
      if (!win) return Promise.reject(getError('No browser window found'))

      return dialog.showOpenDialog(win, {
        defaultPath: defaultProjectsDirectory,
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
  }

  const setupListeners = () => {
    (Object.keys(handlers) as Array<keyof typeof handlers>).forEach((operationType) => {
      ipcMain.on(operationType, (event, request: IpcRequest) => {
        console.log(`On: ${operationType}`)
        console.log(`Received request: ${JSON.stringify(request)}`)
        operationWrapper(event, request.opType, request.exchangeId, handlers[operationType](request.payload || {}))
      })
    })
  }

  setupListeners()
}
