import { ActionContext } from 'vuex'

/* Shallow */
export function validateProjectDataKeys(data: any) {
  return Object.keys(data).every((k) => Object.keys(getNewProjectTemplate()).some((dk) => dk === k))
}

// export function getWorkspaceConfigurationDefaults() {
//   const workspaceConfiguration: WorkspaceConfiguration = {
//     modulus: 1,
//     fitToTiles: false,
//     lockScale: false,
//     lockedScale: 1,
//     lockView: false,
//     lockedViewPosition: {},
//     lockTiles: false,
//     lastSessionCamera: null,
//   }
//   return workspaceConfiguration
// }

// export function getWorkspaceDefaults() {
//   const workspace: Workspace = {
//     id: `workspace_${Date.now()}${Math.random()}`,
//     name: 'New Workspace',
//     order: 1,
//     configuration: {
//       ...getWorkspaceConfigurationDefaults()
//     }
//   }
//   return workspace
// }

export function getBoardConfig(): BoardConfigConfig {
  return {
    modulus: 1,
    fitToTiles: false,
    lockScale: false,
    lockedScale: 1,
    lockView: false,
    lockedViewPosition: {},
    lockTiles: false,
  }
}

export function getBoardDefaults(instanceId: string): Board {
  return {
    id: instanceId,
    tiles: [],
    config: { ...getBoardConfig() },
    camera: null,
  }
}

export function getWorkspaceDefaults(): Workspace {
  return {
    id: getUniqueId(),
    type: 'basic',
    name: 'Basic WS 1',
    order: 1,
    selectedInstance: 'types',
  }
}

export function getNewProjectUiData() {
  const workspaceDefaults = getWorkspaceDefaults()
  const uiData: UiData = {
    workspaces: [{
      ...workspaceDefaults
    }],
    boards: {
      'types': {
        ...getBoardDefaults('types')
      }
    },
    activeWorkspaceId: workspaceDefaults.id,
  }
  return uiData
}

export function getUniqueTypeName(state: ApplicationState) {
  let affix = 1
  const getNewName = () => 'NewType' + affix
  const isUnique = (n: string) => !Object.entries(state.project.types).some(([, tw]) => tw.name === n)
  while (!isUnique(getNewName()) && affix < 1000) {
    affix++
  }
  return getNewName()
}

export function getUniquePropName(state: ApplicationState, tId: string) {
  let affix = 1
  const getNewName = () => 'NewProp' + affix
  const isUnique = (n: string) => !Object.keys(state.project.types[tId].definition).some((pN) => pN === n)
  while (!isUnique(getNewName()) && affix < 1000) {
    affix++
  }
  return getNewName()
}

export function oToA<T>(o: {[k: string]: T}): Array<T> {
  return Object.entries(o).map(([, v]) => v)
}

export function getUniqueId(state?: ApplicationState) {
  const getId = () => Math.random().toString().substring(10)
  if (!state) return getId()

  const isUnique = (id: string) => {
    const types = state.project.types
    return !Object.entries(types).some(([tId]) => {
      if (tId === id) return true // Already used for type
      return id in state.project.instances[tId] // Already used for some instance
    })
  }
  let uid = getId()
  let i = 0
  while (!isUnique(uid) && i < 1000) {
    uid = getId()
    i++
  }
  return uid
}

// We want to get all instances where at least one of it'd ref-type props
// has right now given instance as it's value
export function getReferencingInstances(
  targetInstId: string,
  st: ActionContext<ApplicationState, ApplicationState>
) {
  const referencingInstancesIds: string[] = []

  const instanceType: TypeWrapper = st.getters.getType({ instanceId: targetInstId })

  const potentialRefPointers: Array<{ typeId: string, props: string[] }> = []

  oToA(st.state.project.types).forEach((wrapper) => {
    const pointer = {
      typeId: wrapper.id,
      props: [] as string[]
    }

    oToA(wrapper.definition).forEach((propDef) => {
      if (propDef.refTargetTypeId === instanceType.id) {
        pointer.props.push(propDef.name)
      }
    })

    if (pointer.props.length > 0) potentialRefPointers.push(pointer)
  })

  potentialRefPointers.forEach(({ typeId, props }) => {
    oToA(st.state.project.instances[typeId]).forEach((instance) => {
      const hasActiveRef = props.some((propName) => instance[propName].length > 0)
      if (hasActiveRef) referencingInstancesIds.push(instance.id[0])
    })
  })

  return referencingInstancesIds
}

export function getNewTypeData(): TypeDefinition {
  return {
    ...getBasicTypeDef()
  }
}

