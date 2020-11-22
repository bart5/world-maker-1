export function getBuiltInTypes(): TypesDefinitions {
  return {
    'quest': {
      id: 'quest',
      name: 'Quest',
      definition: {
        ...getBasicTypeDef(),
        name: getPropDef('string', 'name', 0),
        prop2: getPropDef('int32', 'prop2', 1)
      }
    },
    'task': {
      id: 'task',
      name: 'Task',
      definition: {
        ...getBasicTypeDef(),
        prop1: getPropDef('int32', 'prop1', 0),
        prop2: getPropDef('flt', 'prop2', 1),
        prop3: getPropDef('string', 'prop3', 2),
        prop4: getPropDef('bool', 'prop4', 3),
        prop5: getPropDef('int32', 'prop5', 4, true),
        prop6: getPropDef('flt', 'prop6', 5, true),
        prop7: getPropDef('string', 'prop7', 6, true),
        prop8: getPropDef('bool', 'prop8', 7, true),
      }
    },
    'dialog': {
      id: 'dialog',
      name: 'Dialog',
      definition: {
        ...getBasicTypeDef(),
        prop1: getPropDef('int32', 'prop1', 0),
        prop2: getPropDef('flt', 'prop2', 1),
        prop3: getPropDef('string', 'prop3', 2),
        prop4: getPropDef('bool', 'prop4', 3),
        prop5: getPropDef('int32', 'prop5', 4, true),
        prop6: getPropDef('flt', 'prop6', 5, true),
        prop7: getPropDef('string', 'prop7', 6, true),
        prop8: getPropDef('bool', 'prop8', 7, true),
      }
    },
  }
}

function getTypesWorkspace(): Workspace {
  return {
    id: 'types',
    type: 'types',
    name: 'Types',
    order: 1,
    activeBoardId: 'types',
  }
}

function getQuestsWorkspace(): Workspace {
  return {
    id: 'quests',
    type: 'quests',
    name: 'Quests',
    order: 2,
    activeBoardId: '',
  }
}

function getDialogsWorkspace(): Workspace {
  return {
    id: 'dialogs',
    type: 'dialogs',
    name: 'Dialogs',
    order: 3,
    activeBoardId: '',
  }
}

export function getBoardConfig(): BoardConfig {
  return {
    width: 10000,
    height: 10000,
    modulus: 1,
    fitToTiles: false,
    lockScale: false,
    lockedScale: 1,
    lockView: false,
    lockedViewPosition: {},
    lockTiles: false,
  }
}

function getTypesBoard(): Board {
  return {
    id: 'types',
    tiles: [],
    config: { ...getBoardConfig() },
    camera: null,
  }
}

export function getEmptyBoard(id: string): Board {
  return {
    id,
    tiles: [],
    config: { ...getBoardConfig() },
    camera: null,
  }
}

export function getNewProjectUiData() {
  const uiData: UiData = {
    workspaces: [
      { ...getTypesWorkspace() },
      { ...getQuestsWorkspace() },
      { ...getDialogsWorkspace() },
    ],
    boards: {
      types: { ...getTypesBoard() },
    },
    activeWorkspaceId: 'types',
  }
  return uiData
}

export function getNewProject(): Project {
  console.log('getting new project')
  return {
    instances: {},
    types: { ...getBuiltInTypes() },
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

export function getPropDef<T = Values>(
  valueType: ValueType, name: string, order = 1000, isArray = false, refTargetTypeId = ''
): PropDefinition {
  return {
    valueType,
    name,
    isArray,
    refTargetTypeId,
    order: name.startsWith('meta') ? -2 : name === 'id' ? -1 : order
  }
}

export function getBasicTypeDef(): TypeDefinition {
  return {
    id: getPropDef('int32', 'id', -1),
    meta_isBoundTo: getPropDef('int32', 'meta_isBoundTo', -2, true),
    meta_typeId: getPropDef('int32', 'meta_typeId'),
    meta_isReferencing: getPropDef('int32', 'meta_isReferencing', -2, true),
    meta_isReferencedBy: getPropDef('int32', 'meta_isReferencedBy', -2, true),
    meta_isLocked: getPropDef('bool', 'meta_isLocked'),
  }
}

export function getNewTypeData(): TypeDefinition {
  return {
    ...getBasicTypeDef()
  }
}

export function getNewInstanceData(state: ApplicationState, tId: string, uid: string): Instance {
  const instance = Object.entries(state.project.types[tId].definition).reduce((acc, [pN]) => {
    if (pN === 'id' || pN.startsWith('meta')) return acc
    return {
      ...acc,
      [pN]: [],
    }
  }, {})
  return {
    ...instance,
    id: [uid],
    meta_isBoundTo: [],
    meta_typeId: [tId],
    meta_isReferencing: [],
    meta_isReferencedBy: [],
    meta_isLocked: [false],
  }
}
