const initialState: ApplicationState = {
  applicationData: null,
  project: {} as Project,
  projectUiDataMutated: false,
  projectStaticDataMutated: false,
  projectEntityBindingsMutated: false,
  changedTypes: {
    created: [],
    edited: [],
    removed: [],
  },
  changedInstances: {
    created: [],
    edited: [],
    removed: [],
  },
  ui: {
    connectingInProgress: false,
    tileDeletionInProgress: false,
    workspaceDeletionInProgress: false,
    selectedInputSourceTile: '',
    projectDataIsLoaded: false,
    openingProjectInProgress: false,
    savingProjectInProgress: false,
    activeModal: null,
    lastProjectSaveTime: '',
    lastProjectLoadTime: '',
    frameData: null,
  }
}

export default initialState
