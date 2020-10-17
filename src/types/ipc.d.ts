type opType =
  'loadApplicationData'
  | 'updateApplicationData'
  | 'updateProjectPaths'
  | 'fetchProject'
  | 'saveProject'
  | 'testPath'
  | 'selectDirectoryDialog'
  | 'selectFileDialog'
  | 'backupProject'
  | 'openProjectFolder'
  | 'saveProjectAs'

type operationResponseType = 'reply' | 'error'

type menuSignal =
  'startNewProject'
  | 'openExistingProject'
  | 'saveProject'
  | 'saveProjectAs'
  | 'showCurrentProjectConfiguration'
  | 'closeApplication'

interface IpcReply {
  opType: opType;
  exchangeId: string
  data: any;
}

interface IpcRequest {
  opType: opType;
  exchangeId: string
  payload?: any,
}
