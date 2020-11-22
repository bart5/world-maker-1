import { builtInTypes } from './builtInTypes'
import { getNewProjectUiData } from './builtInData'

export default function getNewProject(): Project {
  return {
    instances: {
      ...(Object.entries(builtInTypes).reduce((acc, [, tw]) => ({ ...acc, [tw.id]: {} }), {}))
    },
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
