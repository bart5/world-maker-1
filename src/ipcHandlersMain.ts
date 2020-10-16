import { ipcMain, WebContents, app } from 'electron'
import fs from 'fs'

const appDataDirectory = app.getPath('appData')
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
        resolve({})
      } else {
        console.log(`Success loading data from file: ${path}`)
        const parsed = JSON.parse(data.toString())
        resolve(parsed)
      }
    });
  })
}

const getError = (error: Error | NodeJS.ErrnoException | null, message: string) => {
  message = message || 'Caught error.'
  if (error) {
    return Error(`${message}\n${error}`)
  }
}

function saveFile(directory: string, fileName: string, data: any = {}) {
  const dir = directory === '/' ? directory : directory.replace(/$\//, '')
  const fName = fileName.replace('/', '')
  const path = `${dir}/${fName}`
  return new Promise((resolve, reject) => {
    /* Save file as .temp */
    fs.writeFile(`${path}.temp`, JSON.stringify(data), (err) => {
      if (err) return reject(getError(err, `Error saving data for file in path: ${path}`))
      console.info(`Success saving data to file: ${path}`)

      /* Check for existance of old version */
      return fs.readdir(dir, (err1, files) => {
        if (err1) return reject(getError(err, `Error trying to read the directory: ${dir}`))
        console.info(`Success reading directory: ${dir}`)

        const oldVersion = files.filter((file) => file === fName)[0]
        /* Delete old version if exists */
        if (oldVersion) {
          deleteFile(path).catch((e) => {
            return reject(getError(e, `Could not delete old version of the file in path: ${path}.\n${e}`))
          })
          console.info(`Success deleting file: ${path}`)
        }

        /* Remove .temp appendix from the new file */
        return fs.rename(`${path}.temp`, path, (err2) => {
          if (err2) return reject(getError(err2, `Could not rename file: ${path}.temp`))
          console.info(`Success renaming file to: ${path}`)

          return resolve(`Successfully saved file ${fileName} in ${directory}`)
        })
      })
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

export default function setupCommunicaton() {
  console.info('Setting up IPC communication.')

  const handlers: {[key in opType]: (data?: any) => Promise<any> } = {
    testPath(path) {
      const testFile = 'testFile.test'
      return saveFile(path, testFile, '').then(() => deleteFile(`${path}/${testFile}`))
    },
    loadApplicationData() {
      return loadFile(`${appDataDirectory}/${appDataFile}`).then((data) => {
        if (data === {}) {
          const defaultAppData: ApplicationData = {
            projects: {},
            lastProjectId: '',
            defaultLocalPath: defaultProjectsDirectory
          }
          return new Promise((resolve, reject) => {
            saveFile(appDataDirectory, appDataFile, defaultAppData).then(() => {
              resolve(defaultAppData)
            }).catch((e) => {
              reject(Error(`Failed creating default app data.\n${e}`))
            })
          })
        }
        return Promise.resolve(data)
      })
    },
    updateApplicationData(data) {
      return saveFile(appDataDirectory, appDataFile, data)
    },
    updateProjectPaths(data: { oldConfig: ProjectConfig, newConfig: ProjectConfig, removeOld: boolean }) {
      const newPath = data.newConfig.localSaveDirectory
      const oldPath = data.oldConfig.localSaveDirectory
      return new Promise((resolve, reject) => {
        (loadFile(oldPath) as Promise<Project>).then((project) => {
          const fileName = data.newConfig.name.replace(' ', '-') + '.json'
          saveFile(newPath, fileName, project).then(() => {
            if (data.removeOld) {
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
    fetchProject(config: ProjectConfig) {
      const fileName = config.name.replace(' ', '-') + '.json'
      return loadFile(config.localSaveDirectory + fileName)
    },
    saveProject(payload: { config: ProjectConfig, data: Project, autosave?: boolean }) {
      const directory = payload.config.localSaveDirectory
      const fileName = payload.config.name.replace(' ', '-') + '.json'
      return saveFile(directory, fileName, payload.data)
    },
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
