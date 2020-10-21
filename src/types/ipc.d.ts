type opType =
  'loadApplicationData'
  | 'updateApplicationData'
  | 'fetchProject'
  | 'saveProject'
  | 'testPath'
  | 'selectDirectoryDialog'
  | 'selectFileDialog'
  | 'backupProject'
  | 'saveProjectAs'

type operationResponseType = 'reply' | 'error'

type menuSignal =
  'startNewProject'
  | 'openExistingProject'
  | 'saveProject'
  | 'saveProjectAs'
  | 'showApplicationConfiguration'
  | 'closeApplication'
  | 'showTypesEditor'

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
