import { ActionContext } from 'vuex'

/* Shallow */
export function validateProjectDataKeys(data: any) {
  return Object.keys(data).every((k) => Object.keys(getNewProjectTemplate()).some((dk) => dk === k))
}

export function getWorkspaceConfigurationDefaults() {
  const workspaceConfiguration: WorkspaceConfiguration = {
    modulus: 1,
    fitToTiles: false,
    lockScale: false,
    lockedScale: 1,
    lockView: false,
    lockedViewPosition: {},
    lockTiles: false,
    lastSessionCamera: null,
  }
  return workspaceConfiguration
}

export function getWorkspaceDefaults() {
  const workspace: Workspace = {
    id: `workspace_${Date.now()}${Math.random()}`,
    name: 'New Workspace',
    order: 1,
    configuration: {
      ...getWorkspaceConfigurationDefaults()
    }
  }
  return workspace
}

export function getNewProjectUiData() {
  const workspaceDefaults = getWorkspaceDefaults()
  const uiData: UiData = {
    workspaces: [{
      ...workspaceDefaults
    }],
    tiles: [],
    activeWorkspaceId: workspaceDefaults.id,
  }
  return uiData
}

export function getUniqueTypeName(state: ApplicationState) {
  let affix = 1
  const getNewName = () => 'NewType' + affix
  const isUnique = (n: string) => !Object.keys(state.project.types).some((tn) => tn === n)
  while (!isUnique(getNewName()) && affix < 1000) {
    affix++
  }
  return getNewName()
}

export function getUniquePropName(state: ApplicationState, tId: string) {
  let affix = 1
  const getNewName = () => 'NewProp' + affix
  const isUnique = (n: string) => !Object.keys(state.project.types[tId]).some((tn) => tn === n)
  while (!isUnique(getNewName()) && affix < 1000) {
    affix++
  }
  return getNewName()
}

export function oToA<T>(o: {[k: string]: T}): Array<T> {
  return Object.entries(o).map(([, v]) => v)
}