export function getInitialPropValues(propDef: PropDefinition) {
  if (propDef.valueType === 'int32') return [0]
  if (propDef.valueType === 'ref') return ['']
  if (propDef.valueType === 'flt') return [0]
  if (propDef.valueType === 'string') return ['placeholder']
  return [false]
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

export function getMockedTypesDefinitions(): TypesDefinitions {
  return {
    111111: {
      id: '111111',
      name: 'type1',
      definition: {
        ...getBasicTypeDef(),
        prop1: getPropDef('int32', 'prop1', 0),
        prop2: getPropDef('int32', 'prop2', 1)
      }
    },
    222222: {
      id: '222222',
      name: 'type2',
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

// Mocking does not support references
export function getMockedInstance(typeId: number, types?: TypesDefinitions): Instance {
  const id = Math.random().toString().substring(10)
  const assignValues = (prop: PropDefinition): PropValues => {
    if (prop.name.startsWith('meta')) {
      if (prop.name === 'meta_typeId') return [typeId]
      return []
    } else if (prop.name === 'id') return [id]

    const getValues = (valueType: ValueType, isArray?: boolean) => {
      const getValue = (vT: ValueType) => {
        if (vT === 'int32') {
          // if (prop.name === 'id') {
          //   return id
          // } else if (prop.name === 'meta_typeId') {
          //   return typeId
          // } else if (prop.name.includes('meta')) {
          //   return ''
          // }
          return Math.round(Math.random() * 100)
        } else if (vT === 'flt') {
          return (Math.random() * 100).toFixed(5)
        } else if (vT === 'string') {
          const pieces = ['qe', 'ra', 'lok', 'nu', 've', 'zis', 'foc', 'wam', 'kud', 'ryx', 'kor'];
          const getWord = () => {
            return Array(Math.round(Math.random() * 5)).fill(0).map((piece) => {
              piece = pieces[Math.round(Math.random() * pieces.length)]
              return piece
            }).join('')
          }

          const getSentence = () => {
            return (Array(Math.round(Math.random() * 7)).fill(0).map((w, i, ar) => {
              w = (i === 0
                ? getWord().split('').map((l, li) => ((li === 0) ? l.toUpperCase() : l)).join('')
                : getWord()) + ((Math.random() < 0.18 && i < ar.length - 1) ? ',' : '')
              return w
            }).join(' ') + '.')
          }

          return getSentence()
        } else /* (if (vT === 'boolean')) */ {
          return Boolean(Math.round(Math.random()))
        }
      }

      const length = isArray ? (Math.round((Math.random() * 8) || 1)) : 1;

      return Array(length).fill(0).map(() => getValue(valueType)) as ValueType[]
    }

    return getValues(prop.valueType, prop.isArray)
  }

  const props = types ? types[typeId].definition : getMockedTypesDefinitions()[typeId].definition
  const Instance: Instance = Object.entries(props).reduce((acc, [pN, pDef]) => {
    return {
      ...acc,
      [pN]: assignValues(pDef)
    }
  }, {} as Instance)

  return Instance
}

export function getMockedInstances(): Instances {
  const getType = (typeId: number) => {
    const instance = getMockedInstance(typeId)
    const id = (instance.id as PropValues)[0] as number
    return {
      [id]: {
        ...instance
      }
    }
  }
  return {
    111111: {
      ...getType(111111),
      ...getType(111111),
      ...getType(111111),
      ...getType(111111)
    },
    222222: {
      ...getType(222222),
      ...getType(222222),
      ...getType(222222),
      ...getType(222222)
    },
  }
}

export function getNewProjectTemplate(): Project {
  return {
    instances: { ...getMockedInstances() },
    types: { ...getMockedTypesDefinitions() },
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

export function copyTypeWrapper(source: TypeWrapper): TypeWrapper {
  return {
    id: source.id,
    name: source.name,
    definition: copyTypeDef(source.definition)
  }
}

export function copyTypeDef(source: TypeDefinition) {
  return Object.entries(source).reduce((acc, [propName, propDef]) => {
    acc[propName] = copyPropDef(propDef)
    return acc
  }, {} as TypeDefinition)
}

export function copyPropDef(source: PropDefinition): PropDefinition {
  return {
    ...source,
  }
}

export function copyInstance(source: Instance) {
  return Object.entries(source).reduce((acc, [propName, prop]) => {
    acc[propName] = copyPropValues(prop)
    return acc
  }, {} as Instance)
}

export function copyPropValues(source: PropValues): PropValues {
  return [...source]
}

export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}
