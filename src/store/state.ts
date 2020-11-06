const initialState: ApplicationState = {
  applicationData: null,
  project: {} as Project,
  projectUiDataMutated: false,
  projectInstancesMutated: false,
  projectEntityBindingsMutated: false,
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