export function getUniqueId(state: ApplicationState) {
  const getId = () => Date.now().toString().substring(3).substring(-1)
  const isUnique = (id: string) => {
    const types = state.project.types
    return !Object.keys(types).some(([typeId]) => {
      if (typeId === id) return true

      const instances = state.project.instances[typeId]
      return Object.keys(instances).some(([instanceId]) => {
        return instanceId === id
      })
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

/**
 * Get all props of type A that reference type B
 */
export function getPropsOfTypeAWithRefToTypeB(
  st: ActionContext<ApplicationState, ApplicationState>,
  p: {
    typeAId?: string, typeBId?: string, instAId?: string, instBId?: string,
  },
) {
  const { instAId, instBId, typeAId } = p
  let { typeBId } = p
  const typeA: TypeWrapper = st.getters.getType({ typeId: typeAId }, instAId)
  const typeB: TypeWrapper = st.getters.getType({ typeId: typeBId }, instBId)
  typeBId = typeBId || typeB.id
  const propNames: string[] = []
  Object.entries(typeA.definition).forEach(([, prop]) => {
    if (prop.refTargetTypeId === typeBId) {
      propNames.push(prop.name)
    }
  })
  return propNames
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
    id: getPropDef('int32', 'id'),
    meta_typeId: getPropDef('int32', 'meta_typeId'),
    meta_isBoundTo: getPropDef('int32', 'meta_isBoundTo', true),
    meta_isReferencing: getPropDef('int32', 'meta_isReferencing', true),
    meta_isReferencedBy: getPropDef('int32', 'meta_isReferencedBy', true),
    meta_isLocked: getPropDef('bool', 'meta_isLocked'),
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
    if (pN === 'id' || pN.includes('meta')) return acc
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
  valueType: ValueType, name: string, isArray = false, refTargetTypeId = ''
): PropDefinition {
  return {
    valueType,
    name,
    isArray,
    refTargetTypeId
  }
}

export function getMockedTypesDefinitions(): TypesDefinitions {
  return {
    111111: {
      id: '111111',
      name: 'type1',
      definition: {
        id: getPropDef('int32', 'id'),
        meta_isBoundTo: getPropDef('int32', 'meta_isBoundTo', true),
        meta_typeId: getPropDef('int32', 'meta_typeId'),
        meta_isReferencing: getPropDef('int32', 'meta_isReferencing', true),
        meta_isReferencedBy: getPropDef('int32', 'meta_isReferencedBy', true),
        meta_isLocked: getPropDef('bool', 'meta_isLocked'),
        prop1: getPropDef('int32', 'prop1'),
        prop2: getPropDef('int32', 'prop2')
      }
    },
    222222: {
      id: '222222',
      name: 'type1',
      definition: {
        id: getPropDef('int32', 'id'),
        meta_isBoundTo: getPropDef('int32', 'meta_isBoundTo', true),
        meta_typeId: getPropDef('int32', 'meta_typeId'),
        meta_isReferencing: getPropDef('int32', 'meta_isReferencing', true),
        meta_isReferencedBy: getPropDef('int32', 'meta_isReferencedBy', true),
        meta_isLocked: getPropDef('bool', 'meta_isLocked'),
        prop1: getPropDef('int32', 'prop1'),
        prop2: getPropDef('flt', 'prop2'),
        prop3: getPropDef('string', 'prop3'),
        prop4: getPropDef('bool', 'prop4'),
        prop5: getPropDef('int32', 'prop5', true),
        prop6: getPropDef('flt', 'prop6', true),
        prop7: getPropDef('string', 'prop7', true),
        prop8: getPropDef('bool', 'prop8', true),
      }
    },
  }
}

export function getMockedInstance(typeName: string, typeId: number, types?: TypesDefinitions): Instance {
  const id = Date.now().toString().substring(3).substring(-1)
  const assignValues = (prop: PropDefinition): PropValues => {
    const getValues = (valueType: ValueType, isArray?: boolean) => {
      const getValue = (vT: ValueType) => {
        if (vT === 'int32') {
          if (prop.name === 'id') {
            return id
          } else if (prop.name === 'meta_typeId') {
            return typeId
          }
          return Math.round(Math.random() * 100)
        } else if (vT === 'flt') {
          return (Math.random() * 100).toFixed(5)
        } else if (vT === 'string') {
          const pieces = ['qe', 'ra', 'lok', 'nu', 've', 'zis', 'foc', 'wam', 'kud', 'ryx', 'kor'];
          const getWord = () => {
            return new Array(Math.round(Math.random() * 5)).map((t) => {
              t = pieces[Math.round(Math.random() * pieces.length)]
              return t
            }).join()
          }

          const getSentence = () => {
            return (new Array(Math.round(Math.random() * 7)).map((w, i) => {
              w = (i === 0
                ? getWord().split('').map((l, li) => ((li === 0) ? l.toUpperCase() : l))
                : getWord()) + (Math.random() < 0.2 ? ',' : '')
              return w
            }).join(' ') + '.')
          }

          return getSentence()
        } else /* (if (vT === 'boolean')) */ {
          return Boolean(Math.round(Math.random()))
        }
      }

      const length = isArray ? (Math.round(Math.random() * 4)) : 1;

      return Array(length).map(() => getValue(valueType)) as ValueType[]
    }

    return getValues(prop.valueType, prop.isArray)
  }

  const props = types ? types[typeId].definition : getMockedTypesDefinitions()[typeName].definition
  const Instance: Instance = Object.entries(props).reduce((acc, [pN, pDef]) => {
    return {
      ...acc,
      [pN]: assignValues(pDef)
    }
  }, {} as Instance)

  return Instance
}

export function getMockedInstances(): Instances {
  const getType = (typeName: string, typeId: number) => {
    const instance = getMockedInstance(typeName, typeId)
    return {
      [(instance.id as PropValues)[0] as number]: {
        ...instance
      }
    }
  }
  return {
    type1: {
      ...getType('type1', 0),
      ...getType('type1', 0),
      ...getType('type1', 0),
      ...getType('type1', 0)
    },
    type2: {
      ...getType('type2', 1),
      ...getType('type2', 1),
      ...getType('type2', 1),
      ...getType('type2', 1)
    },
  }
}

export function getNewProjectTemplate() {
  const project: Project = {
    instances: getMockedInstances(),
    types: getMockedTypesDefinitions(),
    recentChanges: [],
    uiData: {
      ...getNewProjectUiData()
    }
  }
  return project
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
