type opType =
  'loadApplicationData'
  | 'saveApplicationData'
  | 'testPath'
  | 'updateProjectPaths'
  | 'updateApplicationData'

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
  data?: any,
}
