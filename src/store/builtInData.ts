export const workspaceTypes: WorkspaceType[] = ['types', 'quest', 'dialog', 'table']
export const typesWithBoards = ['quest', 'dialog']
export const typesWithTiles: TileType[] = ['questNode', 'dialogNode']

export const builtInWorkspaces = [
  {
    id: 'types',
    type: 'types',
    name: 'Types',
    order: 1,
    activeBoardId: 'types',
  }
]

export const builtInBoards = {
  types: {
    id: 'types',
    tiles: [],
    config: { ...getBoardConfig() },
    camera: null,
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
      ...builtInWorkspaces,
      {
        id: 'quests',
        type: 'quest',
        name: 'Quests',
        order: 2,
        activeBoardId: '',
      },
      {
        id: 'dialogs',
        type: 'dialog',
        name: 'Dialogs',
        order: 3,
        activeBoardId: '',
      },
      {
        id: 'table',
        type: 'table',
        name: 'Dialogs',
        order: 4,
        activeBoardId: '',
      },
    ],
    boards: {
      ...builtInBoards,
    },
    activeWorkspaceId: 'types',
  }
  return uiData
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
