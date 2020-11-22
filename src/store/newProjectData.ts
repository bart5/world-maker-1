import { builtInTypes } from './builtInTypes'
import { getNewProjectUiData } from './builtInData'

export default function getNewProject(): Project {
  return {
    instances: {},
    types: { ...builtInTypes },
    recentChanges: [{
      id: 'initialState',
      actionType: 'initialState',
      changes: []
    }],
    uiData: {
      ...getNewProjectUiData()
    }
  }
}
