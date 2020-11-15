const initialState: ApplicationState = {
  applicationData: null,
  project: {} as Project,
  projectUiDataMutated: false,
  currentTransaction: null,
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
    activeWidgetKey: 0,
    lastSavedTransactionId: '',
    lastRevertedTransactions: [],
  }
}

export default initialState
